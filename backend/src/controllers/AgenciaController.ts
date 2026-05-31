import { Request, Response } from 'express';
import { AgenciaService } from '../services/AgenciaService';

const agenciaService = new AgenciaService();

export class AgenciaController {
  static async obtenerTodas(req: Request, res: Response) {
    try {
      const agencias = await agenciaService.obtenerTodas();
      res.json(agencias);
    } catch (error: any) {
      res.status(500).json({ error: 'Error al obtener agencias' });
    }
  }

  static async crear(req: Request, res: Response) {
    try {
      const { nombre, direccion, telefono, contacto, email, latitud, longitud } = req.body;
      const agencia = await agenciaService.crear({ nombre, direccion, telefono, contacto, email, latitud, longitud });
      res.status(201).json(agencia);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al crear la agencia' });
    }
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { nombre, direccion, telefono, contacto, email, latitud, longitud } = req.body;
      const agencia = await agenciaService.actualizar(id, { nombre, direccion, telefono, contacto, email, latitud, longitud });
      res.json(agencia);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar la agencia' });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await agenciaService.eliminar(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al eliminar la agencia (asegúrate de que no tenga pedidos asociados)' });
    }
  }
}
