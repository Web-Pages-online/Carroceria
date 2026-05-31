import { Router } from 'express';
import { TipoCarroceriaController } from '../controllers/TipoCarroceriaController';

const router = Router();

router.get('/', TipoCarroceriaController.obtenerTodos);
router.post('/', TipoCarroceriaController.crear);
router.put('/:id', TipoCarroceriaController.actualizar);
router.delete('/:id', TipoCarroceriaController.eliminar);

export default router;
