import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class AgenciaController {
  static async obtenerTodas(req: Request, res: Response) {
    try {
      const agencias = await prisma.agencia.findMany({
        orderBy: { nombre: 'asc' }
      });
      res.json(agencias);
    } catch (error: any) {
      res.status(500).json({ error: 'Error al obtener agencias' });
    }
  }

  static async crear(req: Request, res: Response) {
    try {
      const { nombre, direccion, telefono, contacto, latitud, longitud } = req.body;
      const agencia = await prisma.agencia.create({
        data: { nombre, direccion, telefono, contacto, latitud, longitud }
      });
      res.status(201).json(agencia);
    } catch (error: any) {
      res.status(500).json({ error: 'Error al crear la agencia' });
    }
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { nombre, direccion, telefono, contacto, latitud, longitud } = req.body;
      const agencia = await prisma.agencia.update({
        where: { id },
        data: { nombre, direccion, telefono, contacto, latitud, longitud }
      });
      res.json(agencia);
    } catch (error: any) {
      res.status(500).json({ error: 'Error al actualizar la agencia' });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await prisma.agencia.delete({ where: { id } });
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: 'Error al eliminar la agencia (asegúrate de que no tenga pedidos asociados)' });
    }
  }
}
