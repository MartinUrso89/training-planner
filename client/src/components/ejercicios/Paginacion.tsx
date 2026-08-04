import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  pagina: number
  totalPaginas: number
  onChange: (pagina: number) => void
}

export default function Paginacion({ pagina, totalPaginas, onChange }: Props) {
  if (totalPaginas <= 1) return null

  const paginas: (number | string)[] = []
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= pagina - 1 && i <= pagina + 1)) {
      paginas.push(i)
    } else if (paginas[paginas.length - 1] !== '…') {
      paginas.push('…')
    }
  }

  const btn = "px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"

  return (
    <div className="flex items-center justify-center gap-2">
      <button className={btn} disabled={pagina <= 1} onClick={() => onChange(pagina - 1)}>
        <ChevronLeft className="w-4 h-4" />
      </button>

      {paginas.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              p === pagina
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}

      <button className={btn} disabled={pagina >= totalPaginas} onClick={() => onChange(pagina + 1)}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
