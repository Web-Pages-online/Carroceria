import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { validateRequest } from '../middlewares/validateRequest';
import { crearPedidoSchema, actualizarEstadoSchema } from '../requests/pedidoRequest';

const router = Router();

// Agregamos el middleware de validación antes del controlador
router.post('/', validateRequest(crearPedidoSchema), PedidoController.crear);
router.get('/', PedidoController.obtenerTodos);
router.get('/:id/cotizacion', PedidoController.generarCotizacion);
router.get('/:id/recibo', PedidoController.generarRecibo);
router.get('/:id', PedidoController.obtenerPorId);
router.put('/:id', PedidoController.actualizar);
router.put('/:id/estado', validateRequest(actualizarEstadoSchema), PedidoController.actualizarEstado);
router.delete('/:id', PedidoController.eliminar);

export default router;
