import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

/**
 * Script to import a sample dataset (first 100 villages and their parent hierarchies)
 * for the Village API SaaS Platform.
 * 
 * Flow:
 * 1. Read D:\dataset\Rdir_2011_10_BIHAR.xls
 * 2. Maintain state/district/sub-district mapping as we read row-by-row.
 * 3. Use upsert everywhere.
 * 4. Stop after inserting exactly 100 villages.
 */

// File path to the dataset
const FILE_PATH = 'D:\\dataset\\Rdir_2011_10_BIHAR.xls';

// Helper to convert strings to a premium Title Case
function toTitleCase(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}

async function main() {
  console.log('==================================================');
  console.log('        Village API - Database Importer Sample     ');
  console.log('==================================================');
  
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`Error: Dataset file not found at ${FILE_PATH}`);
    process.exit(1);
  }

  // Instantiate Prisma Client
  const prisma = new PrismaClient();

  try {
    console.log('Ensuring Country (India) exists in the database...');
    // Ensure Country "India" exists (IN code)
    const india = await prisma.country.upsert({
      where: { code: 'IN' },
      update: {},
      create: {
        code: 'IN',
        name: 'India'
      }
    });

    console.log('Reading Excel file...');
    const workbook = XLSX.readFile(FILE_PATH);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    console.log(`Loading rows from worksheet: "${firstSheetName}"...`);
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    console.log(`Loaded ${rows.length} total rows from Excel.`);

    // Tracking variables for active hierarchy
    let currentStateId = null;
    let currentStateName = '';
    let currentDistrictId = null;
    let currentDistrictName = '';
    let currentSubDistrictId = null;
    let currentSubDistrictName = '';

    // Counters for output statistics
    let statesInserted = 0;
    let districtsInserted = 0;
    let subDistrictsInserted = 0;
    let villagesInserted = 0;

    console.log('\nProcessing hierarchy and importing data...');

    for (const row of rows) {
      const plcn = String(row['MDDS PLCN'] || '').trim();
      const dtc = String(row['MDDS DTC'] || '').trim();
      const subdt = String(row['MDDS Sub_DT'] || '').trim();
      const stc = String(row['MDDS STC'] || '').trim();

      // Hierarchy rule matching
      if (plcn === '000000' && dtc === '000' && subdt === '00000') {
        // 1. State Row
        const stateName = toTitleCase(row['STATE NAME']);
        const state = await prisma.state.upsert({
          where: { stateCode: stc },
          update: { name: stateName },
          create: {
            stateCode: stc,
            name: stateName,
            countryId: india.id
          }
        });
        currentStateId = state.id;
        currentStateName = state.name;
        statesInserted++;
        console.log(`-> Processed State: ${stateName} (${stc})`);

      } else if (plcn === '000000' && subdt === '00000' && dtc !== '000') {
        // 2. District Row
        if (!currentStateId) {
          console.warn(`Warning: Found district row without an active State. Row STC: ${stc}`);
          continue;
        }
        const districtName = toTitleCase(row['DISTRICT NAME']);
        const district = await prisma.district.upsert({
          where: { districtCode: dtc },
          update: { name: districtName, stateId: currentStateId },
          create: {
            districtCode: dtc,
            name: districtName,
            stateId: currentStateId
          }
        });
        currentDistrictId = district.id;
        currentDistrictName = district.name;
        districtsInserted++;
        console.log(`  -> Processed District: ${districtName} (${dtc})`);

      } else if (plcn === '000000' && subdt !== '00000') {
        // 3. SubDistrict Row
        if (!currentStateId || !currentDistrictId) {
          console.warn(`Warning: Found sub-district row without active State or District. Row STC: ${stc}, DTC: ${dtc}`);
          continue;
        }
        const subDistrictName = toTitleCase(row['SUB-DISTRICT NAME']);
        const subDistrict = await prisma.subDistrict.upsert({
          where: { subDistrictCode: subdt },
          update: {
            name: subDistrictName,
            stateId: currentStateId,
            districtId: currentDistrictId
          },
          create: {
            subDistrictCode: subdt,
            name: subDistrictName,
            stateId: currentStateId,
            districtId: currentDistrictId
          }
        });
        currentSubDistrictId = subDistrict.id;
        currentSubDistrictName = subDistrict.name;
        subDistrictsInserted++;
        console.log(`    -> Processed SubDistrict: ${subDistrictName} (${subdt})`);

      } else if (plcn !== '000000') {
        // 4. Village Row
        if (villagesInserted >= 100) {
          // Limit to exactly the first 100 villages as requested
          break;
        }

        if (!currentStateId || !currentDistrictId || !currentSubDistrictId) {
          console.warn(`Warning: Found village row without full hierarchy active. Row PLCN: ${plcn}`);
          continue;
        }

        const villageName = toTitleCase(row['Area Name']);
        // Build full address formatting: "Village, SubDistrict, District, State, India"
        const fullAddress = `${villageName}, ${currentSubDistrictName}, ${currentDistrictName}, ${currentStateName}, India`;

        await prisma.village.upsert({
          where: { villageCode: plcn },
          update: {
            name: villageName,
            stateId: currentStateId,
            districtId: currentDistrictId,
            subDistrictId: currentSubDistrictId,
            fullAddress: fullAddress
          },
          create: {
            villageCode: plcn,
            name: villageName,
            stateId: currentStateId,
            districtId: currentDistrictId,
            subDistrictId: currentSubDistrictId,
            fullAddress: fullAddress
          }
        });
        villagesInserted++;
      }
    }

    console.log('\n==================================================');
    console.log('                 IMPORT METRICS                   ');
    console.log('==================================================');
    console.log(`States inserted      : ${statesInserted}`);
    console.log(`Districts inserted   : ${districtsInserted}`);
    console.log(`SubDistricts inserted: ${subDistrictsInserted}`);
    console.log(`Villages inserted    : ${villagesInserted}`);
    console.log('==================================================');

  } catch (error) {
    console.error('An error occurred during database seeding/import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
