import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History } from 'lucide-react'
import ListaRutinas from '../components/rutinas/ListaRutinas'
import { obtenerMisEntrenamientos } from '../services/entrenamientos'
import type { MisEntrenamiento } from '../services/entrenamientos'

const LIMITE = 15

export default function Historico() {
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
      const res = await obtenerMisEntrenamientos({ completado: true, pagina, limite: LIMITE })
      setItems(res.datos)
      setTotal(res.total)
    } catch {
      setError('No se pudieron cargar las rutinas realizadas')
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
        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
          <p className="text-sm text-gray-500">Tus rutinas ya completadas</p>
        </div>
      </div>

      <ListaRutinas
        items={items.map((r) => ({
          id: r.id,
          fecha: r.fecha,
          nombre: r.nombreRutina ?? 'Rutina',
          comentario: r.comentario,
          asignadoPor: r.asignadoPor?.nombre,
        }))}
        total={total}
        pagina={pagina}
        limite={LIMITE}
        onCambiarPagina={setPagina}
        onVerDetalle={(id) => navigate(`/entrenamientos/${id}`)}
        isCargando={isCargando}
        error={error}
        vacio="Todavía no completaste ninguna rutina"
      />
    </div>
  )
}
