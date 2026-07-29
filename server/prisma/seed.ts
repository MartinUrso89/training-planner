import prisma from '../src/lib/prisma.js'
import bcrypt from 'bcrypt'

const tiposSeccion = [
  { id: 'warmup', nombre: 'Calentamiento' },
  { id: 'normal', nombre: 'Normal' },
  { id: 'circuit', nombre: 'Circuito' },
  { id: 'amrap', nombre: 'AMRAP' },
  { id: 'technique', nombre: 'Técnica' },
]

async function main() {
  for (const ts of tiposSeccion) {
    await prisma.tipoSeccion.upsert({
      where: { id: ts.id },
      update: { nombre: ts.nombre },
      create: ts,
    })
  }
  console.log('✓ Tipos de sección insertados')

  const contrasena = await bcrypt.hash('123456', 10)

  const trainer = await prisma.usuario.upsert({
    where: { correo: 'ursito@test.com' },
    update: {},
    create: {
      nombre: 'Ursito',
      correo: 'ursito@test.com',
      contrasena,
    },
  })
  console.log(`✓ Trainer creado: ${trainer.correo} / 123456`)

  const athlete = await prisma.usuario.upsert({
    where: { correo: 'athlete@test.com' },
    update: {},
    create: {
      nombre: 'Atleta Test',
      correo: 'athlete@test.com',
      contrasena,
    },
  })
  console.log(`✓ Atleta creado: ${athlete.correo} / 123456`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
