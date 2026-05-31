import { PermisoRepository } from '../repositories/PermisoRepository';

export class PermisoService {
  private repository: PermisoRepository;

  constructor() {
    this.repository = new PermisoRepository();
  }

  async obtenerTodos() {
    return this.repository.obtenerTodos();
  }

  async crear(data: { nombre: string, descripcion?: string }) {
    const existe = await this.repository.buscarPorNombre(data.nombre);
    if (existe) {
      throw new Error('El permiso ya existe.');
    }
    return this.repository.crear(data);
  }

  async actualizar(id: number, data: { nombre?: string, descripcion?: string }) {
    return this.repository.actualizar(id, data);
  }

  async eliminar(id: number) {
    const rolesCount = await this.repository.contarRoles(id);
    if (rolesCount > 0) {
      throw new Error(`No se puede eliminar el permiso porque está asignado a ${rolesCount} rol(es).`);
    }
    return this.repository.eliminar(id);
  }
}
