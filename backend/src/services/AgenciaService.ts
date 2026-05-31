import { Agencia } from '@prisma/client';
import { AgenciaRepository } from '../repositories/AgenciaRepository';

export class AgenciaService {
  private repository: AgenciaRepository;

  constructor() {
    this.repository = new AgenciaRepository();
  }

  async obtenerTodas(): Promise<Agencia[]> {
    return this.repository.obtenerTodas();
  }

  async crear(data: Omit<Agencia, 'id'>): Promise<Agencia> {
    if (!data.nombre) {
      throw new Error('El nombre de la agencia es obligatorio.');
    }
    return this.repository.crear(data);
  }

  async actualizar(id: number, data: Partial<Agencia>): Promise<Agencia> {
    const agencia = await this.repository.buscarPorId(id);
    if (!agencia) {
      throw new Error('Agencia no encontrada.');
    }
    return this.repository.actualizar(id, data);
  }

  async eliminar(id: number): Promise<void> {
    const agencia = await this.repository.buscarPorId(id);
    if (!agencia) {
      throw new Error('Agencia no encontrada.');
    }
    // La eliminación puede fallar si tiene pedidos asociados,
    // el controlador debe capturar este error de la BD.
    return this.repository.eliminar(id);
  }
}
