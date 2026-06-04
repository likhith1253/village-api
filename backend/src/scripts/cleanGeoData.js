import { PrismaClient } from '@prisma/client';

/**
 * Safe geographic data cleanup script.
 *
 * Deletes ALL geographic data in correct FK dependency order:
 *   Village → SubDistrict → District → State → Country
 *
 * Preserves all auth data:
 *   User, ApiKey, ApiLog
 *
 * Note: UserStateAccess rows are also deleted because they reference
 * State IDs that will change after re-import (autoincrement resets).
 */

const prisma = new PrismaClient();

async function main() {
  console.log('==================================================');
  console.log('       Village API — Geographic Data Cleanup       ');
  console.log('==================================================\n');

  // Step 1: Count current state before wipe (for confirmation)
  const before = {
    villages:     await prisma.village.count(),
    subDistricts: await prisma.subDistrict.count(),
    districts:    await prisma.district.count(),
    states:       await prisma.state.count(),
    countries:    await prisma.country.count(),
    userAccess:   await prisma.userStateAccess.count(),
    users:        await prisma.user.count(),
    apiKeys:      await prisma.apiKey.count(),
    apiLogs:      await prisma.apiLog.count(),
  };

  console.log('Current record counts (before cleanup):');
  console.log(`  Villages         : ${before.villages}`);
  console.log(`  SubDistricts     : ${before.subDistricts}`);
  console.log(`  Districts        : ${before.districts}`);
  console.log(`  States           : ${before.states}`);
  console.log(`  Countries        : ${before.countries}`);
  console.log(`  UserStateAccess  : ${before.userAccess}`);
  console.log(`  --- (preserved) ---`);
  console.log(`  Users            : ${before.users}`);
  console.log(`  ApiKeys          : ${before.apiKeys}`);
  console.log(`  ApiLogs          : ${before.apiLogs}`);
  console.log('');

  // Step 2: Delete in FK-safe order
  console.log('Deleting geographic data...');

  const delVillages = await prisma.village.deleteMany();
  console.log(`  ✓ Deleted ${delVillages.count} Villages`);

  const delSubDistricts = await prisma.subDistrict.deleteMany();
  console.log(`  ✓ Deleted ${delSubDistricts.count} SubDistricts`);

  const delDistricts = await prisma.district.deleteMany();
  console.log(`  ✓ Deleted ${delDistricts.count} Districts`);

  // UserStateAccess must be deleted before State (FK constraint)
  const delAccess = await prisma.userStateAccess.deleteMany();
  console.log(`  ✓ Deleted ${delAccess.count} UserStateAccess records`);

  const delStates = await prisma.state.deleteMany();
  console.log(`  ✓ Deleted ${delStates.count} States`);

  const delCountries = await prisma.country.deleteMany();
  console.log(`  ✓ Deleted ${delCountries.count} Countries`);

  // Step 3: Verify auth data is intact
  const after = {
    users:   await prisma.user.count(),
    apiKeys: await prisma.apiKey.count(),
    apiLogs: await prisma.apiLog.count(),
  };

  console.log('\nVerification (auth data preserved):');
  console.log(`  Users   : ${after.users}  (was ${before.users})`);
  console.log(`  ApiKeys : ${after.apiKeys}  (was ${before.apiKeys})`);
  console.log(`  ApiLogs : ${after.apiLogs}  (was ${before.apiLogs})`);

  console.log('\n==================================================');
  console.log('Cleanup complete. Ready for fresh import.');
  console.log('==================================================');
}

main()
  .catch(e => { console.error('Cleanup failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
