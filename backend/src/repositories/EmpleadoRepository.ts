import { prisma } from '../config/db';

export class EmpleadoRepository {
  findAll() {
    return prisma.empleado.findMany({ orderBy: { nombre: 'asc' } });
  }

  findByIdWithRegistros(id: number) {
    return prisma.empleado.findUnique({
      where: { id },
      include: {
        registros: { orderBy: { fecha: 'desc' } },
      },
    });
  }

  create(data: { nombre: string; telefono?: string }) {
    return prisma.empleado.create({ data });
  }

  update(id: number, data: { nombre?: string; telefono?: string | null }) {
    return prisma.empleado.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.empleado.delete({ where: { id } });
  }

  agregarRegistro(data: { empleado_id: number; descripcion: string; fecha?: string }) {
    return prisma.registroTrabajo.create({
      data: {
        empleado_id: data.empleado_id,
        descripcion: data.descripcion,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
      },
    });
  }

  eliminarRegistro(id: number) {
    return prisma.registroTrabajo.delete({ where: { id } });
  }
}
