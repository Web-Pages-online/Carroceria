import { TipoCarroceria } from '@prisma/client';
import { TipoCarroceriaRepository } from '../repositories/TipoCarroceriaRepository';

export class TipoCarroceriaService {
  private repository: TipoCarroceriaRepository;

  constructor() {
    this.repository = new TipoCarroceriaRepository();
  }

  async obtenerTodos(): Promise<TipoCarroceria[]> {
    return this.repository.obtenerTodos();
  }

  async crear(data: Omit<TipoCarroceria, 'id'>): Promise<TipoCarroceria> {
    if (!data.nombre) {
      throw new Error('El nombre de la carrocería es obligatorio.');
    }
    return this.repository.crear(data);
  }

  async actualizar(id: number, data: Partial<TipoCarroceria>): Promise<TipoCarroceria> {
    const tipo = await this.repository.buscarPorId(id);
    if (!tipo) {
      throw new Error('Tipo de carrocería no encontrado.');
    }
    return this.repository.actualizar(id, data);
  }

  async eliminar(id: number): Promise<void> {
    const tipo = await this.repository.buscarPorId(id);
    if (!tipo) {
      throw new Error('Tipo de carrocería no encontrado.');
    }

    const cantidadPedidos = await this.repository.contarPedidosAsociados(id);
    if (cantidadPedidos > 0) {
      throw new Error('No se puede eliminar la carrocería porque tiene pedidos asociados.');
    }

    return this.repository.eliminar(id);
  }
}
