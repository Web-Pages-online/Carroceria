import 'dotenv/config';
import { prisma } from '../src/config/db';

async function main() {
  await prisma.agencia.create({
    data: { nombre: 'Agencia Central Sur', direccion: 'Av. Las Américas 404', telefono: '555-1234', contacto: 'Juan Pérez' }
  });
  await prisma.agencia.create({
    data: { nombre: 'Automotriz del Norte', direccion: 'Blvd. Principal 990', telefono: '555-5678', contacto: 'María Gómez' }
  });
  
  await prisma.tipoCarroceria.create({
    data: { nombre: 'Caja Seca', descripcion: 'Carrocería cerrada estándar', precio_base: 50000 }
  });
  await prisma.tipoCarroceria.create({
    data: { nombre: 'Caja Refrigerada', descripcion: 'Carrocería con aislamiento térmico', precio_base: 85000 }
  });
  await prisma.tipoCarroceria.create({
    data: { nombre: 'Plataforma', descripcion: 'Carrocería plana sin bordes', precio_base: 35000 }
  });

  console.log('¡Base de datos inicializada con éxito!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
