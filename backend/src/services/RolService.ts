import { RolRepository } from '../repositories/RolRepository';

export class RolService {
  private repository: RolRepository;

  constructor() {
    this.repository = new RolRepository();
  }

  async obtenerTodos() {
    return this.repository.obtenerTodos();
  }

  async crear(data: { nombre: string, descripcion?: string, permisosIds?: number[] }) {
    const existe = await this.repository.buscarPorNombre(data.nombre);
    if (existe) {
      throw new Error('El rol ya existe.');
    }
    return this.repository.crear(data);
  }

  async actualizar(id: number, data: { nombre?: string, descripcion?: string, permisosIds?: number[] }) {
    const rol = await this.repository.buscarPorId(id);
    if (!rol) {
      throw new Error('Rol no encontrado.');
    }
    return this.repository.actualizar(id, data);
  }

  async eliminar(id: number) {
    const rol = await this.repository.buscarPorId(id);
    if (!rol) {
      throw new Error('Rol no encontrado.');
    }
    const usuariosCount = await this.repository.contarUsuarios(id);
    if (usuariosCount > 0) {
      throw new Error(`No se puede eliminar el rol porque está asignado a ${usuariosCount} usuario(s).`);
    }
    return this.repository.eliminar(id);
  }
}
