import { prisma } from '../config/db';
import { TipoCarroceria, Pedido } from '@prisma/client';

export class TipoCarroceriaRepository {
  async obtenerTodos(): Promise<TipoCarroceria[]> {
    return prisma.tipoCarroceria.findMany({
      orderBy: { nombre: 'asc' }
    });
  }

  async crear(data: Omit<TipoCarroceria, 'id'>): Promise<TipoCarroceria> {
    return prisma.tipoCarroceria.create({
      data
    });
  }

  async actualizar(id: number, data: Partial<TipoCarroceria>): Promise<TipoCarroceria> {
    return prisma.tipoCarroceria.update({
      where: { id },
      data
    });
  }

  async eliminar(id: number): Promise<void> {
    await prisma.tipoCarroceria.delete({
      where: { id }
    });
  }

  async buscarPorId(id: number): Promise<TipoCarroceria | null> {
    return prisma.tipoCarroceria.findUnique({
      where: { id }
    });
  }

  async contarPedidosAsociados(id: number): Promise<number> {
    return prisma.pedido.count({
      where: { tipo_carroceria_id: id }
    });
  }
}
