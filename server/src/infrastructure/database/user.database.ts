import prisma from '../../lib/prisma.js'
import type { CreateUserInput, DomainUser } from '../../domain/types/user.types.js'

const publicFields = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const

type UserWithPassword = DomainUser & { password: string }

export const findByEmail = (email: string): Promise<UserWithPassword | null> =>
  prisma.user.findUnique({ where: { email } }) as Promise<UserWithPassword | null>

export const findUserById = (id: string): Promise<DomainUser | null> =>
  prisma.user.findUnique({ where: { id }, select: publicFields })

export const createUser = (data: CreateUserInput): Promise<DomainUser> =>
  prisma.user.create({
    data,
    select: publicFields,
  })

export const saveRefreshToken = (userId: string, token: string) =>
  prisma.refreshToken.create({
    data: { token, userId },
  })

export const findRefreshToken = (userId: string, token: string) =>
  prisma.refreshToken.findUnique({
    where: { token_userId: { token, userId } },
  })

export const deleteRefreshToken = (token: string) =>
  prisma.refreshToken.delete({ where: { token } })
