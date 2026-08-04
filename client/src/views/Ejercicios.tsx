import { useState, useEffect, useCallback } from 'react'
import { Lightbulb, RotateCcw } from 'lucide-react'
import { obtenerEjercicios } from '../services/ejercicios'
import FiltrosEjercicios from '../components/ejercicios/FiltrosEjercicios'
import TablaEjercicios from '../components/ejercicios/TablaEjercicios'
import Paginacion from '../components/ejercicios/Paginacion'
import ModalSugerir from '../components/ejercicios/ModalSugerir'
import type { FiltrosEjercicio, ResultadoPaginado } from '../services/ejercicios'

export default function Ejercicios() {
  const [filtros, setFiltros] = useState<FiltrosEjercicio>({})
  const [pagina, setPagina] = useState(1)
  const [resultado, setResultado] = useState<ResultadoPaginado | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await obtenerEjercicios(filtros, pagina, 15)
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
  }

  const limpiarFiltros = () => {
    setFiltros({})
    setPagina(1)
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

      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1">
          <FiltrosEjercicios filtros={filtros} onChange={handleFiltrosChange} />
        </div>
        {hayFiltros && (
          <button onClick={limpiarFiltros}
            className="mt-0.5 flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Limpiar
          </button>
        )}
      </div>

      <TablaEjercicios ejercicios={resultado?.datos ?? []} loading={loading} />

      {resultado && (
        <div className="mt-6">
          <Paginacion pagina={resultado.pagina} totalPaginas={resultado.totalPaginas} onChange={setPagina} />
        </div>
      )}

      <ModalSugerir abierto={modalAbierto} onCerrar={() => { setModalAbierto(false); cargar() }} />
    </div>
  )
}
