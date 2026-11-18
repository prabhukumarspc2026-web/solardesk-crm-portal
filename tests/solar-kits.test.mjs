import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildSolarKitLineItems,
  calculateSolarQuoteTotals,
  createDefaultSolarKits,
  getSolarKitPrice,
  normalizeSolarKitMaterials,
  solarKitPricingRows,
  solarKitQuantityLabel
} from '../public/solar-kits.js';

const kit = {
  name: 'Standard solar kit',
  pricing: [
    { capacityKw: 5, price: 100250 },
    { capacityKw: 10, price: 200500 }
  ],
  items: [
    { description: 'Solar PV Module', make: 'EVVO', quantity: '16 nos.' },
    { description: 'DC cable', make: '', quantity: '100 meter' },
    { description: 'Monitoring device', make: '', quantity: '1 set' }
  ]
};

test('provides materials-only budgetary, standard, and premium hybrid kits', () => {
  const kits = createDefaultSolarKits('2026-11-16T00:00:00.000Z');
  assert.deepEqual(kits.map(item => item.name), [
    'Budgetary Hybrid Solar Kit',
    'Standard Hybrid Solar Kit',
    'Premium Hybrid Solar Kit'
  ]);
  assert.equal(new Set(kits.map(item => item.defaultTemplateId)).size, 3);
  assert.ok(kits.every(item => item.systemType === 'Hybrid'
    && item.pricing.some(row => row.capacityKw === 10.24)));
  assert.deepEqual(kits.map(item => item.items.find(component => /battery/i.test(component.description)).quantity), [
    '1 no.',
    '2 nos.',
    '4 nos.'
  ]);
  assert.ok(kits.every(item => item.materialsTemplateVersion === 1
    && item.items.every(component => ['description', 'make', 'capacity', 'quantity'].every(field => field in component))));
  assert.deepEqual(kits[0].items.slice(0, 9).map(component => component.description), [
    'Solar PV Module',
    'Solar On-Grid Tie Inverter',
    'Monitoring device',
    'Module mounting High Raised Structure',
    'Dc Combiner Box',
    'DC cables',
    'AC cables',
    'Earthing Kits',
    'Other accessories required to install 10kW Solar Power Plant'
  ]);
  assert.ok(kits.every(item => item.items.every(component => !('unitRate' in component))));
});

test('migrates saved kits to image materials once while preserving kit-specific components', () => {
  const legacy = {
    name: 'Standard 5 kW solar kit',
    pricing: [{ capacityKw: 5.12, price: 100000 }],
    items: [
      { description: '640 Wp solar PV module', make: 'Legacy brand', quantity: '8 nos.' },
      { description: '5 kW inverter', make: 'Legacy brand', quantity: '1 no.' },
      { description: 'Lithium battery', make: 'EVVO', quantity: '2 nos.' }
    ]
  };
  const migrated = normalizeSolarKitMaterials(legacy);
  assert.equal(migrated.materialsTemplateVersion, 1);
  assert.equal(migrated.items[0].capacity, '640Wp');
  assert.equal(migrated.items[0].quantity, '8 nos.');
  assert.equal(migrated.items[1].capacity, '5kW inverter; phase as per design');
  assert.ok(migrated.items.some(item => item.description === 'Lithium battery' && item.quantity === '2 nos.'));
  assert.equal(normalizeSolarKitMaterials(migrated), migrated);
});

test('uses the price matching capacity and keeps material quantities unchanged', () => {
  const lines = buildSolarKitLineItems(kit, 5);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].productName, 'Standard solar kit');
  assert.equal(lines[0].quantity, 1);
  assert.equal(lines[0].unitPrice, 100250);
  assert.deepEqual(lines[0].components.map(item => item.quantity), [
    '16 nos.',
    '100 meter',
    '1 set'
  ]);
  assert.equal(lines[0].components[0].description, 'Solar PV Module');
  assert.equal('gstRate' in lines[0], false);
});

test('loads a different configured price for a different capacity', () => {
  const lines = buildSolarKitLineItems(kit, 10);
  assert.equal(lines[0].unitPrice, 200500);
  assert.deepEqual(solarKitPricingRows(kit), [
    { capacityKw: 5, price: 100250 },
    { capacityKw: 10, price: 200500 }
  ]);
});

test('preserves text quantities and applies GST once to the kit price', () => {
  const lines = buildSolarKitLineItems({
    name: 'Budgetary kit',
    pricing: [{ capacityKw: 5, price: 50000 }],
    items: [
      { description: 'Solar PV Module', make: 'EVVO', quantity: '16 nos.' },
      { description: 'Monitoring device', make: '', quantity: 'As per Design' }
    ]
  }, 5);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].unitPrice, 50000);
  assert.deepEqual(lines[0].components.map(item => item.quantity), ['16 nos.', 'As per Design']);
  assert.deepEqual(calculateSolarQuoteTotals(lines, 8.9), {
    taxableValue: 50000,
    gstRate: 8.9,
    gstAmount: 4450,
    price: 54450
  });
});

test('supports legacy kit-rate calculation and quantity labels', () => {
  assert.equal(getSolarKitPrice({
    items: [
      { quantity: '16 nos.', unitRate: 12000 },
      { quantity: '100 meter', unitRate: 85 },
      { quantity: '1 set', unitRate: 0 }
    ]
  }), 200500);
  assert.equal(solarKitQuantityLabel({ quantity: 1, unit: 'as per design' }), 'As per Design');
  assert.equal(solarKitQuantityLabel({ quantity: 'As per Design' }), 'As per Design');
});

test('rejects invalid capacity, missing price rows, and incomplete kits', () => {
  assert.throws(() => buildSolarKitLineItems(kit, 0), /Quotation capacity must be greater than zero/i);
  assert.throws(() => buildSolarKitLineItems({ pricing: [{ capacityKw: 10, price: 0 }], items: [] }, 10), /at least one component/i);
  assert.throws(() => buildSolarKitLineItems(kit, 20), /No price is configured for 20 kWp/i);
});

test('applies the quote GST rate once to the combined taxable amount', () => {
  const totals = calculateSolarQuoteTotals([
    { quantity: 2, unitPrice: 1000, gstRate: 0 },
    { quantity: 1, unitPrice: 500, gstRate: 18 }
  ], 8.9);
  assert.deepEqual(totals, {
    taxableValue: 2500,
    gstRate: 8.9,
    gstAmount: 222.5,
    price: 2722.5
  });
  assert.throws(() => calculateSolarQuoteTotals([
    { quantity: 1, unitPrice: 1000 }
  ], 101), /Quotation GST rate/i);
});
