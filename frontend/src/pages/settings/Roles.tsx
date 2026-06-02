import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Edit2, Trash2, Plus, Search } from 'lucide-react';
import Modal from '../../components/Modal';
import Swal from 'sweetalert2';
import api from '../../api/pedidos';

const Roles = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });

  const fetchRoles = async () => {
    try {
      const { data } = await api.get('/config/roles');
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenCreate = () => {
    setEditingRoleId(null);
    setForm({ nombre: '', descripcion: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rol: any) => {
    setEditingRoleId(rol.id);
    setForm({
      nombre: rol.nombre,
      descripcion: rol.descripcion || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar rol?',
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
        await api.delete(`/config/roles/${id}`);
        Swal.fire({
          title: 'Eliminado',
          text: 'El rol ha sido eliminado.',
          icon: 'success',
          background: '#171717',
          color: '#fff',
          confirmButtonColor: '#f97316'
        });
        fetchRoles();
      } catch (error: any) {
        Swal.fire('Error', error.response?.data?.error || 'No se pudo eliminar', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingRoleId) {
        await api.put(`/config/roles/${editingRoleId}`, form);
      } else {
        await api.post('/config/roles', form);
      }
      Swal.fire({ 
        title: editingRoleId ? 'Rol Actualizado' : 'Rol Creado', 
        icon: 'success', 
        background: '#171717', 
        color: '#fff', 
        confirmButtonColor: '#f97316', 
        timer: 2000, 
        showConfirmButton: false 
      });
      setIsModalOpen(false);
      fetchRoles();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.error || 'Error al guardar rol', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleColor = (index: number) => {
    const colors = [
      'text-orange-500 bg-orange-500/10 border-orange-500/20',
      'text-blue-500 bg-blue-500/10 border-blue-500/20',
      'text-green-500 bg-green-500/10 border-green-500/20',
      'text-purple-500 bg-purple-500/10 border-purple-500/20',
      'text-pink-500 bg-pink-500/10 border-pink-500/20',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-6 mb-8 flex items-center shadow-2xl">
        <div className="w-16 h-16 bg-cyan-500/10 text-cyan-500 rounded-2xl flex items-center justify-center mr-6 border border-cyan-500/20 shadow-inner">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Roles Management</h1>
          <p className="text-neutral-400 mt-1">Manage roles and permissions</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search roles" 
            className="w-full pl-9 pr-4 py-2 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-neutral-400 hidden sm:block"><UsersIcon className="w-4 h-4 inline mr-2"/>{roles.length} roles found</span>
          <button 
            onClick={handleOpenCreate}
            className="bg-cyan-600 hover:bg-cyan-500 text-white w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-cyan-600/30"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar pb-6 pr-2">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          roles.map((rol, idx) => {
            const colorClass = getRoleColor(idx);
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={rol.id} 
                className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-6 flex flex-col shadow-xl hover:border-neutral-700 transition-colors group"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{rol.nombre}</h3>
                </div>

                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-neutral-500">Permissions:</span>
                  <span className="text-white font-bold">{rol._count?.permisos || 0}</span>
                </div>
                
                <div className="flex justify-between items-center mb-6 text-sm">
                  <span className="text-neutral-500">Created:</span>
                  <span className="text-white">Hoy</span>
                </div>

                <div className="mb-6 flex-1">
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-2 block">Main permissions:</span>
                  <div className="flex flex-wrap gap-2">
                    {rol.permisos && rol.permisos.length > 0 ? (
                      rol.permisos.slice(0, 3).map((p: any) => (
                        <span key={p.id} className="text-xs px-2 py-1 bg-neutral-800 text-neutral-300 rounded-md border border-neutral-700/50">
                          {p.nombre}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-600 italic">No permissions assigned</span>
                    )}
                    {rol.permisos && rol.permisos.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-cyan-900/30 text-cyan-400 rounded-md border border-cyan-800/50 font-medium">
                        +{rol.permisos.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-auto pt-4 border-t border-neutral-800/50">
                  <button 
                    onClick={() => handleOpenEdit(rol)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-colors text-sm font-medium border border-neutral-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(rol.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors border border-red-500/20"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoleId ? "Editar Rol" : "Crear Nuevo Rol"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Role Name</label>
            <input 
              type="text" 
              required
              value={form.nombre}
              onChange={(e) => setForm({...form, nombre: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-cyan-500 transition-all"
              placeholder="e.g. Inspector"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
            <textarea 
              value={form.descripcion}
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-cyan-500 transition-all h-24 resize-none"
              placeholder="Brief description of this role's responsibilities"
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
              {isSubmitting ? 'Guardando...' : (editingRoleId ? 'Actualizar Rol' : 'Crear Rol')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default Roles;
