import { Request, Response } from 'express';
import { PedidoService } from '../services/PedidoService';

const pedidoService = new PedidoService();

export class PedidoController {
  static async crear(req: Request, res: Response) {
    try {
      const nuevoPedido = await pedidoService.crearPedido(req.body);
      res.status(201).json(nuevoPedido);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async obtenerTodos(req: Request, res: Response) {
    try {
      const pedidos = await pedidoService.obtenerTodos();
      res.json(pedidos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async obtenerPorId(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const pedido = await pedidoService.obtenerPorId(id);
      res.json(pedido);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async actualizarEstado(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { estado, fecha_entrega } = req.body;
      const pedidoActualizado = await pedidoService.actualizarEstado(id, estado, fecha_entrega);
      res.json(pedidoActualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      await pedidoService.eliminarPedido(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
