import { Request, Response } from 'express';
import { PermisoService } from '../services/PermisoService';

const permisoService = new PermisoService();

export class PermisoController {
  static async obtenerTodos(req: Request, res: Response) {
    try {
      const permisos = await permisoService.obtenerTodos();
      res.json(permisos);
    } catch (error: any) {
      res.status(500).json({ error: 'Error al obtener permisos' });
    }
  }

  static async crear(req: Request, res: Response) {
    try {
      const { nombre, descripcion } = req.body;
      const permiso = await permisoService.crear({ nombre, descripcion });
      res.status(201).json(permiso);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al crear permiso' });
    }
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { nombre, descripcion } = req.body;
      const permiso = await permisoService.actualizar(id, { nombre, descripcion });
      res.json(permiso);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar permiso' });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await permisoService.eliminar(id);
      res.json({ message: 'Permiso eliminado exitosamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al eliminar permiso' });
    }
  }
}
