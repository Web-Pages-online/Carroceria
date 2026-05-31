import { prisma } from '../config/db';

export class RecetaCarroceriaRepository {
  async findByTipoCarroceria(tipoCarroceriaId: number) {
    return prisma.recetaCarroceria.findMany({
      where: { tipoCarroceriaId },
      include: { material: true },
    });
  }

  async replaceReceta(tipoCarroceriaId: number, items: { materialId: number; cantidadNecesaria: number }[]) {
    await prisma.recetaCarroceria.deleteMany({ where: { tipoCarroceriaId } });
    if (items.length === 0) return [];
    return prisma.recetaCarroceria.createMany({
      data: items.map((item) => ({ tipoCarroceriaId, ...item })),
    });
  }
}
