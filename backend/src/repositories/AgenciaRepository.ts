import { prisma } from '../config/db';
import { Agencia } from '@prisma/client';

export class AgenciaRepository {
  async obtenerTodas(): Promise<Agencia[]> {
    return prisma.agencia.findMany({
      orderBy: { nombre: 'asc' }
    });
  }

  async crear(data: Omit<Agencia, 'id'>): Promise<Agencia> {
    return prisma.agencia.create({
      data
    });
  }

  async actualizar(id: number, data: Partial<Agencia>): Promise<Agencia> {
    return prisma.agencia.update({
      where: { id },
      data
    });
  }

  async eliminar(id: number): Promise<void> {
    await prisma.agencia.delete({
      where: { id }
    });
  }

  async buscarPorId(id: number): Promise<Agencia | null> {
    return prisma.agencia.findUnique({
      where: { id }
    });
  }
}
