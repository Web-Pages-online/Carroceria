import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para permitir peticiones desde el frontend
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

import pedidoRoutes from './routes/pedidoRoutes';
import agenciaRoutes from './routes/agenciaRoutes';
import tipoCarroceriaRoutes from './routes/tipoCarroceriaRoutes';
import authRoutes from './routes/authRoutes';
import configRoutes from './routes/configRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import materialRoutes from './routes/materialRoutes';
import empleadoRoutes from './routes/empleadoRoutes';

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Registrar rutas de la aplicación
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes); // Rutas para roles y permisos
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/agencias', agenciaRoutes);
app.use('/api/tipos-carroceria', tipoCarroceriaRoutes);
app.use('/api/materiales', materialRoutes);
app.use('/api/empleados', empleadoRoutes);

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de Carrocería corriendo en http://localhost:${PORT}`);
});
