import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildConfiguredBom,
  calculateConfiguredSubsidy,
  calculateConfiguredTax,
  createDefaultQuotationConfigurations,
  effectiveGstRate,
  resolveCustomerPrice,
  resolveSolarPackagePrice,
  validateMilestones
} from '../public/quotation-config.js';

test('seeds the default categories, material types, and structure choices without prices', () => {
  const defaults = createDefaultQuotationConfigurations('2026-11-16T00:00:00.000Z');
  assert.deepEqual(defaults.kitCategories.map(item => item.name), ['Budgetary', 'Standard', 'Premium']);
  assert.equal(defaults.materialCategories.length, 17);
  assert.deepEqual(defaults.customerPriceBooks, []);
  assert.ok(defaults.gstProfiles.every(profile => profile.status === 'Draft'));
});

test('validates payment milestones to exactly 100 percent', () => {
  assert.equal(validateMilestones([{ name: 'Order', percent: 10 }, { name: 'Dispatch', percent: 70 }, { name: 'Handover', percent: 20 }]), true);
  assert.throws(() => validateMilestones([{ name: 'Order', percent: 10 }, { name: 'Handover', percent: 80 }]), /exactly 100%/i);
  assert.throws(() => validateMilestones([{ name: '', percent: 100 }]), /need a name/i);
});

test('calculates weighted GST allocations and inclusive customer pricing', () => {
  const profile = {
    allocations: [
      { name: 'Solar kit', allocationPercent: 96, gstRate: 5 },
      { name: 'Other allocation', allocationPercent: 4, gstRate: 18 }
    ]
  };
  assert.equal(effectiveGstRate(profile), 5.52);
  assert.deepEqual(calculateConfiguredTax(105.52, profile, true), {
    taxableValue: 100,
    effectiveRate: 5.52,
    taxAmount: 5.52,
    total: 105.52,
    components: [
      { name: 'Solar kit', allocationPercent: 96, gstRate: 5, taxableValue: 96, taxAmount: 4.8 },
      { name: 'Other allocation', allocationPercent: 4, gstRate: 18, taxableValue: 4, taxAmount: 0.72 }
    ]
  });
  assert.throws(() => effectiveGstRate({
    allocations: [{ allocationPercent: 90, gstRate: 5 }]
  }), /add up to exactly 100%/i);
});

test('resolves fixed, per-kWp, and capacity-slab customer prices deterministically', () => {
  const selection = {
    kitCategoryId: 'standard',
    systemConfigurationId: 'hybrid-10',
    systemType: 'Hybrid',
    panelClassification: 'DCR',
    phase: 'Three Phase',
    supplyScope: 'Solar Kit + BOS',
    actualSolarCapacityKw: 10.24
  };
  const common = {
    ...selection,
    status: 'Active',
    effectiveFrom: '2026-01-01',
    effectiveTo: '',
    gstProfileId: 'gst-project',
    gstInclusion: 'Exclusive'
  };
  assert.equal(resolveCustomerPrice([{
    ...common, pricingMethod: 'Fixed Package Pricing', customerSellingPrice: 300000
  }], selection, '2026-11-16').amount, 300000);
  assert.equal(resolveCustomerPrice([{
    ...common, pricingMethod: 'Per kWp Pricing', pricePerKw: 25000
  }], selection, '2026-11-16').amount, 256000);
  assert.equal(resolveCustomerPrice([{
    ...common,
    pricingMethod: 'Capacity Slab Pricing',
    capacitySlabs: [{ minimumKw: 8, maximumKw: 12, pricePerKw: 26000 }]
  }], selection, '2026-11-16').amount, 266240);
  assert.throws(() => resolveCustomerPrice([], selection, '2026-11-16'), /No active customer price/i);
  assert.throws(() => resolveCustomerPrice([{
    ...common, pricingMethod: 'Fixed Package Pricing', customerSellingPrice: 0
  }], selection, '2026-11-16'), /greater than zero/i);
});

test('does not silently choose overlapping active prices', () => {
  const selection = { kitCategoryId: 'budget', systemType: 'On-grid', actualSolarCapacityKw: 3 };
  const price = {
    ...selection, status: 'Active', pricingMethod: 'Fixed Package Pricing',
    customerSellingPrice: 170000, effectiveFrom: '2026-01-01'
  };
  assert.throws(() => resolveCustomerPrice([price, price], selection, '2026-11-16'), /More than one active customer price/i);
});

test('resolves only the exact active solar package and its customer price', () => {
  const selection = {
    kitCategoryId: 'standard',
    systemConfigurationId: 'hybrid-5',
    systemType: 'Hybrid',
    nominalCapacityKw: 5,
    actualSolarCapacityKw: 5.12,
    panelClassification: 'DCR',
    phase: 'Three Phase',
    batteryConfiguration: '51 V 100 Ah × 1',
    structureConfigurationId: 'standard-structure',
    supplyScope: 'Solar Kit + BOS'
  };
  const solarPackage = {
    ...selection,
    status: 'Active',
    effectiveFrom: '2026-01-01',
    effectiveTo: '',
    customerSellingPrice: 280000
  };
  assert.equal(resolveSolarPackagePrice(solarPackage, selection, '2026-11-16').amount, 280000);
  assert.throws(() => resolveSolarPackagePrice({
    ...solarPackage, nominalCapacityKw: 3
  }, selection, '2026-11-16'), /does not match the selected system configuration/i);
  assert.throws(() => resolveSolarPackagePrice({
    ...solarPackage, status: 'Inactive'
  }, selection, '2026-11-16'), /not currently effective/i);
  assert.throws(() => resolveSolarPackagePrice({
    ...solarPackage, effectiveTo: '2026-11-15'
  }, selection, '2026-11-16'), /not currently effective/i);
  assert.throws(() => resolveSolarPackagePrice({
    ...solarPackage, customerSellingPrice: 0
  }, selection, '2026-11-16'), /greater than zero/i);
});

test('applies subsidy eligibility, capacity slabs, and maximum limits', () => {
  const result = calculateConfiguredSubsidy([{
    name: 'Residential scheme',
    status: 'Active',
    customerCategory: 'Residential',
    systemType: 'Hybrid',
    panelClassification: 'DCR',
    minimumCapacityKw: 2,
    maximumCapacityKw: 10,
    maximumSubsidy: 78000,
    capacitySlabs: [{ minimumKw: 3, maximumKw: 5, amount: 50000 }]
  }], { systemType: 'Hybrid', panelClassification: 'DCR', actualSolarCapacityKw: 4 }, 'Residential', 'Tamil Nadu', '2026-11-16');
  assert.equal(result.amount, 50000);
  assert.equal(calculateConfiguredSubsidy([], {}, 'Residential', 'Tamil Nadu', '2026-11-16').amount, 0);
});

test('validates missing customer selection and BOM requirements with clear errors', () => {
  assert.throws(() => resolveCustomerPrice([], null, '2026-11-16'), /valid customer selection/i);
  assert.throws(() => calculateConfiguredSubsidy([], null, 'Residential', 'Tamil Nadu', '2026-11-16'), /valid customer selection/i);
  assert.throws(() => buildConfiguredBom({ status: 'Active', items: [] }, null, [], null), /valid system configuration/i);
  assert.throws(() => buildConfiguredBom({ status: 'Active', items: [] }, {}, null, null), /valid material master/i);
});

test('builds a compatible BOM with fixed, formula, and design quantities', () => {
  const template = {
    status: 'Active',
    items: [
      { id: 'panel-row', materialId: 'panel', quantityMode: 'Formula', formula: 'Panel Quantity', mandatory: true, displayOrder: 1 },
      { id: 'structure-row', materialId: 'structure', quantityMode: 'Design', mandatory: false, displayOrder: 2 }
    ]
  };
  const materials = [
    { id: 'panel', description: 'Solar module', make: 'Configured brand', capacity: '640 Wp', uom: 'Nos.', productWarranty: '12 years', performanceWarranty: '30 years', status: 'Active' },
    { id: 'structure', description: 'Mounting structure', make: '', uom: 'Lot', status: 'Active' }
  ];
  assert.deepEqual(buildConfiguredBom(template, {
    systemType: 'Hybrid', panelQuantity: 16, actualSolarCapacityKw: 10.24
  }, materials, null), [
    { materialId: 'panel', description: 'Solar module', make: 'Configured brand', capacity: '640 Wp', quantity: 16, uom: 'Nos.', productWarranty: '12 years', performanceWarranty: '30 years', customerUnitPrice: 0, displayOrder: 1 },
    { materialId: 'structure', description: 'Mounting structure', make: '', capacity: '', quantity: 'As per Design', uom: 'Lot', productWarranty: '', performanceWarranty: '', customerUnitPrice: 0, displayOrder: 2 }
  ]);
  assert.equal(buildConfiguredBom(template, {
    systemType: 'Hybrid', panelQuantity: 16, actualSolarCapacityKw: 10.24
  }, materials, null, { 'panel-row': 18 })[0].quantity, 18);
  assert.throws(() => buildConfiguredBom({ status: 'Draft', items: [] }, {}, [], null), /No active Bill of Materials/i);
});
