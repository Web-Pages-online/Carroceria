import axios from 'axios';

// En producción usará la variable de entorno, en local usará localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
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
