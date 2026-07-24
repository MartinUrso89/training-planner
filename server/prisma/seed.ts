import prisma from '../src/lib/prisma.js'
import bcrypt from 'bcrypt'

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
  console.log('✓ Section types seeded')

  const password = await bcrypt.hash('123456', 10)

  const trainer = await prisma.user.upsert({
    where: { email: 'ursito@test.com' },
    update: {},
    create: {
      name: 'Ursito',
      email: 'ursito@test.com',
      password,
    },
  })
  console.log(`✓ Trainer created: ${trainer.email} / 123456`)

  const athlete = await prisma.user.upsert({
    where: { email: 'athlete@test.com' },
    update: {},
    create: {
      name: 'Atleta Test',
      email: 'athlete@test.com',
      password,
    },
  })
  console.log(`✓ Athlete created: ${athlete.email} / 123456`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
