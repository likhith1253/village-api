const XLSX = require("xlsx");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const workbook = XLSX.readFile("D:/dataset/Rdir_2011_11_SIKKIM.xls");

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet);

  const india = await prisma.country.findUnique({
    where: { code: "IN" },
  });

  const states = new Map();

  for (const row of rows) {
    states.set(
      row["MDDS STC"],
      row["STATE NAME"].trim()
    );
  }

  for (const [code, name] of states) {
    await prisma.state.upsert({
      where: {
        stateCode: code,
      },
      update: {},
      create: {
        stateCode: code,
        name,
        countryId: india.id,
      },
    });
  }

  console.log(`Inserted ${states.size} states`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });