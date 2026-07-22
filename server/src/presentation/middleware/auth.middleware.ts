import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { env } from '../../lib/envConfig.js'

export const jwtCheck = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' })
    return
  }

  const token = header.split(' ')[1]

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string }
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
