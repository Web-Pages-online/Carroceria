import { prisma } from '../config/db';
import { Rol, Permiso } from '@prisma/client';

export class RolRepository {
  async obtenerTodos() {
    return prisma.rol.findMany({
      include: {
        permisos: true,
        _count: {
          select: { permisos: true }
        }
      }
    });
  }

  async buscarPorId(id: number) {
    return prisma.rol.findUnique({
      where: { id },
      include: { permisos: true }
    });
  }

  async buscarPorNombre(nombre: string) {
    return prisma.rol.findUnique({
      where: { nombre }
    });
  }

  async crear(data: { nombre: string, descripcion?: string, permisosIds?: number[] }) {
    return prisma.rol.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        permisos: {
          connect: data.permisosIds?.map(id => ({ id })) || []
        }
      },
      include: { permisos: true }
    });
  }

  async actualizar(id: number, data: { nombre?: string, descripcion?: string, permisosIds?: number[] }) {
    return prisma.rol.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        permisos: data.permisosIds ? {
          set: data.permisosIds.map(permisoId => ({ id: permisoId }))
        } : undefined
      },
      include: { permisos: true }
    });
  }

  async eliminar(id: number) {
    await prisma.rol.delete({
      where: { id }
    });
  }

  async contarUsuarios(rolId: number) {
    return prisma.usuario.count({
      where: { rol_id: rolId }
    });
  }
}
