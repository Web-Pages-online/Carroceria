import { MaterialRepository } from '../repositories/MaterialRepository';
import { RecetaCarroceriaRepository } from '../repositories/RecetaCarroceriaRepository';

const repo = new MaterialRepository();
const recetaRepo = new RecetaCarroceriaRepository();

export class MaterialService {
  async obtenerTodos() {
    return repo.findAll();
  }

  async crear(data: { nombre: string; unidadMedida: string; stockActual: number; stockMinimo: number }) {
    return repo.create(data);
  }

  async actualizar(id: number, data: Partial<{ nombre: string; unidadMedida: string; stockActual: number; stockMinimo: number }>) {
    const existe = await repo.findById(id);
    if (!existe) throw new Error(`Material con id ${id} no encontrado`);
    return repo.update(id, data);
  }

  async eliminar(id: number) {
    const existe = await repo.findById(id);
    if (!existe) throw new Error(`Material con id ${id} no encontrado`);
    return repo.delete(id);
  }

  async verificarYDescontarStock(tipoCarroceriaId: number): Promise<void> {
    const receta = await recetaRepo.findByTipoCarroceria(tipoCarroceriaId);
    if (receta.length === 0) return;

    const faltantes = receta
      .filter((r) => r.material.stockActual < r.cantidadNecesaria)
      .map((r) => ({
        material: r.material.nombre,
        necesario: r.cantidadNecesaria,
        disponible: r.material.stockActual,
        unidad: r.material.unidadMedida,
      }));

    if (faltantes.length > 0) {
      const err: any = new Error('Stock insuficiente para iniciar la construcción');
      err.faltantes = faltantes;
      err.status = 409;
      throw err;
    }

    for (const item of receta) {
      await repo.decrementarStock(item.materialId, item.cantidadNecesaria);
    }
  }
}
