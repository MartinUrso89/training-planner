import prisma from '../../src/lib/prisma.js'
import { TIPOS_SECCION } from '../../src/domain/tiposSeccion.js'

export const sembrarTiposSeccion = async (): Promise<void> => {
  for (const ts of TIPOS_SECCION) {
    await prisma.tipoSeccion.upsert({
      where: { id: ts.id },
      update: { nombre: ts.nombre, configuracion: ts.configuracion },
      create: ts,
    })
  }
}

export const limpiarBaseDeDatos = async (): Promise<void> => {
  await prisma.registroEjercicio.deleteMany()
  await prisma.ejercicioEntrenamiento.deleteMany()
  await prisma.seccionEntrenamiento.deleteMany()
  await prisma.ejercicioPlantilla.deleteMany()
  await prisma.seccionPlantilla.deleteMany()
  await prisma.entrenamiento.deleteMany()
  await prisma.plantillaPlan.deleteMany()
  await prisma.sugerenciaEjercicio.deleteMany()
  await prisma.ejercicio.deleteMany()
  await prisma.perfilAtleta.deleteMany()
  await prisma.vinculacion.deleteMany()
  await prisma.tokenRefresco.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.tipoSeccion.deleteMany()
}
