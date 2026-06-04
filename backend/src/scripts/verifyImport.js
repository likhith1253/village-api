import { PrismaClient } from '@prisma/client';

/**
 * Post-import verification script.
 * Counts all geographic records and validates basic referential integrity.
 */

const prisma = new PrismaClient();

async function main() {
  console.log('==================================================');
  console.log('      Village API — Import Verification           ');
  console.log('==================================================\n');

  const [countries, states, districts, subDistricts, villages] = await Promise.all([
    prisma.country.count(),
    prisma.state.count(),
    prisma.district.count(),
    prisma.subDistrict.count(),
    prisma.village.count()
  ]);

  console.log('Geographic Records:');
  console.log(`  Countries    : ${countries}`);
  console.log(`  States       : ${states}`);
  console.log(`  Districts    : ${districts}`);
  console.log(`  SubDistricts : ${subDistricts}`);
  console.log(`  Villages     : ${villages.toLocaleString()}`);

  console.log('\nAuth Records (should be untouched):');
  console.log(`  Users        : ${await prisma.user.count()}`);
  console.log(`  ApiKeys      : ${await prisma.apiKey.count()}`);
  console.log(`  ApiLogs      : ${await prisma.apiLog.count()}`);

  // Sample a random village with full address
  const sample = await prisma.village.findFirst({
    include: {
      state: true,
      district: true,
      subDistrict: true
    }
  });

  if (sample) {
    console.log('\nSample Village:');
    console.log(`  Name        : ${sample.name}`);
    console.log(`  SubDistrict : ${sample.subDistrict.name}`);
    console.log(`  District    : ${sample.district.name}`);
    console.log(`  State       : ${sample.state.name}`);
    console.log(`  Full Address: ${sample.fullAddress}`);
  }

  console.log('\n==================================================');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
