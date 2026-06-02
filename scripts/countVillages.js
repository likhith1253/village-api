import prisma from '../src/config/prisma.js'

async function main() {
  const count = await prisma.village.count()
  console.log('Village Count:', count)
}

main()