require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  const country = await prisma.country.upsert({
    where: {
      code: "IN",
    },
    update: {},
    create: {
      code: "IN",
      name: "India",
    },
  });

  console.log(country);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });