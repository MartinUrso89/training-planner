import prisma from '../../lib/prisma.js'
import type { ConfiguracionTipoSeccion, TipoSeccion } from '../../domain/types/plantillaPlan.types.js'

export const listarTiposSeccion = async (): Promise<TipoSeccion[]> => {
  const tipos = await prisma.tipoSeccion.findMany({ orderBy: { nombre: 'asc' } })
  return tipos.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    configuracion: (t.configuracion ?? null) as ConfiguracionTipoSeccion | null,
  }))
}
