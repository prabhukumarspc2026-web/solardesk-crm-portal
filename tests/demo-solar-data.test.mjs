import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildConfiguredBom, resolveSolarPackagePrice } from '../public/quotation-config.js';
import { createDemoSolarData } from '../public/demo-solar-data.js';

const expectedCases = [
  ['ONGRID-3KW', 'On-grid', 3.2, [76802, 108791, 127793, 141082, 145914]],
  ['ONGRID-5KW', 'On-grid', 5.12, [113067, 150794, 179788, 201050, 208781]],
  ['ONGRID-10KW', 'On-grid', 10.24, [227782, 286480, 342594, 379969, 391295]],
  ['OFFGRID-3KW', 'Off-grid', 3.2, [212042, 248426, 267755, 283057, 285876]],
  ['OFFGRID-5KW', 'Off-grid', 5.12, [256735, 291395, 321678, 342940, 349383]],
  ['OFFGRID-10KW', 'Off-grid', 10.24, [436024, 494634, 548514, 590373, 603058]],
  ['ONGRID-DCR-3KW', 'On-grid', 3, [107862, 140731, 157720, 170178, 174708]],
  ['ONGRID-DCR-4-8KW-1PH', 'On-grid', 4.8, [162763, 196261, 223443, 243376, 251027]],
  ['ONGRID-DCR-4-8KW-3PH', 'On-grid', 4.8, [186535, 230912, 256521, 276794, 286458]],
  ['ONGRID-DCR-5-4KW-1PH', 'On-grid', 5.4, [185671, 224157, 251137, 279300, 288134]],
  ['ONGRID-DCR-5-4KW-3PH', 'On-grid', 5.4, [203054, 248206, 278785, 304607, 311403]],
  ['ONGRID-DCR-9KW', 'On-grid', 9, [310527, 369225, 420191, 457565, 468891]],
  ['OFFGRID-DCR-3KW', 'Off-grid', 3, [243101, 279485, 297606, 310064, 314595]],
  ['OFFGRID-DCR-5-4KW-1PH', 'Off-grid', 5.4, [306431, 341091, 369480, 389413, 395454]],
  ['OFFGRID-DCR-5-4KW-3PH', 'Off-grid', 5.4, [378020, 423671, 449040, 468973, 475014]],
  ['OFFGRID-DCR-10KW', 'Off-grid', 10.2, [552060, 610670, 664580, 706938, 719773]],
  ['OFFGRID-DCR-15KW', 'Off-grid', 15, [807058, 877484, 956763, 1019054, 1037930]]
];

const scopeIds = [
  'SCOPE-KIT',
  'SCOPE-BOS',
  'STRUCTURE-MINI-RAIL',
  'STRUCTURE-STANDARD',
  'STRUCTURE-HIGH-RAISED'
];

const categoryIds = ['KIT-BUDGET', 'KIT-STANDARD', 'KIT-PREMIUM'];
const demoPrice = price => price + 60000;

test('seeds materials-only demo kits and priced packages for every supplied price-list case', () => {
  const { solarKits, configurations } = createDemoSolarData('2026-11-16T00:00:00.000Z');
  const gstProfile = configurations.gstProfiles.find(profile => profile.id === 'DEMO-GST-PRICE-LIST');
  const structure = configurations.structureConfigurations.find(item => item.id === 'SCOPE-KIT');
  const materials = configurations.materialMaster;

  assert.ok(gstProfile);
  assert.equal(solarKits.length, expectedCases.length);
  assert.equal(configurations.systemConfigurations.length, expectedCases.length);
  assert.equal(configurations.bomTemplates.length, expectedCases.length * scopeIds.length * categoryIds.length);
  assert.equal(configurations.customerPriceBooks.length, 0);
  assert.equal(configurations.solarPackages.length, expectedCases.length * scopeIds.length * categoryIds.length);
  assert.ok(configurations.paymentTemplates.some(item => item.status === 'Active' && item.milestones.length > 0));
  assert.ok(materials.length > 0);
  assert.ok(materials.some(item => item.make === 'Vikram Solar' && item.materialCategory === 'Solar PV Module'));
  assert.ok(materials.some(item => item.make === 'Waaree Solar' && item.materialCategory === 'Solar PV Module'));
  assert.ok(materials.some(item => item.make === 'Adani Solar' && item.materialCategory === 'Solar PV Module'));
  assert.ok(materials.some(item => item.make === 'PowerOne' && item.materialCategory === 'On-grid Inverter'));
  assert.ok(materials.some(item => item.make === 'Deye' && item.materialCategory === 'Hybrid Inverter'));
  assert.ok(materials.every(item => item.id && item.materialCode && item.materialCategory && item.description));
  assert.ok(solarKits.every(kit => Array.isArray(kit.pricing) && kit.pricing.length === 0));

  for (const [caseId, systemType, capacityKw, scopePrices] of expectedCases) {
    const kit = solarKits.find(item => item.id === `DEMO-KIT-${caseId}`);
    const system = configurations.systemConfigurations.find(item => item.id === `DEMO-SYSTEM-${caseId}`);
    const panelWattage = caseId.includes('-DCR-') ? 600 : 640;
    const panelClassification = panelWattage === 600 ? 'DCR' : 'NDCR';

    assert.ok(kit && kit.items.length > 0);
    assert.ok(kit.items.every(item => item.description.trim()));
    assert.ok(kit.items.slice(0, 8).every(item => item.quantity.trim()));
    assert.equal(kit.materialsTemplateVersion, 1);
    assert.deepEqual(kit.items.slice(0, 9).map(item => item.description), [
      'Solar PV Module',
      'Solar On-Grid Tie Inverter',
      'Monitoring device',
      'Module mounting High Raised Structure',
      'Dc Combiner Box',
      'DC cables',
      'AC cables',
      'Earthing Kits',
      `Other accessories required to install ${system.inverterCapacityKw}kW Solar Power Plant`
    ]);
    assert.equal(kit.items[0].capacity, `${panelWattage}Wp`);
    assert.equal(kit.items[0].quantity, `${system.panelQuantity} nos.`);
    assert.equal(kit.items[1].capacity, `${system.inverterCapacityKw}kW inverter; phase as per design`);
    assert.deepEqual(kit.pricing, []);
    assert.equal(kit.systemType, systemType);
    assert.equal(system.panelClassification, panelClassification);
    assert.equal(system.panelWattageWp, panelWattage);
    assert.equal(system.panelWattageWp * system.panelQuantity / 1000, capacityKw);
    for (const categoryId of categoryIds) {
      const categorySuffix = categoryId === 'KIT-STANDARD' ? '' : `-${categoryId}`;
      for (const [index, structureId] of scopeIds.entries()) {
        const selectedStructure = configurations.structureConfigurations.find(item => item.id === structureId);
        const scopeSuffix = structureId === 'SCOPE-KIT' ? '' : `-${structureId}`;
        const template = configurations.bomTemplates.find(item =>
          item.id === `DEMO-BOM-${caseId}${categorySuffix}${scopeSuffix}`);
        const solarPackage = configurations.solarPackages.find(item =>
          item.id === `DEMO-PACKAGE-${caseId}${categorySuffix}${scopeSuffix}`);
        assert.ok(selectedStructure && template && solarPackage);
        assert.ok(template.items.length > 0);
        assert.ok(template.items.every(item => item.id && item.materialId && item.quantityMode));
        assert.equal(template.kitCategoryId, categoryId);
        assert.equal(solarPackage.kitCategoryId, categoryId);
        assert.equal(solarPackage.status, 'Active');
        assert.equal(solarPackage.customerSellingPrice, demoPrice(scopePrices[index]));
        assert.equal(solarPackage.nominalCapacityKw, system.nominalCapacityKw);
        assert.equal(solarPackage.actualSolarCapacityKw, system.actualSolarCapacityKw);
        assert.ok(solarPackage.sourceReference && solarPackage.sourceRow && solarPackage.sourceScope);

        const selection = {
          kitCategoryId: categoryId,
          systemConfigurationId: system.id,
          systemType,
          nominalCapacityKw: system.nominalCapacityKw,
          actualSolarCapacityKw: system.actualSolarCapacityKw,
          panelClassification: system.panelClassification,
          phase: system.phase,
          batteryConfiguration: system.batteryQuantity
            ? `${system.batteryVoltage} V ${system.batteryCapacityAh} Ah × ${system.batteryQuantity}`
            : '',
          structureConfigurationId: selectedStructure.id,
          supplyScope: selectedStructure.supplyScope,
        };
        assert.equal(resolveSolarPackagePrice(solarPackage, selection, '2026-11-16').amount, demoPrice(scopePrices[index]));
        assert.ok(buildConfiguredBom(template, system, materials, selectedStructure).length > 0);
      }
    }
  }

  const offGridSystems = configurations.systemConfigurations.filter(item => item.systemType === 'Off-grid');
  assert.ok(offGridSystems.every(item => item.sourceSystemType === 'Hybrid'
    && item.batteryVoltage === 51 && item.batteryCapacityAh === 100 && item.batteryQuantity > 0));
});
