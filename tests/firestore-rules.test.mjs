import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';

let testEnv;

before(async () => {
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  assert.ok(emulatorHost, 'Run these tests with the Firestore emulator.');
  const [host, port] = emulatorHost.split(':');
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-solardesk-rules',
    firestore: {
      host,
      port: Number(port),
      rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8')
    }
  });

  await testEnv.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, 'workspaces/tenant-a'), {
        name: 'Company A', plan: 'starter', active: true, activeUserCount: 2
      }),
      setDoc(doc(db, 'workspaces/tenant-b'), {
        name: 'Company B', plan: 'scale', active: true, activeUserCount: 1
      }),
      setDoc(doc(db, 'users/owner-a'), {
        name: 'Owner A', email: 'owner-a@example.com', role: 'admin',
        active: true, tenantId: 'tenant-a'
      }),
      setDoc(doc(db, 'users/super-admin-a'), {
        name: 'Super Admin', email: 'super-admin@example.com', role: 'super_admin',
        active: true, tenantId: 'tenant-a'
      }),
      setDoc(doc(db, 'users/owner-b'), {
        name: 'Owner B', email: 'owner-b@example.com', role: 'admin',
        active: true, tenantId: 'tenant-b'
      }),
      setDoc(doc(db, 'leads/lead-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a', createdBy: 'owner-a'
      }),
      setDoc(doc(db, 'leads/lead-b'), {
        tenantId: 'tenant-b', assignedTo: 'owner-b', createdBy: 'owner-b'
      }),
      setDoc(doc(db, 'payments/payment-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a'
      }),
      setDoc(doc(db, 'loans/loan-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a'
      }),
      setDoc(doc(db, 'inventory/item-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a'
      }),
      setDoc(doc(db, 'catalog/catalog-a'), {
        tenantId: 'tenant-a', name: 'Solar panel'
      }),
      setDoc(doc(db, 'stockMovements/movement-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a'
      })
    ]);
  });
});

after(async () => {
  await testEnv?.cleanup();
});

test('enforces tenant boundaries, plan features, and seat caps', async () => {
  const db = testEnv.authenticatedContext('owner-a').firestore();
  const superAdminDb = testEnv.authenticatedContext('super-admin-a').firestore();

  await assertSucceeds(getDoc(doc(db, 'leads/lead-a')));
  await assertFails(getDoc(doc(db, 'leads/lead-b')));
  await assertSucceeds(getDocs(query(
    collection(db, 'leads'),
    where('tenantId', '==', 'tenant-a')
  )));
  await assertFails(getDocs(collection(db, 'leads')));
  await assertSucceeds(getDoc(doc(db, 'catalog/catalog-a')));
  await assertFails(getDoc(doc(db, 'payments/payment-a')));
  await assertFails(getDoc(doc(db, 'inventory/item-a')));

  await assertFails(updateDoc(doc(db, 'workspaces/tenant-a'), {
    plan: 'business',
    updatedAt: new Date().toISOString()
  }));
  await assertFails(updateDoc(doc(db, 'users/owner-a'), { role: 'super_admin' }));
  await assertSucceeds(updateDoc(doc(superAdminDb, 'workspaces/tenant-a'), {
    plan: 'business',
    updatedAt: new Date().toISOString()
  }));
  await assertSucceeds(getDoc(doc(db, 'payments/payment-a')));
  await assertSucceeds(getDoc(doc(db, 'loans/loan-a')));
  await assertFails(getDoc(doc(db, 'inventory/item-a')));

  await assertSucceeds(updateDoc(doc(superAdminDb, 'workspaces/tenant-a'), {
    plan: 'scale',
    updatedAt: new Date().toISOString()
  }));
  await assertSucceeds(getDoc(doc(db, 'inventory/item-a')));
  await assertSucceeds(getDoc(doc(db, 'stockMovements/movement-a')));

  const addActiveSalesUser = userId => runTransaction(db, async transaction => {
    const userRef = doc(db, `users/${userId}`);
    const workspaceRef = doc(db, 'workspaces/tenant-a');
    const [user, workspace] = await Promise.all([
      transaction.get(userRef),
      transaction.get(workspaceRef)
    ]);
    assert.equal(user.exists(), false);
    const activeUserCount = workspace.data().activeUserCount + 1;
    transaction.update(workspaceRef, {
      activeUserCount,
      lastSeatChangeUid: userId,
      lastSeatChangeAction: 'activate',
      updatedAt: new Date().toISOString()
    });
    transaction.set(userRef, {
      name: userId,
      email: `${userId}@example.com`,
      role: 'sales',
      active: true,
      tenantId: 'tenant-a'
    });
  });

  await assertSucceeds(addActiveSalesUser('sales-a'));
  await assertSucceeds(addActiveSalesUser('sales-b'));
  await assertSucceeds(addActiveSalesUser('sales-c'));
  await assertSucceeds(addActiveSalesUser('sales-d'));
  await assertSucceeds(updateDoc(doc(superAdminDb, 'workspaces/tenant-a'), {
    plan: 'starter',
    updatedAt: new Date().toISOString()
  }));
  assert.equal((await getDoc(doc(db, 'workspaces/tenant-a'))).data().activeUserCount, 6);
  await assertSucceeds(getDoc(doc(db, 'users/sales-a')));

  const changeSalesAccess = (userId, active) => runTransaction(db, async transaction => {
    const userRef = doc(db, `users/${userId}`);
    const workspaceRef = doc(db, 'workspaces/tenant-a');
    const [user, workspace] = await Promise.all([
      transaction.get(userRef),
      transaction.get(workspaceRef)
    ]);
    assert.equal(user.exists(), true);
    const activeUserCount = workspace.data().activeUserCount + (active ? 1 : -1);
    transaction.update(workspaceRef, {
      activeUserCount,
      lastSeatChangeUid: userId,
      lastSeatChangeAction: active ? 'activate' : 'deactivate',
      updatedAt: new Date().toISOString()
    });
    transaction.update(userRef, { active });
  });

  await assertSucceeds(changeSalesAccess('sales-a', false));
  assert.equal((await getDoc(doc(db, 'workspaces/tenant-a'))).data().activeUserCount, 5);
  await assertFails(changeSalesAccess('sales-a', true));
  await assertFails(setDoc(doc(db, 'users/over-limit'), {
    name: 'Over limit',
    email: 'over-limit@example.com',
    role: 'sales',
    active: true,
    tenantId: 'tenant-a'
  }));
  await assertFails(addActiveSalesUser('over-limit-transaction'));
});
