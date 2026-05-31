import { PedidoRepository } from '../repositories/PedidoRepository';
import { MaterialService } from './MaterialService';
import { Prisma } from '@prisma/client';

export class PedidoService {
  private pedidoRepository: PedidoRepository;
  private materialService: MaterialService;

  constructor() {
    this.pedidoRepository = new PedidoRepository();
    this.materialService = new MaterialService();
  }

  async crearPedido(data: Prisma.PedidoUncheckedCreateInput) {
    if (!data.agencia_id) {
      throw new Error('La agencia es obligatoria.');
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
    if (estado === 'ENTREGADO' && !fecha_entrega) {
      throw new Error('Un pedido entregado debe tener una fecha de entrega.');
    }

    if (estado === 'EN_PROCESO') {
      const pedido = await this.obtenerPorId(id);
      await this.materialService.verificarYDescontarStock(pedido.tipo_carroceria_id);
    }

    const fechaObj = fecha_entrega ? new Date(fecha_entrega) : undefined;
    return await this.pedidoRepository.updateEstado(id, estado, fechaObj);
  }

  async eliminarPedido(id: number) {
    await this.obtenerPorId(id); // Verifica si existe primero
    return await this.pedidoRepository.delete(id);
  }
}
