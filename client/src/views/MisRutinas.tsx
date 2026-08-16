import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListTodo, PlayCircle } from 'lucide-react'
import ListaRutinas from '../components/rutinas/ListaRutinas'
import { obtenerMisEntrenamientos } from '../services/entrenamientos'
import type { MisEntrenamiento } from '../services/entrenamientos'

const LIMITE = 15

export default function MisRutinas() {
  const navigate = useNavigate()
  const [items, setItems] = useState<MisEntrenamiento[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [isCargando, setIsCargando] = useState(false)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setIsCargando(true)
    setError('')
    try {
      const res = await obtenerMisEntrenamientos({ completado: false, pagina, limite: LIMITE })
      setItems(res.datos)
      setTotal(res.total)
    } catch {
      setError('No se pudieron cargar las rutinas')
    } finally {
      setIsCargando(false)
    }
  }, [pagina])

  useEffect(() => {
    void cargar()
  }, [cargar])

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <ListTodo className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis rutinas</h1>
          <p className="text-sm text-gray-500">Rutinas asignadas pendientes por realizar</p>
        </div>
      </div>

      <ListaRutinas
        items={items.map((r) => ({
          id: r.id,
          fecha: r.fecha,
          nombre: r.nombreRutina ?? 'Rutina',
          comentario: null,
          asignadoPor: r.asignadoPor?.nombre,
        }))}
        total={total}
        pagina={pagina}
        limite={LIMITE}
        onCambiarPagina={setPagina}
        onVerDetalle={(id) => navigate(`/entrenamientos/${id}`)}
        isCargando={isCargando}
        error={error}
        vacio="No tenés rutinas pendientes"
        etiquetaAccion="Empezar"
      />

      {!isCargando && items.length > 0 && (
        <p className="mt-4 text-sm text-gray-500 flex items-center gap-1.5">
          <PlayCircle className="w-4 h-4 text-green-600" />
          Elegí una rutina y tocale "Empezar" para cargar tus resultados.
        </p>
      )}
    </div>
  )
}
