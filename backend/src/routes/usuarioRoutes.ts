import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { verificarToken } from '../middlewares/authMiddleware';
import { requerirRol } from '../middlewares/roleMiddleware';

const router = Router();

// Todas las rutas de usuarios requieren autenticación y rol de Super-Admin
router.use(verificarToken);
router.use(requerirRol(['ADMINISTRADOR', 'Super-Admin']));

router.get('/', UsuarioController.obtenerTodos);
router.post('/', UsuarioController.registrar);
router.put('/:id', UsuarioController.actualizar);
router.delete('/:id', UsuarioController.eliminar);

export default router;
