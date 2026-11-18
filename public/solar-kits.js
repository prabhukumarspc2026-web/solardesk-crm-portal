export function referenceSolarKitMaterials({
  panelWattageWp = 640,
  panelQuantity = 5,
  inverterCapacityKw = 3
} = {}) {
  const inverterCapacity = Number(inverterCapacityKw) || 3;
  return [
    {
      description: 'Solar PV Module',
      make: 'EVVO Approval Brand',
      capacity: `${Number(panelWattageWp) || 640}Wp`,
      quantity: `${Number(panelQuantity) || 5} nos.`
    },
    {
      description: 'Solar On-Grid Tie Inverter',
      make: 'EVVO',
      capacity: `${inverterCapacity}kW inverter; phase as per design`,
      quantity: '1 no.'
    },
    { description: 'Monitoring device', make: '', capacity: 'Included', quantity: 'As per Design' },
    {
      description: 'Module mounting High Raised Structure',
      make: 'EVOST',
      capacity: 'North: 8 ft; South: 6 ft',
      quantity: 'As Per Design'
    },
    { description: 'Dc Combiner Box', make: 'SWIFT Europa', capacity: 'As per design', quantity: 'As Per Design' },
    { description: 'DC cables', make: 'Polycab/Siechem', capacity: 'As per design', quantity: 'As Per Design' },
    { description: 'AC cables', make: 'Polycab/Siechem', capacity: 'As per design', quantity: 'As Per Design' },
    { description: 'Earthing Kits', make: 'Gravin', capacity: 'As per design', quantity: 'As Per Design' },
    {
      description: `Other accessories required to install ${inverterCapacity}kW Solar Power Plant`,
      make: '',
      capacity: '',
      quantity: ''
    }
  ];
}

export function normalizeSolarKitMaterials(kit) {
  if (kit.materialsTemplateVersion === 1) return kit;

  const existingItems = Array.isArray(kit.items) ? kit.items : [];
  const panel = existingItems.find(item => /solar pv module|solar panel/i.test(item.description || ''));
  const inverter = existingItems.find(item => /inverter/i.test(item.description || ''));
  const panelWattageWp = Number(
    String(panel?.capacity || panel?.description || '').match(/(\d+(?:\.\d+)?)\s*Wp/i)?.[1]
      || kit.panelWattageWp
  ) || 640;
  const panelQuantity = Number(
    String(panel?.quantity || '').match(/(\d+(?:\.\d+)?)/)?.[1]
      || kit.panelQuantity
  ) || Math.max(1, Math.round(
    Number(solarKitPricingRows(kit)[0]?.capacityKw || kit.capacityKw || 3)
      * 1000 / panelWattageWp
  ));
  const inverterCapacityKw = Number(
    String(inverter?.capacity || inverter?.description || kit.name || '')
      .match(/(?:nominal\s*)?(\d+(?:\.\d+)?)\s*kW/i)?.[1]
      || kit.inverterCapacityKw
  ) || Number(solarKitPricingRows(kit)[0]?.capacityKw || kit.capacityKw) || 3;
  const required = referenceSolarKitMaterials({ panelWattageWp, panelQuantity, inverterCapacityKw });
  const matchesRequiredMaterial = description => {
    const text = String(description || '').toLowerCase();
    if (/solar pv module|solar panel/.test(text)) return true;
    if (/inverter/.test(text)) return true;
    if (/monitoring device/.test(text)) return true;
    if (/mounting|structure/.test(text)) return true;
    if (/dc.*(combiner|distribution)|combiner box/.test(text)) return true;
    if (/dc.*ac.*cabl|ac.*dc.*cabl/.test(text)) return true;
    if (/dc cable|ac cable/.test(text)) return true;
    if (/earthing/.test(text)) return true;
    if (/other accessories/.test(text)) return true;
    return false;
  };
  const additionalItems = existingItems.filter(item => !matchesRequiredMaterial(item.description));
  return {
    ...kit,
    items: [...required, ...additionalItems],
    materialsTemplateVersion: 1
  };
}

export function createDefaultSolarKits(createdAt = new Date().toISOString()) {
  return [
    {
      id: 'KIT-DEMO-HYBRID-BUDGETARY-10KW',
      defaultTemplateId: 'solar-kit-budgetary',
      name: 'Budgetary Hybrid Solar Kit',
      systemType: 'Hybrid',
      pricing: [{ capacityKw: 10.24, price: 0 }],
      shared: true,
      createdAt,
      materialsTemplateVersion: 1,
      items: [
        ...referenceSolarKitMaterials({ panelWattageWp: 640, panelQuantity: 16, inverterCapacityKw: 10 }),
        { description: 'Lithium battery', make: 'Approved value brand', capacity: '', quantity: '1 no.' },
        { description: 'Battery protection and isolator', make: 'As per design', capacity: '', quantity: 'As per Design' },
        { description: 'DC and AC protection', make: 'As per design', capacity: '', quantity: 'As per Design' }
      ]
    },
    {
      id: 'KIT-DEMO-HYBRID-10KW',
      defaultTemplateId: 'solar-kit-standard',
      name: 'Standard Hybrid Solar Kit',
      systemType: 'Hybrid',
      pricing: [{ capacityKw: 10.24, price: 0 }],
      shared: true,
      createdAt,
      materialsTemplateVersion: 1,
      items: [
        ...referenceSolarKitMaterials({ panelWattageWp: 640, panelQuantity: 16, inverterCapacityKw: 10 }),
        { description: 'Lithium Battery', make: 'EVVO Max', capacity: '', quantity: '2 nos.' },
        { description: 'Battery Combiner Box', make: 'SWIFT Europa', capacity: '', quantity: 'As per Design' }
      ]
    },
    {
      id: 'KIT-DEMO-HYBRID-PREMIUM-10KW',
      defaultTemplateId: 'solar-kit-premium',
      name: 'Premium Hybrid Solar Kit',
      systemType: 'Hybrid',
      pricing: [{ capacityKw: 10.24, price: 0 }],
      shared: true,
      createdAt,
      materialsTemplateVersion: 1,
      items: [
        ...referenceSolarKitMaterials({ panelWattageWp: 640, panelQuantity: 16, inverterCapacityKw: 10 }),
        { description: 'Lithium battery', make: 'Premium approved brand', capacity: '', quantity: '4 nos.' },
        { description: 'Battery combiner and protection', make: 'As per design', capacity: '', quantity: 'As per Design' },
        { description: 'Smart energy meter and monitoring', make: 'Inverter-compatible', capacity: '', quantity: '1 set' },
        { description: 'Installation and commissioning', make: 'EPC scope', capacity: '', quantity: 'As per Design' }
      ]
    }
  ];
}

export function solarKitQuantityLabel(item) {
  const quantity = String(item.quantity ?? '').trim();
  if (/^as per design$/i.test(String(item.unit || '').trim())) return 'As per Design';
  if (!quantity) return String(item.unit || '').trim();
  if (/^\d+(?:\.\d+)?$/.test(quantity) && item.unit) return `${quantity} ${item.unit}`.trim();
  return quantity;
}

export function getSolarKitPrice(kit) {
  if (kit.kitPrice !== undefined && kit.kitPrice !== null && kit.kitPrice !== '') {
    const price = Number(kit.kitPrice);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error('Solar kit total price must be a non-negative amount.');
    }
    return price;
  }
  if (!Array.isArray(kit.items)) return 0;
  return kit.items.reduce((total, item) => {
    const quantity = Number.parseFloat(String(item.quantity ?? '')) || 0;
    const unitRate = Number(item.unitRate ?? 0);
    if (!Number.isFinite(unitRate) || unitRate < 0) {
      throw new Error('Legacy solar kit component rates must be valid non-negative amounts.');
    }
    return total + quantity * unitRate;
  }, 0);
}

export function solarKitPricingRows(kit) {
  if (Array.isArray(kit.pricing)) {
    return kit.pricing.map(row => ({
      capacityKw: Number(row.capacityKw),
      price: Number(row.price)
    })).filter(row => Number.isFinite(row.capacityKw) && row.capacityKw > 0
      && Number.isFinite(row.price) && row.price >= 0);
  }
  const capacityKw = Number(kit.capacityKw);
  if (!Number.isFinite(capacityKw) || capacityKw <= 0) return [];
  return [{ capacityKw, price: getSolarKitPrice(kit) }];
}

export function buildSolarKitLineItems(kit, targetCapacityKw) {
  const targetCapacity = Number(targetCapacityKw);

  if (!Number.isFinite(targetCapacity) || targetCapacity <= 0) {
    throw new Error('Quotation capacity must be greater than zero.');
  }
  if (!Array.isArray(kit.items) || kit.items.length === 0) {
    throw new Error('Add at least one component to the solar kit.');
  }
  const priceRow = solarKitPricingRows(kit).find(row =>
    Math.abs(row.capacityKw - targetCapacity) < 0.005);
  if (!priceRow) {
    throw new Error(`No price is configured for ${targetCapacity} kWp in this solar kit. Add a matching capacity and price row.`);
  }

  const components = kit.items.map(item => {
    const description = String(item.description || '').trim();
    if (!description) throw new Error('Every solar kit component needs a material description.');
    return {
      description,
      make: String(item.make || '').trim(),
      capacity: String(item.capacity || '').trim(),
      quantity: solarKitQuantityLabel(item)
    };
  });
  return [{
    productName: String(kit.name || 'Solar kit').trim(),
    quantity: 1,
    unit: 'kit',
    unitPrice: priceRow.price,
    components
  }];
}

export function calculateSolarQuoteTotals(lineItems, gstRate) {
  const rate = Number(gstRate);
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    throw new Error('Add at least one quotation item.');
  }
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw new Error('Quotation GST rate must be between 0% and 100%.');
  }

  const taxableValue = lineItems.reduce((total, item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    if (!Number.isFinite(quantity) || quantity <= 0
      || !Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error('Quotation items require a positive quantity and valid unit rate.');
    }
    return total + quantity * unitPrice;
  }, 0);
  const roundedTaxableValue = Math.round((taxableValue + Number.EPSILON) * 100) / 100;
  const gstAmount = Math.round((roundedTaxableValue * rate / 100 + Number.EPSILON) * 100) / 100;

  return {
    taxableValue: roundedTaxableValue,
    gstRate: rate,
    gstAmount,
    price: Math.round((roundedTaxableValue + gstAmount + Number.EPSILON) * 100) / 100
  };
}
