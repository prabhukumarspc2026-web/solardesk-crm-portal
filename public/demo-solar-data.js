import { createDefaultQuotationConfigurations } from './quotation-config.js';
import { referenceSolarKitMaterials } from './solar-kits.js';

const SOLAR_CASES = [
  {
    id: 'ONGRID-3KW',
    systemType: 'On-grid',
    panelClassification: 'NDCR',
    panelWattageWp: 640,
    nominalCapacityKw: 3,
    actualSolarCapacityKw: 3.2,
    panelQuantity: 5,
    inverterCapacityKw: 3,
    phase: 'Single Phase',
    prices: [76802, 108791, 127793, 141082, 145914],
    source: 'CP ONGRID PRICE LIST -N SUBSIDY -640WP.pdf, page 1',
    row: '3.2 kW, 5 × 640 Wp, 3 kW single-phase inverter'
  },
  {
    id: 'ONGRID-5KW',
    systemType: 'On-grid',
    panelClassification: 'NDCR',
    panelWattageWp: 640,
    nominalCapacityKw: 5,
    actualSolarCapacityKw: 5.12,
    panelQuantity: 8,
    inverterCapacityKw: 5,
    phase: 'Single Phase',
    prices: [113067, 150794, 179788, 201050, 208781],
    source: 'CP ONGRID PRICE LIST -N SUBSIDY -640WP.pdf, page 1, row 7',
    row: '5.12 kW, 8 × 640 Wp, 5 kW single-phase inverter'
  },
  {
    id: 'ONGRID-10KW',
    systemType: 'On-grid',
    panelClassification: 'NDCR',
    panelWattageWp: 640,
    nominalCapacityKw: 10,
    actualSolarCapacityKw: 10.24,
    panelQuantity: 16,
    inverterCapacityKw: 10,
    phase: 'Three Phase',
    prices: [227782, 286480, 342594, 379969, 391295],
    source: 'CP ONGRID PRICE LIST -N SUBSIDY -640WP.pdf, page 2, row 11',
    row: '10.24 kW, 16 × 640 Wp, 10 kW three-phase inverter'
  },
  {
    id: 'OFFGRID-3KW',
    systemType: 'Off-grid',
    sourceSystemType: 'Hybrid',
    panelClassification: 'NDCR',
    panelWattageWp: 640,
    nominalCapacityKw: 3,
    actualSolarCapacityKw: 3.2,
    panelQuantity: 5,
    inverterCapacityKw: 3,
    phase: 'Single Phase',
    batteryVoltage: 51,
    batteryCapacityAh: 100,
    batteryQuantity: 1,
    prices: [212042, 248426, 267755, 283057, 285876],
    source: 'CP HYB PRICE LIST - N-DCR-640.pdf, page 1',
    row: '3.2 kW, 5 × 640 Wp, 3 kW single-phase hybrid inverter, 51 V 100 Ah × 1 battery'
  },
  {
    id: 'OFFGRID-5KW',
    systemType: 'Off-grid',
    sourceSystemType: 'Hybrid',
    panelClassification: 'NDCR',
    panelWattageWp: 640,
    nominalCapacityKw: 5,
    actualSolarCapacityKw: 5.12,
    panelQuantity: 8,
    inverterCapacityKw: 5,
    phase: 'Single Phase',
    batteryVoltage: 51,
    batteryCapacityAh: 100,
    batteryQuantity: 1,
    prices: [256735, 291395, 321678, 342940, 349383],
    source: 'CP HYB PRICE LIST - N-DCR-640.pdf, page 1, row 2',
    row: '5.12 kW, 8 × 640 Wp, 5 kW single-phase hybrid inverter, 51 V 100 Ah × 1 battery'
  },
  {
    id: 'OFFGRID-10KW',
    systemType: 'Off-grid',
    sourceSystemType: 'Hybrid',
    panelClassification: 'NDCR',
    panelWattageWp: 640,
    nominalCapacityKw: 10,
    actualSolarCapacityKw: 10.24,
    panelQuantity: 16,
    inverterCapacityKw: 10,
    phase: 'Three Phase',
    batteryVoltage: 51,
    batteryCapacityAh: 100,
    batteryQuantity: 1,
    prices: [436024, 494634, 548514, 590373, 603058],
    source: 'CP HYB PRICE LIST - N-DCR-640.pdf, page 1, row 5',
    row: '10.24 kW, 16 × 640 Wp, 10 kW three-phase hybrid inverter, 51 V 100 Ah × 1 battery'
  },
  {
    id: 'ONGRID-DCR-3KW',
    systemType: 'On-grid',
    panelClassification: 'DCR',
    panelWattageWp: 600,
    nominalCapacityKw: 3,
    actualSolarCapacityKw: 3,
    panelQuantity: 5,
    inverterCapacityKw: 3,
    phase: 'Single Phase',
    prices: [107862, 140731, 157720, 170178, 174708],
    source: 'CP ONGRID PRICE LIST - SUBSIDY -600WP.pdf, page 1, row 2',
    row: '3.0 kW, 5 × 600 Wp, 3 kW single-phase inverter'
  },
  {
    id: 'ONGRID-DCR-4-8KW-1PH',
    systemType: 'On-grid',
    panelClassification: 'DCR',
    panelWattageWp: 600,
    nominalCapacityKw: 5,
    actualSolarCapacityKw: 4.8,
    panelQuantity: 8,
    inverterCapacityKw: 5,
    phase: 'Single Phase',
    prices: [162763, 196261, 223443, 243376, 251027],
    source: 'CP ONGRID PRICE LIST - SUBSIDY -600WP.pdf, page 1, row 5',
    row: '4.8 kW, 8 × 600 Wp, 5 kW single-phase inverter'
  },
  {
    id: 'ONGRID-DCR-4-8KW-3PH',
    systemType: 'On-grid',
    panelClassification: 'DCR',
    panelWattageWp: 600,
    nominalCapacityKw: 5,
    actualSolarCapacityKw: 4.8,
    panelQuantity: 8,
    inverterCapacityKw: 5,
    phase: 'Three Phase',
    prices: [186535, 230912, 256521, 276794, 286458],
    source: 'CP ONGRID PRICE LIST - SUBSIDY -600WP.pdf, page 1, row 6',
    row: '4.8 kW, 8 × 600 Wp, 5 kW three-phase inverter'
  },
  {
    id: 'ONGRID-DCR-5-4KW-1PH',
    systemType: 'On-grid',
    panelClassification: 'DCR',
    panelWattageWp: 600,
    nominalCapacityKw: 5,
    actualSolarCapacityKw: 5.4,
    panelQuantity: 9,
    inverterCapacityKw: 5,
    phase: 'Single Phase',
    prices: [185671, 224157, 251137, 279300, 288134],
    source: 'CP ONGRID PRICE LIST - SUBSIDY -600WP.pdf, page 1, row 7',
    row: '5.4 kW, 9 × 600 Wp, 5 kW single-phase inverter'
  },
  {
    id: 'ONGRID-DCR-5-4KW-3PH',
    systemType: 'On-grid',
    panelClassification: 'DCR',
    panelWattageWp: 600,
    nominalCapacityKw: 5,
    actualSolarCapacityKw: 5.4,
    panelQuantity: 9,
    inverterCapacityKw: 5,
    phase: 'Three Phase',
    prices: [203054, 248206, 278785, 304607, 311403],
    source: 'CP ONGRID PRICE LIST - SUBSIDY -600WP.pdf, page 1, row 8',
    row: '5.4 kW, 9 × 600 Wp, 5 kW three-phase inverter'
  },
  {
    id: 'ONGRID-DCR-9KW',
    systemType: 'On-grid',
    panelClassification: 'DCR',
    panelWattageWp: 600,
    nominalCapacityKw: 9,
    actualSolarCapacityKw: 9,
    panelQuantity: 15,
    inverterCapacityKw: 8,
    phase: 'Three Phase',
    prices: [310527, 369225, 420191, 457565, 468891],
    source: 'CP ONGRID PRICE LIST - SUBSIDY -600WP.pdf, page 3, row 12',
    row: '9.0 kW, 15 × 600 Wp, 8 kW three-phase inverter; highest on-grid DCR row'
  },
  {
    id: 'OFFGRID-DCR-3KW',
    systemType: 'Off-grid',
    sourceSystemType: 'Hybrid',
    panelClassification: 'DCR',
    panelWattageWp: 600,
    nominalCapacityKw: 3,
    actualSolarCapacityKw: 3,
    panelQuantity: 5,
    inverterCapacityKw: 3,
    phase: 'Single Phase',
    batteryVoltage: 51,
    batteryCapacityAh: 100,
    batteryQuantity: 1,
    prices: [243101, 279485, 297606, 310064, 314595],
    source: 'CP HYB PRICE LIST - DCR-600.pdf, page 1, row 1',
    row: '3.0 kW, 5 × 600 Wp, 3 kW single-phase hybrid inverter, 51 V 100 Ah × 1 battery'
  },
  {
    id: 'OFFGRID-DCR-5-4KW-1PH',
    systemType: 'Off-grid',
    sourceSystemType: 'Hybrid',
    panelClassification: 'DCR',
    panelWattageWp: 600,
    nominalCapacityKw: 5,
    actualSolarCapacityKw: 5.4,
    panelQuantity: 9,
    inverterCapacityKw: 5,
    phase: 'Single Phase',
    batteryVoltage: 51,
    batteryCapacityAh: 100,
    batteryQuantity: 1,
    prices: [306431, 341091, 369480, 389413, 395454],
    source: 'CP HYB PRICE LIST - DCR-600.pdf, page 1, row 2',
    row: '5.4 kW, 9 × 600 Wp, 5 kW single-phase hybrid inverter, 51 V 100 Ah × 1 battery'
  },
  {
    id: 'OFFGRID-DCR-5-4KW-3PH',
    systemType: 'Off-grid',
    sourceSystemType: 'Hybrid',
    panelClassification: 'DCR',
    panelWattageWp: 600,
    nominalCapacityKw: 5,
    actualSolarCapacityKw: 5.4,
    panelQuantity: 9,
    inverterCapacityKw: 5,
    phase: 'Three Phase',
    batteryVoltage: 51,
    batteryCapacityAh: 100,
    batteryQuantity: 1,
    prices: [378020, 423671, 449040, 468973, 475014],
    source: 'CP HYB PRICE LIST - DCR-600.pdf, page 1, row 3',
    row: '5.4 kW, 9 × 600 Wp, 5 kW three-phase hybrid inverter, 51 V 100 Ah × 1 battery'
  },
  {
    id: 'OFFGRID-DCR-10KW',
    systemType: 'Off-grid',
    sourceSystemType: 'Hybrid',
    panelClassification: 'DCR',
    panelWattageWp: 600,
    nominalCapacityKw: 10,
    actualSolarCapacityKw: 10.2,
    panelQuantity: 17,
    inverterCapacityKw: 10,
    phase: 'Three Phase',
    batteryVoltage: 51,
    batteryCapacityAh: 100,
    batteryQuantity: 1,
    prices: [552060, 610670, 664580, 706938, 719773],
    source: 'CP HYB PRICE LIST - DCR-600.pdf, page 1, row 5',
    row: '10.2 kW, 17 × 600 Wp, 10 kW three-phase hybrid inverter, 51 V 100 Ah × 1 battery'
  },
  {
    id: 'OFFGRID-DCR-15KW',
    systemType: 'Off-grid',
    sourceSystemType: 'Hybrid',
    panelClassification: 'DCR',
    panelWattageWp: 600,
    nominalCapacityKw: 15,
    actualSolarCapacityKw: 15,
    panelQuantity: 25,
    inverterCapacityKw: 15,
    phase: 'Three Phase',
    batteryVoltage: 51,
    batteryCapacityAh: 100,
    batteryQuantity: 2,
    prices: [807058, 877484, 956763, 1019054, 1037930],
    source: 'CP HYB PRICE LIST - DCR-600.pdf, page 1, row 6',
    row: '15.0 kW, 25 × 600 Wp, 15 kW three-phase hybrid inverter, 51 V 100 Ah × 2 batteries'
  }
];

const PRICE_SCOPES = [
  { id: 'SCOPE-KIT', name: 'Solar Kit Only', supplyScope: 'Solar Kit Only' },
  { id: 'SCOPE-BOS', name: 'Solar Kit + BOS (without structure and I&C)', supplyScope: 'Solar Kit + BOS' },
  { id: 'STRUCTURE-MINI-RAIL', name: 'Mini Rail Structure with I&C', supplyScope: 'Solar Kit + BOS' },
  { id: 'STRUCTURE-STANDARD', name: 'Standard Structure with I&C', supplyScope: 'Solar Kit + BOS' },
  { id: 'STRUCTURE-HIGH-RAISED', name: 'High Raised Structure with I&C', supplyScope: 'Solar Kit + BOS' }
];

const DEMO_PRICE_INCREASE = 60000;
const demoPrice = price => price + DEMO_PRICE_INCREASE;
function kitName(item) {
  const type = item.systemType === 'Off-grid' ? 'Off-grid test (hybrid source)' : 'On-grid';
  return `${type} ${item.panelClassification} ${item.panelWattageWp} Wp · ${item.actualSolarCapacityKw} kWp (nominal ${item.nominalCapacityKw} kW)`;
}

function batteryConfiguration(item) {
  return item.batteryQuantity
    ? `${item.batteryVoltage} V ${item.batteryCapacityAh} Ah × ${item.batteryQuantity}`
    : '';
}

function kitItems(item) {
  const items = referenceSolarKitMaterials({
    panelWattageWp: item.panelWattageWp,
    panelQuantity: item.panelQuantity,
    inverterCapacityKw: item.inverterCapacityKw
  });
  if (item.batteryQuantity) {
    items.push({
      description: `${item.batteryVoltage} V ${item.batteryCapacityAh} Ah battery`,
      make: '',
      capacity: '',
      quantity: `${item.batteryQuantity} no.`
    });
  }
  return items;
}

function createKit(item, createdAt) {
  return {
    id: `DEMO-KIT-${item.id}`,
    name: kitName(item),
    systemType: item.systemType,
    pricing: [],
    items: kitItems(item),
    materialsTemplateVersion: 1,
    shared: true,
    createdAt,
    sourceReference: item.source,
    sourceRow: item.row,
    priceBasis: 'Material-only template; capacity and customer selling price are configured in Solar Packages & Pricing',
    demoNote: item.systemType === 'Off-grid'
      ? 'The supplied source is a hybrid-system price list. This Off-grid type is for demo coverage; verify inverter off-grid operation and system design before customer quoting.'
      : 'Demo price-list entry. Verify current supplier pricing and applicable tax before customer quoting.'
  };
}

function systemConfiguration(item, createdAt) {
  const systemLabel = item.systemType === 'Off-grid' ? 'Off-grid demo (Hybrid source)' : item.systemType;
  const batteryLabel = item.batteryQuantity
    ? `${item.batteryVoltage} V ${item.batteryCapacityAh} Ah × ${item.batteryQuantity}`
    : '';
  return {
    id: `DEMO-SYSTEM-${item.id}`,
    name: `${systemLabel} ${item.actualSolarCapacityKw} kWp · ${item.panelQuantity} × ${item.panelWattageWp} Wp ${item.panelClassification} · ${item.inverterCapacityKw} kW ${item.phase}${batteryLabel ? ` · ${batteryLabel} battery` : ''}`,
    systemType: item.systemType,
    sourceSystemType: item.sourceSystemType || item.systemType,
    panelClassification: item.panelClassification,
    nominalCapacityKw: item.nominalCapacityKw,
    panelWattageWp: item.panelWattageWp,
    panelQuantity: item.panelQuantity,
    actualSolarCapacityKw: item.actualSolarCapacityKw,
    inverterCapacityKw: item.inverterCapacityKw,
    inverterQuantity: 1,
    phase: item.phase,
    batteryVoltage: item.batteryVoltage || '',
    batteryCapacityAh: item.batteryCapacityAh || '',
    batteryQuantity: item.batteryQuantity || '',
    batteryStorageCapacityKwh: item.batteryQuantity
      ? Math.round(item.batteryVoltage * item.batteryCapacityAh * item.batteryQuantity / 1000 * 100) / 100
      : '',
    status: 'Active',
    shared: true,
    createdAt,
    sourceReference: item.source,
    sourceRow: item.row
  };
}

const MATERIALS = [
  ['DEMO-MAT-PV-550', 'Solar PV Module', 'Vikram Solar 550 Wp DCR solar PV module', 550, 'DCR', 'Vikram Solar'],
  ['DEMO-MAT-PV-630', 'Solar PV Module', 'Waaree Solar 630 Wp DCR solar PV module', 630, 'DCR', 'Waaree Solar'],
  ['DEMO-MAT-PV-500', 'Solar PV Module', 'Adani Solar 500 Wp DCR solar PV module', 500, 'DCR', 'Adani Solar'],
  ['DEMO-MAT-PV-600', 'Solar PV Module', '600 Wp DCR solar PV module', 600, 'DCR', 'Sample Solar'],
  ['DEMO-MAT-PV-640', 'Solar PV Module', '640 Wp NDCR solar PV module', 640, 'NDCR', 'Sample Solar'],
  ['DEMO-MAT-ONGRID-POWERONE', 'On-grid Inverter', 'PowerOne on-grid solar inverter', '', '', 'PowerOne'],
  ['DEMO-MAT-ONGRID-DEYE', 'On-grid Inverter', 'Deye on-grid solar inverter', '', '', 'Deye'],
  ['DEMO-MAT-HYBRID-DEYE', 'Hybrid Inverter', 'Deye hybrid solar inverter', '', '', 'Deye'],
  ['DEMO-MAT-BATTERY-51V', 'Lithium Battery', '51 V 100 Ah battery', '', '', 'Generic'],
  ['DEMO-MAT-DCDB', 'DC Distribution Box', 'DC distribution box (DCDB)', '', '', 'Generic'],
  ['DEMO-MAT-ACDB', 'AC Distribution Box', 'AC distribution box (ACDB)', '', '', 'Generic'],
  ['DEMO-MAT-DC-CABLE', 'DC Cable', 'DC cable', '', '', 'Generic'],
  ['DEMO-MAT-AC-CABLE', 'AC Cable', 'AC cable', '', '', 'Generic'],
  ['DEMO-MAT-EARTHING', 'Earthing Kit', 'Earthing and other accessories', '', '', 'Generic']
];

function categoryProductMap(categoryId) {
  if (categoryId === 'KIT-BUDGET') {
    return {
      panelMaterialId: 'DEMO-MAT-PV-550',
      panelDescription: 'Vikram Solar 550 Wp DCR solar PV module',
      onGridInverterMaterialId: 'DEMO-MAT-ONGRID-POWERONE',
      hybridInverterMaterialId: 'DEMO-MAT-HYBRID-DEYE',
      onGridInverterDescription: 'PowerOne on-grid solar inverter',
      hybridInverterDescription: 'Deye hybrid solar inverter',
      make: 'Vikram Solar / PowerOne'
    };
  }
  if (categoryId === 'KIT-STANDARD') {
    return {
      panelMaterialId: 'DEMO-MAT-PV-630',
      panelDescription: 'Waaree Solar 630 Wp DCR solar PV module',
      onGridInverterMaterialId: 'DEMO-MAT-ONGRID-DEYE',
      hybridInverterMaterialId: 'DEMO-MAT-HYBRID-DEYE',
      onGridInverterDescription: 'Deye on-grid solar inverter',
      hybridInverterDescription: 'Deye hybrid solar inverter',
      make: 'Waaree Solar / Deye'
    };
  }
  return {
    panelMaterialId: 'DEMO-MAT-PV-500',
    panelDescription: 'Adani Solar 500 Wp DCR solar PV module',
    onGridInverterMaterialId: 'DEMO-MAT-ONGRID-DEYE',
    hybridInverterMaterialId: 'DEMO-MAT-HYBRID-DEYE',
    onGridInverterDescription: 'Deye on-grid solar inverter',
    hybridInverterDescription: 'Deye hybrid solar inverter',
    make: 'Adani Solar / Deye'
  };
}

function bomItems(item, categoryId = 'KIT-BUDGET') {
  const product = categoryProductMap(categoryId);
  const isHybridSystem = item.systemType === 'Off-grid' || item.sourceSystemType === 'Hybrid';
  const inverterMaterialId = isHybridSystem ? product.hybridInverterMaterialId : product.onGridInverterMaterialId;
  const inverterDescription = isHybridSystem ? product.hybridInverterDescription : product.onGridInverterDescription;
  const items = [
    {
      id: `${item.id}-PV`,
      materialId: product.panelMaterialId,
      description: product.panelDescription,
      quantityMode: 'Formula',
      formula: 'Panel Quantity',
      mandatory: true,
      displayOrder: 1
    },
    {
      id: `${item.id}-INV`,
      materialId: inverterMaterialId,
      description: inverterDescription,
      quantityMode: 'Formula',
      formula: 'Inverter Quantity',
      mandatory: true,
      displayOrder: 2
    }
  ];
  if (item.batteryQuantity) {
    items.push({
      id: `${item.id}-BATTERY`,
      materialId: 'DEMO-MAT-BATTERY-51V',
      description: `${item.batteryVoltage} V ${item.batteryCapacityAh} Ah battery`,
      quantityMode: 'Formula',
      formula: 'Battery Quantity',
      mandatory: true,
      displayOrder: 3
    });
  }
  items.push(
    {
      id: `${item.id}-ACDB`,
      materialId: 'DEMO-MAT-ACDB',
      description: 'AC distribution box (ACDB)',
      quantityMode: 'Design',
      mandatory: false,
      displayOrder: 4
    },
    {
      id: `${item.id}-DC-CABLE`,
      materialId: 'DEMO-MAT-DC-CABLE',
      description: 'DC cable',
      quantityMode: 'Design',
      mandatory: false,
      displayOrder: 5
    },
    {
      id: `${item.id}-AC-CABLE`,
      materialId: 'DEMO-MAT-AC-CABLE',
      description: 'AC cable',
      quantityMode: 'Design',
      mandatory: false,
      displayOrder: 6
    },
    {
      id: `${item.id}-EARTHING`,
      materialId: 'DEMO-MAT-EARTHING',
      description: 'Earthing and other accessories',
      quantityMode: 'Design',
      mandatory: false,
      displayOrder: 7
    }
  );
  if (item.actualSolarCapacityKw === 3.2) {
    items.splice(item.batteryQuantity ? 3 : 2, 0, {
      id: `${item.id}-DCDB`,
      materialId: 'DEMO-MAT-DCDB',
      description: 'DC distribution box (DCDB)',
      quantityMode: 'Design',
      mandatory: false,
      displayOrder: 3
    });
  }
  return items;
}

function createBom(item, scope, category, createdAt) {
  const systemLabel = item.systemType === 'Off-grid' ? 'Off-grid demo (Hybrid source)' : item.systemType;
  const categorySuffix = category.id === 'KIT-STANDARD' ? '' : `-${category.id}`;
  const scopeSuffix = scope.id === 'SCOPE-KIT' ? '' : `-${scope.id}`;
  return {
    id: `DEMO-BOM-${item.id}${categorySuffix}${scopeSuffix}`,
    name: `${category.name}${categorySuffix ? ' test copy' : ''} · ${systemLabel} ${item.panelClassification} ${item.actualSolarCapacityKw} kWp · ${scope.name} BOM`,
    kitCategoryId: category.id,
    systemType: item.systemType,
    panelClassification: item.panelClassification,
    systemConfigurationId: `DEMO-SYSTEM-${item.id}`,
    phase: item.phase,
    structureConfigurationId: scope.id,
    supplyScope: scope.supplyScope,
    batteryConfiguration: batteryConfiguration(item),
    items: bomItems(item, category.id),
    status: 'Active',
    shared: true,
    createdAt,
    sourceReference: item.source,
    sourceRow: item.row,
    demoNote: categorySuffix
      ? 'Test copy of the source-list BOM. The PDFs do not define separate budgetary, standard and premium material tiers.'
      : ''
  };
}

function createSolarPackage(item, scope, category, price, createdAt) {
  const systemLabel = item.systemType === 'Off-grid' ? 'Off-grid demo (Hybrid source)' : item.systemType;
  const categorySuffix = category.id === 'KIT-STANDARD' ? '' : `-${category.id}`;
  const scopeSuffix = scope.id === 'SCOPE-KIT' ? '' : `-${scope.id}`;
  const sellingPrice = demoPrice(price);
  return {
    id: `DEMO-PACKAGE-${item.id}${categorySuffix}${scopeSuffix}`,
    name: `${category.name}${categorySuffix ? ' test copy' : ''} · ${systemLabel} ${item.panelClassification} ${item.nominalCapacityKw} kW · ${scope.name}`,
    description: `Demo ${item.actualSolarCapacityKw} kWp package; verify source pricing, GST and system compatibility before quoting.`,
    kitCategoryId: category.id,
    systemConfigurationId: `DEMO-SYSTEM-${item.id}`,
    systemType: item.systemType,
    nominalCapacityKw: item.nominalCapacityKw,
    actualSolarCapacityKw: item.actualSolarCapacityKw,
    panelClassification: item.panelClassification,
    phase: item.phase,
    batteryConfiguration: batteryConfiguration(item),
    structureConfigurationId: scope.id,
    structureName: scope.name,
    supplyScope: scope.supplyScope,
    bomTemplateId: `DEMO-BOM-${item.id}${categorySuffix}${scopeSuffix}`,
    customerSellingPrice: sellingPrice,
    gstProfileId: 'DEMO-GST-PRICE-LIST',
    gstInclusion: 'Exclusive',
    effectiveFrom: '',
    effectiveTo: '',
    status: 'Active',
    shared: true,
    createdAt,
    sourceReference: item.source,
    sourceRow: item.row,
    sourceScope: scope.name,
    priceBasis: 'Demo customer price is ₹60,000 above the source-list amount; test GST is exclusive and must be verified',
    demoNote: categorySuffix
      ? 'Test copy of the source-list package. The PDFs do not provide tier-specific rates; configure distinct category prices before customer quoting.'
      : ''
  };
}

export function createDemoSolarData(createdAt = new Date().toISOString()) {
  const configurations = createDefaultQuotationConfigurations(createdAt);
  configurations.materialMaster = MATERIALS.map(([id, materialCategory, description, wattage, classification, make]) => ({
    id,
    materialCode: id,
    materialCategory,
    productCategory: ['Solar PV Module', 'On-grid Inverter', 'Hybrid Inverter'].includes(materialCategory)
      ? (id.includes('550') || id.includes('POWERONE') ? 'Budget'
        : id.includes('630') || id.includes('600') || id.includes('640') || id.includes('DEYE') ? 'Standard'
        : id.includes('500') ? 'Premium'
        : 'Standard')
      : 'Standard',
    description,
    make: make || '',
    model: '',
    capacity: wattage ? `${wattage} Wp` : '',
    specification: '',
    uom: materialCategory === 'Solar PV Module' ? 'Nos.' : 'As per design',
    panelClassification: classification || '',
    systemCompatibility: materialCategory === 'On-grid Inverter' ? 'On-grid'
      : materialCategory === 'Hybrid Inverter' || materialCategory === 'Lithium Battery' ? 'Hybrid'
        : 'Both',
    productWarranty: '',
    performanceWarranty: '',
    customerUnitPrice: 0,
    displayInQuotation: true,
    status: 'Active',
    shared: true,
    createdAt
  }));
  configurations.systemConfigurations = SOLAR_CASES.map(item => systemConfiguration(item, createdAt));
  const categories = configurations.kitCategories.filter(item => item.status === 'Active');
  configurations.bomTemplates = SOLAR_CASES.flatMap(item =>
    categories.flatMap(category => PRICE_SCOPES.map(scope => createBom(item, scope, category, createdAt))));
  configurations.customerPriceBooks = [];
  configurations.solarPackages = SOLAR_CASES.flatMap(item =>
    categories.flatMap(category => PRICE_SCOPES.map((scope, index) =>
      createSolarPackage(item, scope, category, item.prices[index], createdAt))));
  configurations.paymentTemplates = configurations.paymentTemplates.map(template => ({
    ...template,
    status: 'Active'
  }));
  configurations.gstProfiles.push({
    id: 'DEMO-GST-PRICE-LIST',
    name: 'Demo test rate · 8.9% (verify before quoting)',
    allocations: [{ name: 'Demo solar package', allocationPercent: 100, gstRate: 8.9 }],
    effectiveFrom: '',
    effectiveTo: '',
    status: 'Active',
    shared: true,
    createdAt,
    demoNote: 'Test-only rate; verify statutory GST treatment before using a customer quotation.'
  });
  return {
    solarKits: SOLAR_CASES.map(item => createKit(item, createdAt)),
    configurations
  };
}
