import { prisma } from '../config/db';

export class MaterialRepository {
  async findAll() {
    return prisma.material.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findById(id: number) {
    return prisma.material.findUnique({ where: { id } });
  }

  async create(data: { nombre: string; unidadMedida: string; stockActual: number; stockMinimo: number }) {
    return prisma.material.create({ data });
  }

  async update(id: number, data: Partial<{ nombre: string; unidadMedida: string; stockActual: number; stockMinimo: number }>) {
    return prisma.material.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.material.delete({ where: { id } });
  }

  async decrementarStock(id: number, cantidad: number) {
    return prisma.material.update({
      where: { id },
      data: { stockActual: { decrement: cantidad } },
    });
  }
}
