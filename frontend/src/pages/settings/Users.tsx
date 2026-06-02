import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, Plus, User as UserIcon, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import Swal from 'sweetalert2';
import api from '../../api/pedidos';

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dropdown de fila
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [agencias, setAgencias] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol_id: '',
    agencia_id: ''
  });

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/usuarios');
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [resRoles, resAgencias] = await Promise.all([
        api.get('/config/roles'),
        api.get('/agencias')
      ]);
      setRoles(resRoles.data);
      setAgencias(resAgencias.data);
    } catch (error) {
      console.error("Error fetching dependencies");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDependencies();
    
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setForm({ nombre: '', email: '', password: '', rol_id: '', agencia_id: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    setEditingUserId(user.id);
    setForm({
      nombre: user.nombre,
      email: user.email,
      password: '', // En edición es opcional
      rol_id: user.rol_id ? user.rol_id.toString() : '',
      agencia_id: user.agencia_id ? user.agencia_id.toString() : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
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
        await api.delete(`/usuarios/${id}`);
        Swal.fire({
          title: 'Eliminado',
          text: 'El usuario ha sido eliminado.',
          icon: 'success',
          background: '#171717',
          color: '#fff',
          confirmButtonColor: '#f97316'
        });
        fetchUsers();
      } catch (error: any) {
        Swal.fire('Error', error.response?.data?.error || 'No se pudo eliminar', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        nombre: form.nombre,
        email: form.email,
        rol_id: parseInt(form.rol_id),
        agencia_id: form.agencia_id ? parseInt(form.agencia_id) : null
      };
      
      if (form.password) {
        if (editingUserId) {
          payload.password_plana = form.password; // El backend procesa password_plana para actualizar
        } else {
          payload.password = form.password; // En creación
        }
      }

      if (editingUserId) {
        await api.put(`/usuarios/${editingUserId}`, payload);
      } else {
        await api.post('/usuarios', payload);
      }
      
      Swal.fire({
        title: editingUserId ? 'Usuario Actualizado' : 'Usuario Creado',
        icon: 'success',
        background: '#171717',
        color: '#fff',
        confirmButtonColor: '#f97316',
        timer: 2000,
        showConfirmButton: false
      });
      
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.error || 'No se pudo guardar el usuario', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Users Management</h1>
        <p className="text-neutral-400 mt-1">Administra los accesos y cuentas del sistema.</p>
      </div>

      <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800/80 flex flex-col sm:flex-row gap-4 items-center justify-between bg-neutral-900/30">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search user..." 
                className="w-full pl-9 pr-4 py-2 bg-neutral-950/50 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
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
                <th className="px-6 py-4 text-xs font-semibold text-cyan-500 tracking-wider uppercase border-b border-neutral-800">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-cyan-500 tracking-wider uppercase border-b border-neutral-800">Email</th>
                <th className="px-6 py-4 text-xs font-semibold text-cyan-500 tracking-wider uppercase border-b border-neutral-800 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {users.map((user, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={user.id} 
                  className="hover:bg-neutral-800/30 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-cyan-500 font-bold border border-neutral-700 shadow-inner mr-4">
                        {user.nombre.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">{user.nombre}</div>
                        <div className="text-xs text-neutral-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-300">{user.rol?.nombre || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-400">{user.email}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === user.id ? null : user.id);
                      }}
                      className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors focus:outline-none"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    <AnimatePresence>
                      {openDropdownId === user.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-10 top-10 w-36 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-20 overflow-hidden"
                        >
                          <button 
                            onClick={(e) => handleOpenEdit(user, e)}
                            className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center"
                          >
                            <Edit2 className="w-4 h-4 mr-2" /> Editar
                          </button>
                          <button 
                            onClick={(e) => handleDelete(user.id, e)}
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
          <span className="text-xs text-neutral-500">Showing <span className="text-white font-medium">{users.length > 0 ? 1 : 0} - {users.length}</span> of <span className="text-white font-medium">{users.length}</span> results</span>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUserId ? "Editar Usuario" : "Crear Nuevo Usuario"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              required
              value={form.nombre}
              onChange={(e) => setForm({...form, nombre: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-cyan-500 transition-all"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-cyan-500 transition-all"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Contraseña {editingUserId && "(Opcional, dejar en blanco para no cambiar)"}</label>
            <input 
              type="password" 
              required={!editingUserId}
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-cyan-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Rol</label>
            <select 
              required
              value={form.rol_id}
              onChange={(e) => setForm({...form, rol_id: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-cyan-500 transition-all"
            >
              <option value="">Selecciona un rol...</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Agencia (Opcional)</label>
            <select 
              value={form.agencia_id}
              onChange={(e) => setForm({...form, agencia_id: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-cyan-500 transition-all"
            >
              <option value="">Ninguna (Acceso Global)</option>
              {agencias.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
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
              className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : (editingUserId ? 'Actualizar Usuario' : 'Crear Usuario')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
