import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Este middleware actúa como la barrera: si el "Request" no cumple con
// las reglas definidas, lo rechaza antes de llegar al Controller.
export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Intenta validar el cuerpo de la petición con el esquema
      await schema.parseAsync(req.body);
      next(); // Si todo está bien, pasa al Controller
    } catch (error: any) {
      // Si falla la validación, devuelve un error 400 (Bad Request)
      res.status(400).json({
        mensaje: 'Error de validación en la petición',
        errores: error.errors, // Zod devuelve exactamente qué campos fallaron
      });
    }
  };
};
