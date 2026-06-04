const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DATASET_DIR = "D:/dataset";

async function main() {
  const india = await prisma.country.findUnique({
    where: {
      code: "IN",
    },
  });

  const files = fs
    .readdirSync(DATASET_DIR)
    .filter((file) => file.endsWith(".xls"));

  for (const file of files) {
    console.log(`Processing ${file}...`);

    const workbook = XLSX.readFile(
      path.join(DATASET_DIR, file)
    );

    const sheet =
      workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const state = await prisma.state.upsert({
        where: {
          stateCode: row["MDDS STC"],
        },
        update: {},
        create: {
          stateCode: row["MDDS STC"],
          name: row["STATE NAME"].trim(),
          countryId: india.id,
        },
      });

      const district = await prisma.district.upsert({
        where: {
          districtCode: row["MDDS DTC"],
        },
        update: {},
        create: {
          districtCode: row["MDDS DTC"],
          name: row["DISTRICT NAME"].trim(),
          stateId: state.id,
        },
      });

      const subDistrict =
        await prisma.subDistrict.upsert({
          where: {
            subDistrictCode:
              row["MDDS Sub_DT"],
          },
          update: {},
          create: {
            subDistrictCode:
              row["MDDS Sub_DT"],
            name: row[
              "SUB-DISTRICT NAME"
            ].trim(),
            stateId: state.id,
            districtId: district.id,
          },
        });

      if (row["MDDS PLCN"] === "000000") {
        continue;
      }

      await prisma.village.upsert({
        where: {
          villageCode: row["MDDS PLCN"],
        },
        update: {},
        create: {
          villageCode: row["MDDS PLCN"],
          name: row["Area Name"].trim(),

          stateId: state.id,
          districtId: district.id,
          subDistrictId: subDistrict.id,

          fullAddress: `${row["Area Name"].trim()}, ${row["SUB-DISTRICT NAME"].trim()}, ${row["DISTRICT NAME"].trim()}, ${row["STATE NAME"].trim()}, India`,
        },
      });
    }
  }

  console.log("Import Complete");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });