import { Request, Response } from 'express';
import { UsuarioService } from '../services/UsuarioService';

const usuarioService = new UsuarioService();

export class UsuarioController {
  static async registrar(req: Request, res: Response) {
    try {
      const { nombre, email, password, rol_id, agencia_id } = req.body;
      
      if (!nombre || !email || !password || !rol_id) {
        return res.status(400).json({ error: 'Nombre, email, password y rol_id son requeridos.' });
      }

      const resultado = await usuarioService.registrar({
        nombre,
        email,
        password_plana: password,
        rol_id,
        agencia_id
      });

      res.status(201).json(resultado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al registrar usuario' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y password son requeridos.' });
      }

      const resultado = await usuarioService.login(email, password);
      res.json(resultado);
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Error de autenticación' });
    }
  }

  static async obtenerTodos(req: Request, res: Response) {
    try {
      const usuarios = await usuarioService.obtenerTodos();
      res.json(usuarios);
    } catch (error: any) {
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const usuario = await usuarioService.actualizar(id, req.body);
      res.json(usuario);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar usuario' });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await usuarioService.eliminar(id);
      res.json({ message: 'Usuario eliminado' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al eliminar usuario' });
    }
  }
}
