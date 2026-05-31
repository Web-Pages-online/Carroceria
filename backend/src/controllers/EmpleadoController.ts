import { Request, Response } from 'express';
import { EmpleadoRepository } from '../repositories/EmpleadoRepository';

const repo = new EmpleadoRepository();

export class EmpleadoController {
  static async obtenerTodos(req: Request, res: Response) {
    try { res.json(await repo.findAll()); }
    catch { res.status(500).json({ error: 'Error al obtener empleados' }); }
  }

  static async obtenerConRegistros(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const emp = await repo.findByIdWithRegistros(id);
      if (!emp) return res.status(404).json({ error: 'Empleado no encontrado' });
      res.json(emp);
    } catch { res.status(500).json({ error: 'Error al obtener empleado' }); }
  }

  static async crear(req: Request, res: Response) {
    try {
      const { nombre, telefono } = req.body;
      if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
      res.status(201).json(await repo.create({ nombre, telefono }));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { nombre, telefono } = req.body;
      res.json(await repo.update(id, { nombre, telefono: telefono || null }));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      await repo.delete(parseInt(req.params.id as string));
      res.status(204).send();
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  }

  static async agregarRegistro(req: Request, res: Response) {
    try {
      const empleado_id = parseInt(req.params.id as string);
      const { descripcion, fecha } = req.body;
      if (!descripcion) return res.status(400).json({ error: 'La descripción es obligatoria' });
      res.status(201).json(await repo.agregarRegistro({ empleado_id, descripcion, fecha }));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  }

  static async eliminarRegistro(req: Request, res: Response) {
    try {
      await repo.eliminarRegistro(parseInt(req.params.registroId as string));
      res.status(204).send();
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  }
}
