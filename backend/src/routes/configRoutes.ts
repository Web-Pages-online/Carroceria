import { Router } from 'express';
import { RolController } from '../controllers/RolController';
import { PermisoController } from '../controllers/PermisoController';
import { verificarToken } from '../middlewares/authMiddleware';
import { requerirRol } from '../middlewares/roleMiddleware';

const router = Router();

// Solo el Super-Admin puede acceder a configuraciones
router.use(verificarToken);
router.use(requerirRol(['ADMINISTRADOR', 'Super-Admin']));

// Rutas de Roles
router.get('/roles', RolController.obtenerTodos);
router.post('/roles', RolController.crear);
router.put('/roles/:id', RolController.actualizar);
router.delete('/roles/:id', RolController.eliminar);

// Rutas de Permisos
router.get('/permisos', PermisoController.obtenerTodos);
router.post('/permisos', PermisoController.crear);
router.put('/permisos/:id', PermisoController.actualizar);
router.delete('/permisos/:id', PermisoController.eliminar);

export default router;
