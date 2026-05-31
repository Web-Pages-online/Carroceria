import { Router } from 'express';
import { MaterialController } from '../controllers/MaterialController';

const router = Router();

router.get('/', MaterialController.obtenerTodos);
router.post('/', MaterialController.crear);
router.put('/:id', MaterialController.actualizar);
router.delete('/:id', MaterialController.eliminar);

router.get('/receta/:tipoId', MaterialController.obtenerReceta);
router.post('/receta/:tipoId', MaterialController.guardarReceta);

export default router;
