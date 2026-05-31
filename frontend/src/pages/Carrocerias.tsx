import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTiposCarroceria, crearTipoCarroceria, actualizarTipoCarroceria, eliminarTipoCarroceria } from '../api/pedidos';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';

const Carrocerias = () => {
  const [tipos, setTipos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });

  const cargarTipos = async () => {
    const data = await getTiposCarroceria();
    setTipos(data);
  };

  useEffect(() => {
    cargarTipos();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ nombre: '', descripcion: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (tipo: any) => {
    setEditingId(tipo.id);
    setForm({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#525252',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#171717',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await eliminarTipoCarroceria(id);
        await cargarTipos();
        Swal.fire({
          title: 'Eliminada',
          text: 'El tipo de carrocería ha sido eliminado.',
          icon: 'success',
          background: '#171717',
          color: '#fff',
          confirmButtonColor: '#f97316',
        });
      } catch (err: any) {
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.error || 'No se pudo eliminar.',
          icon: 'error',
          background: '#171717',
          color: '#fff',
          confirmButtonColor: '#f97316',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await actualizarTipoCarroceria(editingId, form);
      } else {
        await crearTipoCarroceria(form);
      }
      setIsModalOpen(false);
      await cargarTipos();
      
      Swal.fire({
        title: '¡Éxito!',
        text: editingId ? 'Actualizado correctamente' : 'Creado correctamente',
        icon: 'success',
        background: '#171717',
        color: '#fff',
        confirmButtonColor: '#f97316',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al guardar.',
        icon: 'error',
        background: '#171717',
        color: '#fff',
        confirmButtonColor: '#f97316',
      });
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Catálogo de Carrocerías</h1>
          <p className="text-neutral-400 mt-1">Administra los tipos de cajas y plataformas que fabricas.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreateModal}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-colors shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Carrocería</span>
        </motion.button>
      </div>

      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-neutral-300">
          <thead className="bg-neutral-800/50 text-neutral-400 text-sm">
            <tr>
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Descripción</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tipos.map((tipo) => (
              <tr key={tipo.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                <td className="p-4 text-white font-medium">{tipo.nombre}</td>
                <td className="p-4">{tipo.descripcion || '-'}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => openEditModal(tipo)} className="text-blue-400 hover:text-blue-300 transition-colors">
                    <Edit2 className="w-5 h-5 inline" />
                  </button>
                  <button onClick={() => handleDelete(tipo.id)} className="text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
            {tipos.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-neutral-500">No hay carrocerías registradas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Carrocería' : 'Nueva Carrocería'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Nombre (Tipo)</label>
            <input 
              type="text" 
              value={form.nombre} 
              onChange={e => setForm({...form, nombre: e.target.value})} 
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" 
              required 
              placeholder="Ej. Caja Seca 12ft"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Descripción / Notas</label>
            <textarea 
              value={form.descripcion} 
              onChange={e => setForm({...form, descripcion: e.target.value})} 
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors h-24" 
              placeholder="Detalles de materiales o especificaciones..."
            ></textarea>
          </div>

          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-700 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">{editingId ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Carrocerias;
