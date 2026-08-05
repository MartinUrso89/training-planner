import prisma from '../src/lib/prisma.js'
import bcrypt from 'bcrypt'
import { TIPOS_SECCION } from '../src/domain/tiposSeccion.js'
import type { ObjetivoPrincipal } from '../src/domain/types/perfilAtleta.types.js'

async function main() {
  for (const ts of TIPOS_SECCION) {
    await prisma.tipoSeccion.upsert({
      where: { id: ts.id },
      update: { nombre: ts.nombre, configuracion: ts.configuracion },
      create: ts,
    })
  }
  console.log('✓ Tipos de sección insertados')

  const contrasena = await bcrypt.hash('123456', 10)

  const trainer = await prisma.usuario.upsert({
    where: { correo: 'ursito@test.com' },
    update: { rol: 'ENTRENADOR' },
    create: {
      nombre: 'Ursito',
      correo: 'ursito@test.com',
      contrasena,
      rol: 'ENTRENADOR',
    },
  })
  console.log(`✓ Trainer creado: ${trainer.correo} / 123456`)

  const atletas: Array<{
    nombre: string
    correo: string
    perfil: { objetivoPrincipal: ObjetivoPrincipal | null; diasPorSemana: number | null; descripcion: string | null }
  }> = [
    { nombre: 'Atleta Test', correo: 'athlete@test.com', perfil: { objetivoPrincipal: 'Hipertrofia', diasPorSemana: 4, descripcion: 'Atleta enfocado en ganar masa muscular.' } },
    { nombre: 'Lucía Fernández', correo: 'lucia@test.com', perfil: { objetivoPrincipal: 'Fuerza', diasPorSemana: 3, descripcion: null } },
    { nombre: 'Martín García', correo: 'martin@test.com', perfil: { objetivoPrincipal: null, diasPorSemana: null, descripcion: null } },
    { nombre: 'Valentina Ruiz', correo: 'valentina@test.com', perfil: { objetivoPrincipal: 'Rendimiento', diasPorSemana: 5, descripcion: 'Entrena para competencias de CrossFit.' } },
  ]

  for (const a of atletas) {
    const atleta = await prisma.usuario.upsert({
      where: { correo: a.correo },
      update: { rol: 'ATLETA' },
      create: { nombre: a.nombre, correo: a.correo, contrasena, rol: 'ATLETA' },
    })
    await prisma.vinculacion.upsert({
      where: { entrenadorId_atletaId: { entrenadorId: trainer.id, atletaId: atleta.id } },
      update: {},
      create: { entrenadorId: trainer.id, atletaId: atleta.id, estado: 'Activo', aceptadoEn: new Date() },
    })
    await prisma.perfilAtleta.upsert({
      where: { atletaId: atleta.id },
      update: a.perfil,
      create: { atletaId: atleta.id, ...a.perfil },
    })
    console.log(`✓ Atleta creado y vinculado: ${atleta.correo} / 123456`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
