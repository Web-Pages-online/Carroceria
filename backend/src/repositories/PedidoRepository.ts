import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class PedidoRepository {
  async create(data: Prisma.PedidoUncheckedCreateInput) {
    return await prisma.pedido.create({
      data,
      include: {
        agencia: true,
        tipo_carroceria: true,
      },
    });
  }

  async findAll() {
    return await prisma.pedido.findMany({
      include: {
        agencia: true,
        tipo_carroceria: true,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });
  }

  async findById(id: number) {
    return await prisma.pedido.findUnique({
      where: { id },
      include: {
        agencia: true,
        tipo_carroceria: true,
      },
    });
  }

  async update(id: number, data: Prisma.PedidoUncheckedUpdateInput) {
    return await prisma.pedido.update({
      where: { id },
      data,
      include: { agencia: true, tipo_carroceria: true },
    });
  }

  async updateEstado(id: number, estado: string, fecha_entrega?: Date) {
    return await prisma.pedido.update({
      where: { id },
      data: {
        estado,
        fecha_entrega,
      },
    });
  }

  async delete(id: number) {
    return await prisma.pedido.delete({
      where: { id },
    });
  }
}
