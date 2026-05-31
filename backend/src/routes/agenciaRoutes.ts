import { Router } from 'express';
import { AgenciaController } from '../controllers/AgenciaController';

const router = Router();

router.get('/', AgenciaController.obtenerTodas);
router.post('/', AgenciaController.crear);
router.put('/:id', AgenciaController.actualizar);
router.delete('/:id', AgenciaController.eliminar);

export default router;
