export const OBJETIVOS_PRINCIPALES = [
  { valor: 'Fuerza', etiqueta: 'Fuerza' },
  { valor: 'Hipertrofia', etiqueta: 'Hipertrofia' },
  { valor: 'PerdidaDePeso', etiqueta: 'Pérdida de peso' },
  { valor: 'Tonificacion', etiqueta: 'Tonificación' },
  { valor: 'Rendimiento', etiqueta: 'Rendimiento' },
] as const

export type ObjetivoPrincipal = (typeof OBJETIVOS_PRINCIPALES)[number]['valor']

export const objetivoEtiqueta = (valor: ObjetivoPrincipal): string =>
  OBJETIVOS_PRINCIPALES.find((o) => o.valor === valor)?.etiqueta ?? valor

export interface Entrenado {
  vinculacionId: string
  atleta: {
    id: string
    nombre: string
    correo: string
  }
  estado: 'Pendiente' | 'Activo' | 'Inactivo'
  objetivoPrincipal: ObjetivoPrincipal | null
  diasPorSemana: number | null
  descripcion: string | null
  ultimoEntrenamiento: Date | null
  rutinasPendientes: number
}

export interface PerfilEntrenado extends Entrenado {
  vinculadoDesde: Date | null
  notasEntrenador: string | null
}

export interface ListarEntrenadosResultado {
  datos: Entrenado[]
  total: number
  pagina: number
  limite: number
}

export interface FiltrosEntrenados {
  busqueda?: string
  estado?: 'Pendiente' | 'Activo' | 'Inactivo'
  tienePendientes?: boolean
  pagina?: number
  limite?: number
}

export interface GuardarPerfilAtletaInput {
  objetivoPrincipal?: ObjetivoPrincipal
  diasPorSemana?: number
  descripcion?: string
}

export interface GuardarNotasInput {
  notas?: string
}
