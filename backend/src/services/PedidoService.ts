import { PedidoRepository } from '../repositories/PedidoRepository';
import { Prisma } from '@prisma/client';

export class PedidoService {
  private pedidoRepository: PedidoRepository;

  constructor() {
    this.pedidoRepository = new PedidoRepository();
  }

  async crearPedido(data: Prisma.PedidoUncheckedCreateInput) {
    if (!data.agencia_id || !data.tipo_carroceria_id) {
      throw new Error('La agencia y el tipo de carrocería son obligatorios.');
    }
    return await this.pedidoRepository.create(data);
  }

  async obtenerTodos() {
    return await this.pedidoRepository.findAll();
  }

  async obtenerPorId(id: number) {
    const pedido = await this.pedidoRepository.findById(id);
    if (!pedido) {
      throw new Error(`No se encontró el pedido con id ${id}`);
    }
    return pedido;
  }

  async actualizarEstado(id: number, estado: string, fecha_entrega?: string) {
    // Regla de Negocio: Si el estado es ENTREGADO, necesita fecha_entrega
    if (estado === 'ENTREGADO' && !fecha_entrega) {
      throw new Error('Un pedido entregado debe tener una fecha de entrega.');
    }

    const fechaObj = fecha_entrega ? new Date(fecha_entrega) : undefined;
    return await this.pedidoRepository.updateEstado(id, estado, fechaObj);
  }

  async eliminarPedido(id: number) {
    await this.obtenerPorId(id); // Verifica si existe primero
    return await this.pedidoRepository.delete(id);
  }
}
