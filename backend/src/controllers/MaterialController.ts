import { Request, Response } from 'express';
import { MaterialService } from '../services/MaterialService';
import { RecetaCarroceriaRepository } from '../repositories/RecetaCarroceriaRepository';

const service = new MaterialService();
const recetaRepo = new RecetaCarroceriaRepository();

export class MaterialController {
  static async obtenerTodos(req: Request, res: Response) {
    try {
      res.json(await service.obtenerTodos());
    } catch {
      res.status(500).json({ error: 'Error al obtener materiales' });
    }
  }

  static async crear(req: Request, res: Response) {
    try {
      const { nombre, unidadMedida, stockActual, stockMinimo } = req.body;
      res.status(201).json(await service.crear({ nombre, unidadMedida, stockActual: Number(stockActual), stockMinimo: Number(stockMinimo) }));
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { nombre, unidadMedida, stockActual, stockMinimo } = req.body;
      const data: any = {};
      if (nombre !== undefined) data.nombre = nombre;
      if (unidadMedida !== undefined) data.unidadMedida = unidadMedida;
      if (stockActual !== undefined) data.stockActual = Number(stockActual);
      if (stockMinimo !== undefined) data.stockMinimo = Number(stockMinimo);
      res.json(await service.actualizar(id, data));
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      await service.eliminar(parseInt(req.params.id as string));
      res.status(204).send();
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  static async obtenerReceta(req: Request, res: Response) {
    try {
      const tipoCarroceriaId = parseInt(req.params.tipoId as string);
      res.json(await recetaRepo.findByTipoCarroceria(tipoCarroceriaId));
    } catch {
      res.status(500).json({ error: 'Error al obtener receta' });
    }
  }

  static async guardarReceta(req: Request, res: Response) {
    try {
      const tipoCarroceriaId = parseInt(req.params.tipoId as string);
      const { items } = req.body;
      await recetaRepo.replaceReceta(tipoCarroceriaId, items);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}
