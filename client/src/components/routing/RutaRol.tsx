import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface Props {
  roles: ('ENTRENADOR' | 'ATLETA')[]
  children: ReactNode
}

export default function RutaRol({ roles, children }: Props): ReactNode {
  const { user } = useAuth()

  if (!user || !roles.includes(user.rol)) return <Navigate to="/" replace />

  return children
}
