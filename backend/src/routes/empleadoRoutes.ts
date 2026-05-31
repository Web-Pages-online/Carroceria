import { Router } from 'express';
import { EmpleadoController } from '../controllers/EmpleadoController';

const router = Router();

router.get('/',           EmpleadoController.obtenerTodos);
router.get('/:id',        EmpleadoController.obtenerConPedidos);
router.post('/',          EmpleadoController.crear);
router.put('/:id',        EmpleadoController.actualizar);
router.delete('/:id',     EmpleadoController.eliminar);

export default router;
