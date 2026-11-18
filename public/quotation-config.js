export const DEFAULT_MATERIAL_CATEGORIES = [
  'Solar PV Module',
  'On-grid Inverter',
  'Hybrid Inverter',
  'Lithium Battery',
  'Monitoring Device',
  'Battery Combiner Box',
  'DC Combiner Box',
  'AC Distribution Box',
  'DC Distribution Box',
  'DC Cable',
  'AC Cable',
  'Earthing Cable',
  'Earthing Kit',
  'Lightning Arrester',
  'Module Mounting Structure',
  'Other Accessories',
  'Installation and Commissioning'
];

export function createDefaultQuotationConfigurations(createdAt = new Date().toISOString()) {
  const record = (id, fields) => ({ id, ...fields, shared: true, createdAt });
  return {
    kitCategories: [
      record('KIT-BUDGET', { name: 'Budgetary', description: 'Budget solar package', status: 'Active', displayOrder: 1 }),
      record('KIT-STANDARD', { name: 'Standard', description: 'Standard solar package', status: 'Active', displayOrder: 2 }),
      record('KIT-PREMIUM', { name: 'Premium', description: 'Premium solar package', status: 'Active', displayOrder: 3 })
    ],
    materialCategories: DEFAULT_MATERIAL_CATEGORIES.map((name, index) =>
      record(`MATCAT-${String(index + 1).padStart(2, '0')}`, { name, status: 'Active' })),
    materialMaster: [],
    systemConfigurations: [],
    structureConfigurations: [
      ['SCOPE-KIT', 'Solar Kit Only', 'Core solar equipment'],
      ['SCOPE-BOS', 'Solar Kit + BOS', 'Equipment and Balance of System materials'],
      ['STRUCTURE-MINI-RAIL', 'Mini Rail Structure', 'Includes installation and commissioning'],
      ['STRUCTURE-STANDARD', 'Standard Structure', 'Standard-height installation'],
      ['STRUCTURE-HIGH-RAISED', 'High Raised Structure', 'Elevated structure with installation'],
      ['STRUCTURE-CUSTOM', 'Custom Structure', 'Site-specific structure']
    ].map(([id, name, description]) => record(id, {
      name, description, supplyScope: id.startsWith('SCOPE-') ? name : 'Solar Kit + BOS',
      status: 'Active', installationIncluded: id !== 'SCOPE-KIT', civilWorkIncluded: false,
      northHeight: '', southHeight: '', heightUnit: 'ft', structureMaterial: ''
    })),
    bomTemplates: [],
    customerPriceBooks: [],
    solarPackages: [],
    gstProfiles: [
      record('GST-SOLAR-KIT-EXAMPLE', {
        name: 'Solar Kit (example)', allocations: [{ name: 'Solar kit', allocationPercent: 96, gstRate: 5 }, { name: 'Other allocation', allocationPercent: 4, gstRate: 18 }],
        effectiveFrom: '', effectiveTo: '', status: 'Draft'
      }),
      record('GST-COMPLETE-PROJECT-EXAMPLE', {
        name: 'Complete Solar Project (example)', allocations: [{ name: 'Solar project', allocationPercent: 70, gstRate: 5 }, { name: 'Other allocation', allocationPercent: 30, gstRate: 18 }],
        effectiveFrom: '', effectiveTo: '', status: 'Draft'
      })
    ],
    subsidyConfigurations: [],
    optionalUpgrades: [],
    paymentTemplates: [
      record('PAYMENT-DEFAULT', {
        name: 'Standard payment milestones',
        milestones: [
          { name: 'Order Confirmation', percent: 10 },
          { name: 'Before Material Dispatch', percent: 70 },
          { name: 'Installation Completion', percent: 20 }
        ],
        status: 'Draft'
      })
    ],
    quotationTemplates: []
  };
}

const number = value => Number(value);
const roundCurrency = value => Math.round((value + Number.EPSILON) * 100) / 100;

export function validateMilestones(milestones) {
  if (!Array.isArray(milestones) || !milestones.length
    || milestones.some(item => !String(item.name || '').trim()
      || !Number.isFinite(number(item.percent)) || number(item.percent) <= 0)) {
    throw new Error('Payment milestones need a name and a positive percentage.');
  }
  const total = milestones.reduce((sum, item) => sum + number(item.percent), 0);
  if (Math.abs(total - 100) > 0.0001) {
    throw new Error('Payment milestone percentages must add up to exactly 100%.');
  }
  return true;
}

export function effectiveGstRate(profile) {
  const allocations = profile?.allocations;
  if (!Array.isArray(allocations) || !allocations.length
    || allocations.some(row => !Number.isFinite(number(row.allocationPercent))
      || number(row.allocationPercent) < 0
      || !Number.isFinite(number(row.gstRate))
      || number(row.gstRate) < 0
      || number(row.gstRate) > 100)) {
    throw new Error('GST profile needs valid allocation and GST percentages.');
  }
  const allocationTotal = allocations.reduce((sum, row) => sum + number(row.allocationPercent), 0);
  if (Math.abs(allocationTotal - 100) > 0.0001) {
    throw new Error('GST profile allocation percentages must add up to exactly 100%.');
  }
  return allocations.reduce((sum, row) =>
    sum + number(row.allocationPercent) * number(row.gstRate) / 100, 0);
}

export function calculateConfiguredTax(amount, profile, gstInclusive = false) {
  const enteredAmount = number(amount);
  if (!Number.isFinite(enteredAmount) || enteredAmount < 0) {
    throw new Error('Customer price must be a non-negative amount.');
  }
  const rate = effectiveGstRate(profile);
  const taxableValue = roundCurrency(gstInclusive ? enteredAmount / (1 + rate / 100) : enteredAmount);
  const components = profile.allocations.map(row => {
    const componentTaxable = taxableValue * number(row.allocationPercent) / 100;
    return {
      name: String(row.name || 'GST'),
      allocationPercent: number(row.allocationPercent),
      gstRate: number(row.gstRate),
      taxableValue: roundCurrency(componentTaxable),
      taxAmount: roundCurrency(componentTaxable * number(row.gstRate) / 100)
    };
  });
  const taxAmount = roundCurrency(components.reduce((sum, row) => sum + row.taxAmount, 0));
  return {
    taxableValue,
    effectiveRate: rate,
    taxAmount,
    total: roundCurrency(gstInclusive ? enteredAmount : taxableValue + taxAmount),
    components
  };
}

export function resolveCustomerPrice(priceBooks, selection, effectiveDate) {
  if (!selection || typeof selection !== 'object') {
    throw new Error('A valid customer selection is required to resolve pricing.');
  }
  const keys = [
    'kitCategoryId',
    'systemConfigurationId',
    'systemType',
    'panelClassification',
    'phase',
    'batteryConfiguration',
    'structureConfigurationId',
    'supplyScope'
  ];
  const matches = (priceBooks || []).filter(book =>
    book.status === 'Active'
      && (!book.effectiveFrom || book.effectiveFrom <= effectiveDate)
      && (!book.effectiveTo || book.effectiveTo >= effectiveDate)
      && keys.every(key => !book[key] || String(book[key]) === String(selection[key] || '')));
  if (matches.length > 1) {
    throw new Error('More than one active customer price matches this configuration.');
  }
  const book = matches[0];
  if (!book) throw new Error('No active customer price is configured for this selection.');

  const capacity = number(selection.actualSolarCapacityKw);
  let amount;
  if (book.pricingMethod === 'Fixed Package Pricing') {
    amount = number(book.customerSellingPrice);
  } else if (book.pricingMethod === 'Per kWp Pricing') {
    amount = capacity * number(book.pricePerKw);
  } else if (book.pricingMethod === 'Capacity Slab Pricing') {
    const slab = (book.capacitySlabs || []).find(item =>
      capacity >= number(item.minimumKw) && capacity <= number(item.maximumKw));
    if (!slab) throw new Error('No customer price slab covers this solar capacity.');
    amount = capacity * number(slab.pricePerKw);
  } else {
    throw new Error('Choose a supported customer pricing method.');
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('The active customer price must be greater than zero.');
  }
  return { book, amount: roundCurrency(amount) };
}

export function resolveSolarPackagePrice(solarPackage, selection, effectiveDate) {
  if (!solarPackage || typeof solarPackage !== 'object') {
    throw new Error('Select an active solar package.');
  }
  if (!selection || typeof selection !== 'object') {
    throw new Error('A valid customer selection is required to resolve package pricing.');
  }
  if (solarPackage.status !== 'Active'
    || solarPackage.effectiveFrom && solarPackage.effectiveFrom > effectiveDate
    || solarPackage.effectiveTo && solarPackage.effectiveTo < effectiveDate) {
    throw new Error('The selected solar package is not currently effective.');
  }
  const keys = [
    'kitCategoryId',
    'systemConfigurationId',
    'systemType',
    'panelClassification',
    'phase',
    'batteryConfiguration',
    'structureConfigurationId',
    'supplyScope',
    'nominalCapacityKw',
    'actualSolarCapacityKw'
  ];
  if (keys.some(key => String(solarPackage[key] ?? '') !== String(selection[key] ?? ''))) {
    throw new Error('The solar package does not match the selected system configuration.');
  }
  const amount = number(solarPackage.customerSellingPrice);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('The solar package must have a customer selling price greater than zero.');
  }
  return { solarPackage, amount: roundCurrency(amount) };
}

export function calculateConfiguredSubsidy(schemes, selection, customerCategory, state, effectiveDate) {
  if (!selection || typeof selection !== 'object') {
    throw new Error('A valid customer selection is required to evaluate subsidy eligibility.');
  }
  const capacity = number(selection.actualSolarCapacityKw);
  if (!Number.isFinite(capacity) || capacity < 0) {
    if (!Array.isArray(schemes) || schemes.length === 0) return { scheme: null, amount: 0 };
    throw new Error('Actual solar capacity must be a non-negative number for subsidy calculation.');
  }
  const matches = (schemes || []).filter(scheme =>
    scheme.status === 'Active'
      && (!scheme.effectiveFrom || scheme.effectiveFrom <= effectiveDate)
      && (!scheme.effectiveTo || scheme.effectiveTo >= effectiveDate)
      && (!scheme.customerCategory || scheme.customerCategory === customerCategory)
      && (!scheme.systemType || scheme.systemType === selection.systemType)
      && (!scheme.panelClassification || scheme.panelClassification === selection.panelClassification)
      && (!scheme.state || scheme.state === state)
      && capacity >= number(scheme.minimumCapacityKw || 0)
      && (!scheme.maximumCapacityKw || capacity <= number(scheme.maximumCapacityKw)));
  if (matches.length > 1) throw new Error('More than one active subsidy scheme matches this customer.');
  const scheme = matches[0];
  if (!scheme) return { scheme: null, amount: 0 };
  const slab = (scheme.capacitySlabs || []).find(item =>
    capacity >= number(item.minimumKw) && capacity <= number(item.maximumKw));
  const amount = slab ? number(slab.amount) : number(scheme.subsidyAmount || 0);
  return {
    scheme,
    amount: Math.max(0, Math.min(amount, number(scheme.maximumSubsidy || amount)))
  };
}

export function buildConfiguredBom(template, system, materials, structure, userQuantities = {}) {
  if (!system || typeof system !== 'object') {
    throw new Error('A valid system configuration is required to build the BOM.');
  }
  if (!template || template.status !== 'Active') {
    throw new Error('No active Bill of Materials template matches this configuration.');
  }
  if (!Array.isArray(materials)) {
    throw new Error('A valid material master is required to build the BOM.');
  }
  const materialMap = new Map(materials.map(item => [item.id, item]));
  return (template.items || []).filter(item =>
    item.displayInQuotation !== false
      && (item.systemCompatibility === 'Both'
        || !item.systemCompatibility
        || item.systemCompatibility === system.systemType)
      && (!item.structureConfigurationId || item.structureConfigurationId === structure?.id)
  ).map(item => {
    const material = materialMap.get(item.materialId);
    if (!material || material.status !== 'Active') {
      if (item.mandatory !== false) throw new Error('A mandatory BOM material is missing or inactive.');
      return null;
    }
    let quantity;
    const hasQuantityOverride = item.quantityMode !== 'Design'
      && Object.prototype.hasOwnProperty.call(userQuantities, item.id)
      && String(userQuantities[item.id]).trim() !== '';
    if (hasQuantityOverride) {
      quantity = number(userQuantities[item.id]);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        if (item.mandatory !== false) throw new Error(`Enter a positive quantity for ${material.description}.`);
        return null;
      }
    } else if (item.quantityMode === 'Formula') {
      if (item.formula === 'Panel Quantity') quantity = number(system.panelQuantity);
      else if (item.formula === 'Actual Solar Capacity') quantity = number(system.actualSolarCapacityKw);
      else if (item.formula === 'Inverter Quantity') quantity = number(system.inverterQuantity);
      else if (item.formula === 'Battery Quantity') quantity = number(system.batteryQuantity);
      else throw new Error(`Unsupported BOM quantity formula for ${material.description}.`);
    } else if (item.quantityMode === 'User Input') {
      quantity = number(userQuantities[item.id]);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        if (item.mandatory !== false) throw new Error(`Enter a positive quantity for ${material.description}.`);
        return null;
      }
    } else if (item.quantityMode === 'Design') {
      quantity = 'As per Design';
    } else {
      quantity = item.quantity;
    }
    if (item.mandatory !== false && (!quantity || number(quantity) <= 0 && typeof quantity === 'number')) {
      throw new Error(`A valid quantity is required for ${material.description}.`);
    }
    return {
      materialId: material.id,
      description: item.description || material.description,
      make: item.make || material.make || '',
      capacity: item.capacity || material.capacity || '',
      quantity,
      uom: item.uom || material.uom || '',
      productWarranty: material.productWarranty || '',
      performanceWarranty: material.performanceWarranty || '',
      customerUnitPrice: number(material.customerUnitPrice || 0),
      displayOrder: number(item.displayOrder || 0)
    };
  }).filter(Boolean).sort((a, b) => number(a.displayOrder) - number(b.displayOrder));
}
