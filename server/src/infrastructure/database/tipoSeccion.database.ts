import prisma from '../../lib/prisma.js'
import type { TipoSeccion } from '../../domain/types/plantillaPlan.types.js'

export const listarTiposSeccion = (): Promise<TipoSeccion[]> =>
  prisma.tipoSeccion.findMany({ orderBy: { nombre: 'asc' } })
