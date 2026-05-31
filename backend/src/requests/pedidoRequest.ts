import { z } from 'zod';

// Equivalente a un "CreatePedidoRequest" en otros frameworks
export const crearPedidoSchema = z.object({
  agencia_id: z.number({
    required_error: 'El ID de la agencia es obligatorio',
    invalid_type_error: 'El ID de la agencia debe ser un número',
  }),
  tipo_carroceria_id: z.number({
    required_error: 'El ID del tipo de carrocería es obligatorio',
  }),
  notas_taller: z.string().optional(),
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
