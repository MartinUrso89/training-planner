import { useState, useEffect, useCallback } from 'react'
import { Lightbulb } from 'lucide-react'
import { obtenerEjercicios } from '../services/ejercicios'
import type { Ejercicio, FiltrosEjercicio, ResultadoPaginado } from '../services/ejercicios'
import FiltrosEjercicios from '../components/ejercicios/FiltrosEjercicios'
import TablaEjercicios from '../components/ejercicios/TablaEjercicios'
import Paginacion from '../components/ejercicios/Paginacion'
import ModalSugerir from '../components/ejercicios/ModalSugerir'
import TarjetaDetalleEjercicio from '../components/ejercicios/TarjetaDetalleEjercicio'

export default function Ejercicios() {
  const [filtros, setFiltros] = useState<FiltrosEjercicio>({})
  const [pagina, setPagina] = useState(1)
  const [resultado, setResultado] = useState<ResultadoPaginado | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [seleccionado, setSeleccionado] = useState<Ejercicio | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await obtenerEjercicios(filtros, pagina, 8)
      setResultado(res)
    } catch {
      setResultado(null)
    } finally {
      setLoading(false)
    }
  }, [filtros, pagina])

  useEffect(() => {
    cargar()
  }, [cargar])

  const handleFiltrosChange = (nuevos: FiltrosEjercicio) => {
    setFiltros(nuevos)
    setPagina(1)
    setSeleccionado(null)
  }

  const limpiarFiltros = () => {
    setFiltros({})
    setPagina(1)
    setSeleccionado(null)
  }

  const hayFiltros = Object.values(filtros).some((v) => v !== undefined)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Catálogo de ejercicios</h1>
          <p className="text-sm text-gray-500">
            {resultado ? `${resultado.total} ejercicio${resultado.total !== 1 ? 's' : ''} encontrado${resultado.total !== 1 ? 's' : ''}` : 'Cargando…'}
          </p>
        </div>
        <button onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          <Lightbulb className="w-4 h-4" />
          Sugerir ejercicio
        </button>
      </div>

      <div
        className="grid gap-x-6 gap-y-4"
        style={{
          gridTemplateColumns: '1fr 20rem',
          gridTemplateAreas: '"filtros ." "tabla detalle" "pag ."',
        }}
      >
        <div style={{ gridArea: 'filtros' }}>
          <FiltrosEjercicios
            filtros={filtros}
            onChange={handleFiltrosChange}
            onLimpiar={limpiarFiltros}
            limpiarDeshabilitado={!hayFiltros}
          />
        </div>

        <div style={{ gridArea: 'tabla' }}>
          <TablaEjercicios
            ejercicios={resultado?.datos ?? []}
            loading={loading}
            seleccionadoId={seleccionado?.id ?? null}
            onSeleccionar={setSeleccionado}
          />
        </div>

        <div style={{ gridArea: 'detalle' }}>
          <TarjetaDetalleEjercicio ejercicio={seleccionado} onCerrar={() => setSeleccionado(null)} />
        </div>

        <div style={{ gridArea: 'pag' }}>
          {resultado && (
            <Paginacion pagina={resultado.pagina} totalPaginas={resultado.totalPaginas} onChange={setPagina} />
          )}
        </div>
      </div>

      <ModalSugerir abierto={modalAbierto} onCerrar={() => { setModalAbierto(false); cargar() }} />
    </div>
  )
}
