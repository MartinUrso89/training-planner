interface AvatarProps {
  name: string
  size?: 'sm' | 'md'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

const colors = [
  'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
]

function getColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

const sizeMap = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base' }

export default function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`${sizeMap[size]} ${getColor(name)} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
    >
      {getInitials(name)}
    </div>
  )
}
