import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreVertical, Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import { getPedidos, crearPedido, getAgencias, getTiposCarroceria } from '../api/pedidos';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [agencias, setAgencias] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dropdown de fila
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ agencia_id: '', tipo_carroceria_id: '' });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [dataPedidos, dataAgencias, dataTipos] = await Promise.all([
        getPedidos(), getAgencias(), getTiposCarroceria()
      ]);
      setPedidos(dataPedidos);
      setAgencias(dataAgencias);
      setTipos(dataTipos);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleOpenCreate = () => {
    setForm({ agencia_id: '', tipo_carroceria_id: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    
    const result = await Swal.fire({
      title: '¿Eliminar pedido?',
      text: "Esta acción no se puede deshacer y borrará todo el historial.",
      icon: 'warning',
      showCancelButton: true,
      background: '#171717',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#4b5563',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/pedidos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({
          title: 'Eliminado',
          text: 'El pedido ha sido eliminado.',
          icon: 'success',
          background: '#171717',
          color: '#fff',
          confirmButtonColor: '#f97316'
        });
        cargarDatos();
      } catch (error: any) {
        Swal.fire('Error', error.response?.data?.error || 'No se pudo eliminar', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await crearPedido({
        agencia_id: parseInt(form.agencia_id),
        tipo_carroceria_id: parseInt(form.tipo_carroceria_id)
      });
      Swal.fire({
        title: 'Pedido Creado',
        text: 'El pedido fue registrado exitosamente.',
        icon: 'success',
        background: '#171717',
        color: '#fff',
        confirmButtonColor: '#f97316',
        timer: 2000,
        showConfirmButton: false
      });
      setIsModalOpen(false);
      cargarDatos();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.error || 'No se pudo crear el pedido', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      'PENDIENTE': 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
      'EN_PROCESO': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'TERMINADO': 'bg-green-500/20 text-green-400 border-green-500/30',
      'ENTREGADO': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    const css = badges[status] || 'bg-neutral-500/20 text-neutral-400';
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${css}`}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Pedidos</h1>
        <p className="text-neutral-400 mt-1">Levanta nuevos pedidos y administra el historial completo.</p>
      </div>

      <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800/80 flex flex-col sm:flex-row gap-4 items-center justify-between bg-neutral-900/30">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Buscar pedidos por folio, agencia..." 
              className="w-full pl-9 pr-4 py-2 bg-neutral-950/50 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
          
          <button 
            onClick={handleOpenCreate}
            className="bg-orange-600 hover:bg-orange-500 text-white py-2 px-4 rounded-xl transition-colors shadow-lg shadow-orange-600/20 font-medium flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Levantar Pedido</span>
          </button>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-900/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 tracking-wider uppercase border-b border-neutral-800">Folio</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 tracking-wider uppercase border-b border-neutral-800">Agencia</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 tracking-wider uppercase border-b border-neutral-800">Tipo de Carrocería</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 tracking-wider uppercase border-b border-neutral-800">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 tracking-wider uppercase border-b border-neutral-800">Fecha Creado</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 tracking-wider uppercase border-b border-neutral-800 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {pedidos.map((pedido, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={pedido.id} 
                  className="hover:bg-neutral-800/30 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-orange-400 font-bold">#{pedido.id.toString().padStart(4, '0')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-white">{pedido.agencia?.nombre || 'Desconocida'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-300">{pedido.tipo_carroceria?.nombre || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(pedido.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-neutral-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(pedido.fecha_creacion).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === pedido.id ? null : pedido.id);
                      }}
                      className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors inline-flex focus:outline-none"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    <AnimatePresence>
                      {openDropdownId === pedido.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-10 top-0 w-36 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-20 overflow-hidden"
                        >
                          <button 
                            onClick={(e) => handleDelete(pedido.id, e)}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Levantar Nuevo Pedido">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Agencia (Cliente)</label>
            <select 
              value={form.agencia_id}
              onChange={e => setForm({...form, agencia_id: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-orange-500 transition-all"
              required
            >
              <option value="">Selecciona una agencia...</option>
              {agencias.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Tipo de Carrocería</label>
            <select 
              value={form.tipo_carroceria_id}
              onChange={e => setForm({...form, tipo_carroceria_id: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-orange-500 transition-all"
              required
            >
              <option value="">Selecciona un tipo...</option>
              {tipos.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex space-x-3">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-700 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Pedido'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pedidos;
