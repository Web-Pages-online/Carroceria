import { Router } from 'express';
import { EmpleadoController } from '../controllers/EmpleadoController';

const router = Router();

router.get('/',                          EmpleadoController.obtenerTodos);
router.get('/:id',                       EmpleadoController.obtenerConRegistros);
router.post('/',                         EmpleadoController.crear);
router.put('/:id',                       EmpleadoController.actualizar);
router.delete('/:id',                    EmpleadoController.eliminar);
router.post('/:id/registros',            EmpleadoController.agregarRegistro);
router.delete('/:id/registros/:registroId', EmpleadoController.eliminarRegistro);

export default router;
