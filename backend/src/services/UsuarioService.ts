import { Usuario } from '@prisma/client';
import { UsuarioRepository } from '../repositories/UsuarioRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_123';

export class UsuarioService {
  private repository: UsuarioRepository;

  constructor() {
    this.repository = new UsuarioRepository();
  }

  async registrar(data: Omit<Usuario, 'id' | 'password_hash'> & { password_plana: string }): Promise<{ usuario: Omit<Usuario, 'password_hash'>, token: string }> {
    const existe = await this.repository.buscarPorEmail(data.email);
    if (existe) {
      throw new Error('El email ya está registrado.');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password_plana, salt);

    const usuarioData = {
      nombre: data.nombre,
      email: data.email,
      password_hash: password_hash,
      rol_id: data.rol_id,
      agencia_id: data.agencia_id || null
    };

    const nuevoUsuario = await this.repository.crear(usuarioData);

    const token = jwt.sign(
      { id: nuevoUsuario.id, rol_id: nuevoUsuario.rol_id, rol_nombre: nuevoUsuario.rol.nombre, email: nuevoUsuario.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash: _, ...usuarioSinPassword } = nuevoUsuario;

    return { usuario: usuarioSinPassword, token };
  }

  async login(email: string, password_plana: string): Promise<{ usuario: Omit<Usuario, 'password_hash'>, token: string }> {
    const usuario = await this.repository.buscarPorEmail(email);
    if (!usuario) {
      throw new Error('Credenciales incorrectas.');
    }

    const esValida = await bcrypt.compare(password_plana, usuario.password_hash);
    if (!esValida) {
      throw new Error('Credenciales incorrectas.');
    }

    const token = jwt.sign(
      { id: usuario.id, rol_id: usuario.rol_id, rol_nombre: usuario.rol.nombre, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash: _, ...usuarioSinPassword } = usuario;

    return { usuario: usuarioSinPassword, token };
  }

  async obtenerTodos() {
    return this.repository.obtenerTodos();
  }

  async actualizar(id: number, data: any) {
    // Si la contraseña se actualiza, hashearla
    if (data.password_plana) {
      const salt = await bcrypt.genSalt(10);
      data.password_hash = await bcrypt.hash(data.password_plana, salt);
      delete data.password_plana;
    }
    return this.repository.actualizar(id, data);
  }

  async eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
