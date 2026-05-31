import { prisma } from '../config/db';
import { Usuario } from '@prisma/client';

export class UsuarioRepository {
  async crear(data: Omit<Usuario, 'id'>) {
    return prisma.usuario.create({
      data,
      include: { rol: true }
    });
  }

  async buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
      include: { rol: true }
    });
  }

  async buscarPorId(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      include: { rol: true }
    });
  }

  async obtenerTodos() {
    return prisma.usuario.findMany({
      include: { rol: true, agencia: true },
      orderBy: { id: 'asc' }
    });
  }

  async actualizar(id: number, data: Partial<Omit<Usuario, 'id'>>) {
    return prisma.usuario.update({
      where: { id },
      data,
      include: { rol: true, agencia: true }
    });
  }

  async eliminar(id: number) {
    return prisma.usuario.delete({
      where: { id }
    });
  }
}
