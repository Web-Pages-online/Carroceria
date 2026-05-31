import { Request, Response } from 'express';
import { RolService } from '../services/RolService';

const rolService = new RolService();

export class RolController {
  static async obtenerTodos(req: Request, res: Response) {
    try {
      const roles = await rolService.obtenerTodos();
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ error: 'Error al obtener roles' });
    }
  }

  static async crear(req: Request, res: Response) {
    try {
      const rol = await rolService.crear(req.body);
      res.status(201).json(rol);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al crear rol' });
    }
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { nombre, descripcion, permisosIds } = req.body;
      const rol = await rolService.actualizar(id, { nombre, descripcion, permisosIds });
      res.json(rol);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar rol' });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await rolService.eliminar(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al eliminar rol' });
    }
  }
}
