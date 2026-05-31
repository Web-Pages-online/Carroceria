import { Request, Response, NextFunction } from 'express';

// Middleware que verifica si el usuario tiene uno de los roles permitidos
export const requerirRol = (rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // El req.usuario viene del authMiddleware
    const usuario = (req as any).usuario;

    if (!usuario || !usuario.rol_nombre) {
      return res.status(403).json({ error: 'Acceso denegado. Rol no identificado.' });
    }

    if (!rolesPermitidos.includes(usuario.rol_nombre)) {
      return res.status(403).json({ error: 'Acceso denegado. No tienes permisos suficientes.' });
    }

    next();
  };
};
