import { prisma } from '../config/db';

export class PermisoRepository {
  async obtenerTodos() {
    return prisma.permiso.findMany({
      orderBy: { nombre: 'asc' }
    });
  }

  async buscarPorNombre(nombre: string) {
    return prisma.permiso.findUnique({
      where: { nombre }
    });
  }

  async crear(data: { nombre: string, descripcion?: string }) {
    return prisma.permiso.create({
      data
    });
  }

  async actualizar(id: number, data: { nombre?: string, descripcion?: string }) {
    return prisma.permiso.update({
      where: { id },
      data
    });
  }

  async eliminar(id: number) {
    return prisma.permiso.delete({
      where: { id }
    });
  }

  async contarRoles(permisoId: number) {
    const roles = await prisma.rol.count({
      where: {
        permisos: {
          some: { id: permisoId }
        }
      }
    });
    return roles;
  }
}
