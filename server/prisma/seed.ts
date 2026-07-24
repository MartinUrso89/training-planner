import prisma from '../src/lib/prisma.js'

const sectionTypes = [
  { id: 'warmup', name: 'Calentamiento' },
  { id: 'normal', name: 'Normal' },
  { id: 'circuit', name: 'Circuito' },
  { id: 'amrap', name: 'AMRAP' },
  { id: 'technique', name: 'Técnica' },
]

async function main() {
  for (const st of sectionTypes) {
    await prisma.sectionType.upsert({
      where: { id: st.id },
      update: { name: st.name },
      create: st,
    })
  }
  console.log('Section types seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
