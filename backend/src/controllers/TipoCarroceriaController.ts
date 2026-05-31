import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class TipoCarroceriaController {
  static async obtenerTodos(req: Request, res: Response) {
    try {
      const tipos = await prisma.tipoCarroceria.findMany({
        orderBy: { nombre: 'asc' }
      });
      res.json(tipos);
    } catch (error: any) {
      res.status(500).json({ error: 'Error al obtener tipos de carrocería' });
    }
  }

  static async crear(req: Request, res: Response) {
    try {
      const { nombre, descripcion } = req.body;
      const tipo = await prisma.tipoCarroceria.create({
        data: { nombre, descripcion }
      });
      res.status(201).json(tipo);
    } catch (error: any) {
      res.status(500).json({ error: 'Error al crear tipo de carrocería' });
    }
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;
      const tipo = await prisma.tipoCarroceria.update({
        where: { id: parseInt(id) },
        data: { nombre, descripcion }
      });
      res.json(tipo);
    } catch (error: any) {
      res.status(500).json({ error: 'Error al actualizar tipo de carrocería' });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar si hay pedidos asociados
      const pedidos = await prisma.pedido.findFirst({
        where: { tipo_carroceria_id: parseInt(id) }
      });

      if (pedidos) {
        return res.status(400).json({ error: 'No se puede eliminar la carrocería porque tiene pedidos asociados.' });
      }

      await prisma.tipoCarroceria.delete({
        where: { id: parseInt(id) }
      });
      res.json({ message: 'Carrocería eliminada correctamente' });
    } catch (error: any) {
      res.status(500).json({ error: 'Error al eliminar tipo de carrocería' });
    }
  }
}
