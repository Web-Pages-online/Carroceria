import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Search, MoreVertical, Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import Swal from 'sweetalert2';
import api from '../../api/pedidos';

const Permisos = () => {
  const [permisos, setPermisos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dropdown de fila
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermisoId, setEditingPermisoId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });

  const fetchPermisos = async () => {
    try {
      const { data } = await api.get('/config/permisos');
      setPermisos(data);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermisos();
    
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleOpenCreate = () => {
    setEditingPermisoId(null);
    setForm({ nombre: '', descripcion: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (permiso: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    setEditingPermisoId(permiso.id);
    setForm({
      nombre: permiso.nombre,
      descripcion: permiso.descripcion || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    
    const result = await Swal.fire({
      title: '¿Eliminar permiso?',
      text: "Esta acción no se puede deshacer.",
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
        await api.delete(`/config/permisos/${id}`);
        Swal.fire({
          title: 'Eliminado',
          text: 'El permiso ha sido eliminado.',
          icon: 'success',
          background: '#171717',
          color: '#fff',
          confirmButtonColor: '#f97316'
        });
        fetchPermisos();
      } catch (error: any) {
        Swal.fire('Error', error.response?.data?.error || 'No se pudo eliminar', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingPermisoId) {
        await api.put(`/config/permisos/${editingPermisoId}`, form);
      } else {
        await api.post('/config/permisos', form
        });
      }
      
      Swal.fire({
        title: editingPermisoId ? 'Permiso Actualizado' : 'Permiso Creado',
        icon: 'success',
        background: '#171717',
        color: '#fff',
        confirmButtonColor: '#f97316',
        timer: 2000,
        showConfirmButton: false
      });
      
      setIsModalOpen(false);
      fetchPermisos();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.error || 'No se pudo guardar el permiso', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Permissions</h1>
        <p className="text-neutral-400 mt-1">Detailed list of system access rights.</p>
      </div>

      <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800/80 flex flex-col sm:flex-row gap-4 items-center justify-between bg-neutral-900/30">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search permissions..." 
              className="w-full pl-9 pr-4 py-2 bg-neutral-950/50 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
          
          <button 
            onClick={handleOpenCreate}
            className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-xl transition-colors shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-900/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-cyan-500 tracking-wider uppercase border-b border-neutral-800">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-cyan-500 tracking-wider uppercase border-b border-neutral-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {permisos.map((permiso, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={permiso.id} 
                  className="hover:bg-neutral-800/30 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Key className="w-4 h-4 text-neutral-500 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">{permiso.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === permiso.id ? null : permiso.id);
                      }}
                      className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors inline-flex focus:outline-none"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    <AnimatePresence>
                      {openDropdownId === permiso.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-10 top-0 w-36 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-20 overflow-hidden"
                        >
                          <button 
                            onClick={(e) => handleOpenEdit(permiso, e)}
                            className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center"
                          >
                            <Edit2 className="w-4 h-4 mr-2" /> Editar
                          </button>
                          <button 
                            onClick={(e) => handleDelete(permiso.id, e)}
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
              <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/50 flex items-center justify-between">
          <span className="text-xs text-neutral-500">Showing <span className="text-white font-medium">{permisos.length > 0 ? 1 : 0} - {permisos.length}</span> of <span className="text-white font-medium">{permisos.length}</span> results</span>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPermisoId ? "Editar Permiso" : "Crear Nuevo Permiso"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Nombre del Permiso</label>
            <input 
              type="text" 
              required
              value={form.nombre}
              onChange={(e) => setForm({...form, nombre: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-cyan-500 transition-all"
              placeholder="ej. pedidos.crear"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Descripción</label>
            <textarea 
              value={form.descripcion}
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-cyan-500 transition-all h-24 resize-none"
              placeholder="Opcional. Describe lo que hace este permiso."
            ></textarea>
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
              className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : (editingPermisoId ? 'Actualizar Permiso' : 'Crear Permiso')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Permisos;
