import { z } from 'zod';

// Equivalente a un "CreatePedidoRequest" en otros frameworks
export const crearPedidoSchema = z.object({
  agencia_id:        z.number({ error: 'El ID de la agencia es obligatorio' }),
  tipo_vehiculo:     z.string().optional(),
  cantidad:          z.number().int().min(1).optional(),
  importe:           z.number().nonnegative().optional(),
  fecha_entrega_est: z.string().optional(),
  notas_taller:      z.string().optional(),
});

// Equivalente a un "UpdateEstadoPedidoRequest"
export const actualizarEstadoSchema = z.object({
  estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'TERMINADO', 'ENTREGADO'], {
    errorMap: () => ({ message: 'Estado inválido. Debe ser PENDIENTE, EN_PROCESO, TERMINADO o ENTREGADO.' })
  }),
  fecha_entrega: z.string().datetime().optional()
}).refine(data => {
  if (data.estado === 'ENTREGADO' && !data.fecha_entrega) {
    return false;
  }
  return true;
}, {
  message: 'Si el estado es ENTREGADO, debes proveer una fecha de entrega en formato válido.',
  path: ['fecha_entrega']
});
