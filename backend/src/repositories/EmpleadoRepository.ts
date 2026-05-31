import { prisma } from '../config/db';

export class EmpleadoRepository {
  findAll() {
    return prisma.empleado.findMany({ orderBy: { nombre: 'asc' } });
  }

  findById(id: number) {
    return prisma.empleado.findUnique({ where: { id } });
  }

  findByIdWithPedidos(id: number) {
    return prisma.empleado.findUnique({
      where: { id },
      include: {
        pedidos: {
          include: { agencia: true, tipo_carroceria: true },
          orderBy: { fecha_creacion: 'desc' },
        },
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
}
