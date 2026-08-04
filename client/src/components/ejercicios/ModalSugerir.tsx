import { useState } from 'react'
import { X, AlertCircle, CheckCircle } from 'lucide-react'
import { sugerirEjercicio } from '../../services/ejercicios'

const TIPOS_ARTICULARES = ['Poliarticular', 'Monoarticular']
const PATRONES_MOVIMIENTO = [
  'Empuje', 'Traccion', 'DominanteRodilla', 'DominanteCadera',
  'Rotacion', 'Antirrotacion', 'Flexion', 'Extension',
]

interface Props {
  abierto: boolean
  onCerrar: () => void
}

export default function ModalSugerir({ abierto, onCerrar }: Props) {
  const [form, setForm] = useState({
    nombre: '',
    musculoPrincipal: '',
    musculoSecundario: '',
    tipoArticular: '',
    patronMovimiento: '',
    videoUrl: '',
    descripcion: '',
  })
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [enviando, setEnviando] = useState(false)

  if (!abierto) return null

  const set = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [campo]: e.target.value })
    if (error) setError('')
    if (exito) setExito(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.nombre.trim()) return setError('El nombre es obligatorio')
    if (!form.musculoPrincipal.trim()) return setError('El músculo principal es obligatorio')
    if (!form.tipoArticular) return setError('Seleccioná el tipo articular')
    if (!form.patronMovimiento) return setError('Seleccioná el patrón de movimiento')

    setEnviando(true)
    try {
      await sugerirEjercicio({
        ...form,
        musculoSecundario: form.musculoSecundario || undefined,
        videoUrl: form.videoUrl || undefined,
        descripcion: form.descripcion || undefined,
      })
      setExito(true)
      setForm({ nombre: '', musculoPrincipal: '', musculoSecundario: '', tipoArticular: '', patronMovimiento: '', videoUrl: '', descripcion: '' })
      setTimeout(() => onCerrar(), 2000)
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error ?? 'Error al enviar la sugerencia')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCerrar}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-gray-900">Sugerir ejercicio</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-2">
          <p className="text-sm text-gray-500">Completá los datos para sugerir un nuevo ejercicio al catálogo.</p>
        </div>

        {error && (
          <div className="mx-6 mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {exito && (
          <div className="mx-6 mb-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <CheckCircle className="w-4 h-4 shrink-0" /> Sugerencia enviada con éxito. ¡Gracias!
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.nombre} onChange={set('nombre')} required placeholder="Ej: Press banca inclinado" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Músculo principal *</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.musculoPrincipal} onChange={set('musculoPrincipal')} required placeholder="Ej: Pectoral" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Músculo secundario</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.musculoSecundario} onChange={set('musculoSecundario')} placeholder="Ej: Tríceps" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo articular *</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.tipoArticular} onChange={set('tipoArticular')} required>
                <option value="">Seleccionar</option>
                {TIPOS_ARTICULARES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patrón de movimiento *</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.patronMovimiento} onChange={set('patronMovimiento')} required>
                <option value="">Seleccionar</option>
                {PATRONES_MOVIMIENTO.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de video</label>
            <input type="url" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.videoUrl} onChange={set('videoUrl')} placeholder="https://youtube.com/…" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3} value={form.descripcion} onChange={set('descripcion')} placeholder="Breve descripción del ejercicio…" />
          </div>

          <button type="submit" disabled={enviando || exito}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
            {enviando ? 'Enviando…' : exito ? '¡Enviado!' : 'Enviar sugerencia'}
          </button>
        </form>
      </div>
    </div>
  )
}
