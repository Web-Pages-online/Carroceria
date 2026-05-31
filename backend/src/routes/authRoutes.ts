import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';

const router = Router();

router.post('/register', UsuarioController.registrar);
router.post('/login', UsuarioController.login);

export default router;
