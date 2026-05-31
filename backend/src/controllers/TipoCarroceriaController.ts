import { Request, Response } from 'express';
import { TipoCarroceriaService } from '../services/TipoCarroceriaService';

const tipoCarroceriaService = new TipoCarroceriaService();

export class TipoCarroceriaController {
  static async obtenerTodos(req: Request, res: Response) {
    try {
      const tipos = await tipoCarroceriaService.obtenerTodos();
      res.json(tipos);
    } catch (error: any) {
      res.status(500).json({ error: 'Error al obtener tipos de carrocería' });
    }
  }

  static async crear(req: Request, res: Response) {
    try {
      const { nombre, descripcion, precio_base } = req.body;
      const tipo = await tipoCarroceriaService.crear({ nombre, descripcion, precio_base: precio_base || 0 });
      res.status(201).json(tipo);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al crear tipo de carrocería' });
    }
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { nombre, descripcion, precio_base } = req.body;
      const tipo = await tipoCarroceriaService.actualizar(id, { nombre, descripcion, precio_base });
      res.json(tipo);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar tipo de carrocería' });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await tipoCarroceriaService.eliminar(id);
      res.json({ message: 'Carrocería eliminada correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al eliminar tipo de carrocería' });
    }
  }
}
