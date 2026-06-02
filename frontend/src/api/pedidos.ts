import axios from 'axios';

// En producción usará la variable de entorno, en local usará localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

export default api;

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getPedidos = async () => {
  const response = await api.get('/pedidos');
  return response.data;
};

export const crearPedido = async (data: any) => {
  const response = await api.post('/pedidos', data);
  return response.data;
};

export const actualizarEstadoPedido = async (id: number, estado: string, fecha_entrega?: string) => {
  const response = await api.put(`/pedidos/${id}/estado`, { estado, fecha_entrega });
  return response.data;
};

export const getAgencias = async () => {
  const response = await api.get('/agencias');
  return response.data;
};

export const crearAgencia = async (data: any) => {
  const response = await api.post('/agencias', data);
  return response.data;
};

export const actualizarAgencia = async (id: number, data: any) => {
  const response = await api.put(`/agencias/${id}`, data);
  return response.data;
};

export const eliminarAgencia = async (id: number) => {
  const response = await api.delete(`/agencias/${id}`);
  return response.data;
};

export const getTiposCarroceria = async () => {
  const response = await api.get('/tipos-carroceria');
  return response.data;
};

export const crearTipoCarroceria = async (data: any) => {
  const response = await api.post('/tipos-carroceria', data);
  return response.data;
};

export const actualizarTipoCarroceria = async (id: number, data: any) => {
  const response = await api.put(`/tipos-carroceria/${id}`, data);
  return response.data;
};

export const eliminarTipoCarroceria = async (id: number) => {
  const response = await api.delete(`/tipos-carroceria/${id}`);
  return response.data;
};

// Empleados
export const getEmpleados = async () => {
  const response = await api.get('/empleados');
  return response.data;
};

export const getEmpleadoConPedidos = async (id: number) => {
  const response = await api.get(`/empleados/${id}`);
  return response.data;
};

export const crearEmpleado = async (data: any) => {
  const response = await api.post('/empleados', data);
  return response.data;
};

export const actualizarEmpleado = async (id: number, data: any) => {
  const response = await api.put(`/empleados/${id}`, data);
  return response.data;
};

export const eliminarEmpleado = async (id: number) => {
  const response = await api.delete(`/empleados/${id}`);
  return response.data;
};

export const enviarReciboPorCorreo = async (id: number) => {
  const response = await api.post(`/pedidos/${id}/enviar-recibo`);
  return response.data;
};

export const actualizarPedido = async (id: number, data: any) => {
  const response = await api.put(`/pedidos/${id}`, data);
  return response.data;
};

export const deletePedido = async (id: number) => {
  const response = await api.delete(`/pedidos/${id}`);
  return response.data;
};

// Materiales
export const getMateriales = async () => {
  const response = await api.get('/materiales');
  return response.data;
};

export const crearMaterial = async (data: any) => {
  const response = await api.post('/materiales', data);
  return response.data;
};

export const actualizarMaterial = async (id: number, data: any) => {
  const response = await api.put(`/materiales/${id}`, data);
  return response.data;
};

export const eliminarMaterial = async (id: number) => {
  const response = await api.delete(`/materiales/${id}`);
  return response.data;
};

// Receta
export const getReceta = async (tipoCarroceriaId: number) => {
  const response = await api.get(`/materiales/receta/${tipoCarroceriaId}`);
  return response.data;
};

export const guardarReceta = async (tipoCarroceriaId: number, items: { materialId: number; cantidadNecesaria: number }[]) => {
  const response = await api.post(`/materiales/receta/${tipoCarroceriaId}`, { items });
  return response.data;
};
