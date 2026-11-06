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
  where,
  writeBatch
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
        name: 'Company A', plan: 'starter', active: true, activeUserCount: 1
      }),
      setDoc(doc(db, 'workspaces/tenant-b'), {
        name: 'Company B', plan: 'scale', active: true, activeUserCount: 1
      }),
      setDoc(doc(db, 'tenantDirectory/tenant-a'), {
        name: 'Company A', plan: 'starter', active: true, activeUserCount: 1
      }),
      setDoc(doc(db, 'tenantDirectory/tenant-b'), {
        name: 'Company B', plan: 'scale', active: true, activeUserCount: 1
      }),
      setDoc(doc(db, 'users/owner-a'), {
        name: 'Owner A', email: 'owner-a@example.com', role: 'admin',
        active: true, tenantId: 'tenant-a'
      }),
      setDoc(doc(db, 'users/super-admin-a'), {
        name: 'Super Admin', email: 'super-admin@example.com', role: 'super_admin',
        active: true
      }),
      setDoc(doc(db, 'users/owner-b'), {
        name: 'Owner B', email: 'owner-b@example.com', role: 'admin',
        active: true, tenantId: 'tenant-b'
      }),
      setDoc(doc(db, 'leads/lead-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a', createdBy: 'owner-a'
      }),
      setDoc(doc(db, 'leads/lead-super-admin-assigned'), {
        tenantId: 'tenant-a', assignedTo: 'super-admin-a', createdBy: 'owner-a'
      }),
      setDoc(doc(db, 'leads/lead-b'), {
        tenantId: 'tenant-b', assignedTo: 'owner-b', createdBy: 'owner-b'
      }),
      setDoc(doc(db, 'payments/payment-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a'
      }),
      setDoc(doc(db, 'followups/followup-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a'
      }),
      setDoc(doc(db, 'quotations/quotation-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a'
      }),
      setDoc(doc(db, 'installations/installation-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a'
      }),
      setDoc(doc(db, 'surveys/survey-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a'
      }),
      setDoc(doc(db, 'subsidies/subsidy-a'), {
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
      }),
      setDoc(doc(db, 'amcs/amc-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a'
      }),
      setDoc(doc(db, 'serviceTickets/ticket-a'), {
        tenantId: 'tenant-a', assignedTo: 'owner-a'
      }),
      setDoc(doc(db, 'history/history-a'), {
        tenantId: 'tenant-a', feature: 'leads', recordType: 'sales',
        assignedTo: 'owner-a'
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

  await assertSucceeds(getDocs(collection(superAdminDb, 'workspaces')));
  await assertSucceeds(getDocs(collection(superAdminDb, 'tenantDirectory')));
  const companyMetadata = await getDoc(doc(superAdminDb, 'tenantDirectory/tenant-b'));
  assert.deepEqual(Object.keys(companyMetadata.data()).sort(),
    ['active', 'activeUserCount', 'name', 'plan'].sort());
  await assertSucceeds(getDoc(doc(superAdminDb, 'workspaces/tenant-b')));
  await assertFails(getDoc(doc(db, 'tenantDirectory/tenant-b')));
  await assertSucceeds(getDoc(doc(superAdminDb, 'users/owner-a')));
  await assertSucceeds(getDocs(collection(superAdminDb, 'users')));
  await assertSucceeds(getDoc(doc(superAdminDb, 'leads/lead-a')));
  await assertSucceeds(getDoc(doc(superAdminDb, 'leads/lead-super-admin-assigned')));
  for (const path of [
    'followups/followup-a', 'quotations/quotation-a',
    'installations/installation-a', 'surveys/survey-a',
    'subsidies/subsidy-a', 'history/history-a',
    'amcs/amc-a', 'serviceTickets/ticket-a'
  ]) {
    await assertSucceeds(getDoc(doc(superAdminDb, path)));
  }
  await assertSucceeds(getDocs(query(
    collection(superAdminDb, 'leads'),
    where('tenantId', '==', 'tenant-a')
  )));
  await assertSucceeds(getDocs(collection(superAdminDb, 'leads')));
  await assertSucceeds(getDoc(doc(superAdminDb, 'payments/payment-a')));
  await assertSucceeds(getDoc(doc(superAdminDb, 'loans/loan-a')));
  await assertSucceeds(getDoc(doc(superAdminDb, 'inventory/item-a')));
  await assertSucceeds(getDoc(doc(superAdminDb, 'catalog/catalog-a')));
  await assertSucceeds(getDoc(doc(superAdminDb, 'stockMovements/movement-a')));
  await assertSucceeds(getDoc(doc(superAdminDb, 'workspaces/tenant-a/internal/seatChange')));
  await updateDoc(doc(superAdminDb, 'leads/lead-a'), { notes: 'Updated by global administrator' });
  assert.equal((await getDoc(doc(superAdminDb, 'leads/lead-a'))).data().notes,
    'Updated by global administrator');
  await setDoc(doc(superAdminDb, 'leads/lead-admin-created'), {
    tenantId: 'tenant-b', assignedTo: 'owner-b', createdBy: 'super-admin-a'
  });
  await assertFails(setDoc(doc(superAdminDb, 'leads/lead-invalid-tenant'), {
    tenantId: 'tenant-missing', assignedTo: 'super-admin-a'
  }));
  await assertSucceeds(updateDoc(doc(superAdminDb, 'users/owner-b'), { role: 'manager' }));

  await assertSucceeds(getDoc(doc(db, 'leads/lead-a')));
  await assertFails(getDoc(doc(db, 'leads/lead-b')));
  await assertFails(getDoc(doc(db, 'workspaces/tenant-b')));
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
  const updateCompanyMetadata = async (workspaceId, updates) => {
    const updatedAt = new Date().toISOString();
    const batch = writeBatch(superAdminDb);
    batch.update(doc(superAdminDb, `workspaces/${workspaceId}`), { ...updates, updatedAt });
    batch.update(doc(superAdminDb, `tenantDirectory/${workspaceId}`), { ...updates, updatedAt });
    await batch.commit();
  };
  await assertSucceeds(updateCompanyMetadata('tenant-a', { plan: 'business' }));
  await assertSucceeds(updateCompanyMetadata('tenant-a', { active: false }));
  await assertSucceeds(updateCompanyMetadata('tenant-a', { active: true }));
  await assertFails(setDoc(doc(superAdminDb, 'users/another-super-admin'), {
    name: 'Not allowed',
    email: 'not-allowed@example.com',
    role: 'super_admin',
    active: true
  }));

  const workspaceBatch = writeBatch(superAdminDb);
  const newWorkspaceMetadata = {
    name: 'New Company', plan: 'starter', active: true, activeUserCount: 1,
    updatedAt: new Date().toISOString()
  };
  workspaceBatch.set(doc(superAdminDb, 'workspaces/tenant-new'), {
    ...newWorkspaceMetadata
  });
  workspaceBatch.set(doc(superAdminDb, 'tenantDirectory/tenant-new'), {
    ...newWorkspaceMetadata
  });
  workspaceBatch.set(doc(superAdminDb, 'users/new-company-owner'), {
    name: 'New Owner', email: 'new-owner@example.com', role: 'admin',
    active: true, tenantId: 'tenant-new'
  });
  await assertSucceeds(workspaceBatch.commit());
  await assertSucceeds(getDoc(doc(superAdminDb, 'tenantDirectory/tenant-new')));
  await assertSucceeds(getDoc(doc(superAdminDb, 'workspaces/tenant-new')));
  await assertSucceeds(getDoc(doc(superAdminDb, 'users/new-company-owner')));

  await assertSucceeds(getDoc(doc(db, 'payments/payment-a')));
  await assertSucceeds(getDoc(doc(db, 'loans/loan-a')));
  await assertFails(getDoc(doc(db, 'inventory/item-a')));

  await assertSucceeds(updateCompanyMetadata('tenant-a', { plan: 'scale' }));
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
      updatedAt: new Date().toISOString()
    });
    transaction.update(doc(db, 'tenantDirectory/tenant-a'), {
      activeUserCount,
      updatedAt: new Date().toISOString()
    });
    transaction.set(doc(db, 'workspaces/tenant-a/internal/seatChange'), {
      userId, action: 'activate', updatedAt: new Date().toISOString()
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
  await assertSucceeds(updateCompanyMetadata('tenant-a', { plan: 'starter' }));
  assert.equal((await getDoc(doc(db, 'workspaces/tenant-a'))).data().activeUserCount, 5);
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
      updatedAt: new Date().toISOString()
    });
    transaction.update(doc(db, 'tenantDirectory/tenant-a'), {
      activeUserCount,
      updatedAt: new Date().toISOString()
    });
    transaction.set(doc(db, 'workspaces/tenant-a/internal/seatChange'), {
      userId, action: active ? 'activate' : 'deactivate',
      updatedAt: new Date().toISOString()
    });
    transaction.update(userRef, { active });
  });

  await assertSucceeds(changeSalesAccess('sales-a', false));
  assert.equal((await getDoc(doc(db, 'workspaces/tenant-a'))).data().activeUserCount, 4);
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
