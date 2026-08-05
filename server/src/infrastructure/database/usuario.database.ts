import prisma from '../../lib/prisma.js'
import type { CrearUsuarioInput, Usuario } from '../../domain/types/usuario.types.js'

const camposPublicos = {
  id: true,
  nombre: true,
  correo: true,
  rol: true,
  creadoEn: true,
} as const

type UsuarioConContrasena = Usuario & { contrasena: string }

export const buscarPorCorreo = (correo: string): Promise<UsuarioConContrasena | null> =>
  prisma.usuario.findUnique({
    where: { correo },
    select: { ...camposPublicos, contrasena: true },
  }) as Promise<UsuarioConContrasena | null>

export const buscarUsuarioPorId = (id: string): Promise<Usuario | null> =>
  prisma.usuario.findUnique({ where: { id }, select: camposPublicos })

export const crearUsuario = (data: CrearUsuarioInput): Promise<Usuario> =>
  prisma.usuario.create({ data, select: camposPublicos })

export const guardarTokenRefresco = (usuarioId: string, token: string): Promise<void> =>
  prisma.tokenRefresco.create({ data: { token, usuarioId } }).then(() => undefined)

export const buscarTokenRefresco = (usuarioId: string, token: string): Promise<{ token: string } | null> =>
  prisma.tokenRefresco.findUnique({
    where: { token_usuarioId: { token, usuarioId } },
    select: { token: true },
  })

export const eliminarTokenRefresco = (token: string): Promise<void> =>
  prisma.tokenRefresco.delete({ where: { token } }).then(() => undefined)
