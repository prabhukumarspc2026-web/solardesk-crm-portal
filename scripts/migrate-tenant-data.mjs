import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const options = Object.fromEntries(process.argv.slice(2).map((arg, index, args) => {
  if (!arg.startsWith('--')) return [];
  const key = arg.slice(2);
  return [[key, args[index + 1]?.startsWith('--') ? true : args[index + 1] ?? true]];
}));
const tenantId = options['tenant-id'];
const companyName = options['company-name'];
const plan = options.plan;
const allowedPlans = ['starter', 'business', 'scale'];
const collections = [
  'users', 'leads', 'followups', 'quotations', 'installations', 'surveys',
  'payments', 'subsidies', 'loans', 'inventory', 'stockMovements',
  'amcs', 'serviceTickets', 'catalog', 'history'
];
const historyFeatures = {
  sales: 'leads',
  quotation: 'quotations',
  followup: 'followups',
  collection: 'payments',
  project: 'installations',
  survey: 'surveys',
  subsidy: 'subsidies',
  loan: 'loans',
  inventory: 'inventory',
  amc: 'afterSales',
  serviceTicket: 'afterSales'
};

if (!tenantId || !companyName || !allowedPlans.includes(plan)) {
  console.error('Usage: node scripts/migrate-tenant-data.mjs --tenant-id <id> --company-name <name> --plan <starter|business|scale> [--service-account <path>] [--apply]');
  process.exitCode = 1;
} else {
  try {
    const credential = options['service-account']
      ? cert(JSON.parse(await readFile(resolve(options['service-account']), 'utf8')))
      : applicationDefault();
    const app = initializeApp({ credential });
    const firestore = getFirestore(app);
    const workspaceRef = firestore.collection('workspaces').doc(tenantId);
    const workspaceSnapshot = await workspaceRef.get();
    const dataByCollection = new Map();
    let activeUserCount = 0;

    for (const collectionName of collections) {
      const snapshot = await firestore.collection(collectionName).get();
      const rows = snapshot.docs.map(document => ({ ref: document.ref, data: document.data() }));
      const mismatch = rows.find(row =>
        row.data.role !== 'super_admin'
        && row.data.tenantId
        && row.data.tenantId !== tenantId
      );
      if (mismatch) throw new Error(`${collectionName}/${mismatch.ref.id} already belongs to a different tenant.`);
      if (collectionName === 'users') {
        activeUserCount = rows.filter(row =>
          row.data.active === true && row.data.role !== 'super_admin'
        ).length;
      }
      if (collectionName === 'history') {
        for (const row of rows) {
          if (!historyFeatures[row.data.recordType]) {
            throw new Error(`history/${row.ref.id} has an unsupported recordType: ${row.data.recordType}`);
          }
        }
      }
      dataByCollection.set(collectionName, rows);
    }

    const counts = Object.fromEntries([...dataByCollection].map(([name, rows]) => [name, rows.length]));
    counts.catalogToCreate = dataByCollection.get('inventory').filter(({ ref }) =>
      !dataByCollection.get('catalog').some(row => row.ref.id === ref.id)
    ).length;
    console.log(JSON.stringify({
      tenantId,
      companyName,
      plan,
      existingWorkspace: workspaceSnapshot.exists,
      activeUserCount,
      planSeatLimit: plan === 'starter' ? 3 : plan === 'business' ? 5 : 15,
      counts
    }, null, 2));

    if (!options.apply) {
      console.log('Dry run only. Add --apply after reviewing the counts and taking a Firestore backup.');
    } else {
      const workspace = {
        name: companyName,
        plan,
        active: true,
        activeUserCount,
        updatedAt: new Date().toISOString(),
        lastSeatChangeUid: FieldValue.delete(),
        lastSeatChangeAction: FieldValue.delete()
      };
      const directoryRef = firestore.collection('tenantDirectory').doc(tenantId);
      const directory = {
        name: companyName,
        plan,
        active: true,
        activeUserCount,
        updatedAt: workspace.updatedAt
      };
      await Promise.all([
        workspaceRef.set(workspace, { merge: true }),
        directoryRef.set(directory)
      ]);

      const writes = [];
      for (const [collectionName, rows] of dataByCollection) {
        for (const row of rows) {
          const update = { tenantId };
          if (collectionName === 'users' && row.data.role === 'super_admin') {
            update.tenantId = FieldValue.delete();
          }
          if (collectionName === 'history') update.feature = historyFeatures[row.data.recordType];
          writes.push({ ref: row.ref, data: update, merge: true });
        }
      }
      for (const { ref, data } of dataByCollection.get('inventory')) {
        const catalogRef = firestore.collection('catalog').doc(ref.id);
        const catalogExists = dataByCollection.get('catalog').some(row => row.ref.id === ref.id);
        if (!catalogExists) {
          writes.push({
            ref: catalogRef,
            data: {
              name: data.name,
              category: data.category || '',
              brand: data.brand || '',
              unit: data.unit || 'piece',
              unitRate: Number(data.unitRate) || 0,
              gstRate: Number(data.gstRate) || 0,
              inventoryId: ref.id,
              tenantId
            },
            merge: true
          });
        }
      }
      for (let offset = 0; offset < writes.length; offset += 400) {
        const batch = firestore.batch();
        for (const write of writes.slice(offset, offset + 400)) {
          batch.set(write.ref, write.data, { merge: write.merge });
        }
        await batch.commit();
      }
      console.log(`Migration complete. ${writes.length} documents updated or created.`);
    }
    await app.delete();
  } catch (error) {
    console.error(`Tenant migration failed: ${error.message}`);
    process.exitCode = 1;
  }
}
