import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  getTiposCarroceria, crearTipoCarroceria, actualizarTipoCarroceria, eliminarTipoCarroceria,
  getMateriales, getReceta, guardarReceta,
} from '../api/pedidos';
import { Plus, Edit2, Trash2, BookOpen, X } from 'lucide-react';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';

const emptyForm = { nombre: '', descripcion: '' };

const Carrocerias = () => {
  const [tipos, setTipos] = useState<any[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecetaOpen, setIsRecetaOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [recetaTipoId, setRecetaTipoId] = useState<number | null>(null);
  const [recetaTipoNombre, setRecetaTipoNombre] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [recetaItems, setRecetaItems] = useState<{ materialId: number; cantidadNecesaria: number }[]>([]);

  const cargarTipos = async () => {
    const data = await getTiposCarroceria();
    setTipos(data);
  };

  useEffect(() => {
    cargarTipos();
    getMateriales().then(setMateriales);
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (tipo: any) => {
    setEditingId(tipo.id);
    setForm({ nombre: tipo.nombre, descripcion: tipo.descripcion || '' });
    setIsModalOpen(true);
  };

  const openReceta = async (tipo: any) => {
    setRecetaTipoId(tipo.id);
    setRecetaTipoNombre(tipo.nombre);
    const items = await getReceta(tipo.id);
    setRecetaItems(items.map((r: any) => ({ materialId: r.materialId, cantidadNecesaria: r.cantidadNecesaria })));
    setIsRecetaOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#525252',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#171717',
      color: '#fff',
    });
    if (!result.isConfirmed) return;
    try {
      await eliminarTipoCarroceria(id);
      await cargarTipos();
      Swal.fire({ title: 'Eliminada', icon: 'success', background: '#171717', color: '#fff', confirmButtonColor: '#f97316', timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.response?.data?.error || 'No se pudo eliminar.', icon: 'error', background: '#171717', color: '#fff', confirmButtonColor: '#f97316' });
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
      Swal.fire({ title: '¡Éxito!', text: editingId ? 'Actualizado correctamente' : 'Creado correctamente', icon: 'success', background: '#171717', color: '#fff', confirmButtonColor: '#f97316', timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire({ title: 'Error', text: 'Ocurrió un error al guardar.', icon: 'error', background: '#171717', color: '#fff', confirmButtonColor: '#f97316' });
    }
  };

  const addRecetaLine = () => {
    if (materiales.length === 0) return;
    setRecetaItems([...recetaItems, { materialId: materiales[0].id, cantidadNecesaria: 1 }]);
  };

  const updateRecetaLine = (index: number, field: 'materialId' | 'cantidadNecesaria', value: any) => {
    const updated = [...recetaItems];
    updated[index] = { ...updated[index], [field]: field === 'materialId' ? Number(value) : Number(value) };
    setRecetaItems(updated);
  };

  const removeRecetaLine = (index: number) => {
    setRecetaItems(recetaItems.filter((_, i) => i !== index));
  };

  const handleGuardarReceta = async () => {
    if (!recetaTipoId) return;
    try {
      await guardarReceta(recetaTipoId, recetaItems);
      setIsRecetaOpen(false);
      Swal.fire({ title: 'Receta guardada', icon: 'success', background: '#171717', color: '#fff', confirmButtonColor: '#f97316', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ title: 'Error', text: 'No se pudo guardar la receta.', icon: 'error', background: '#171717', color: '#fff', confirmButtonColor: '#f97316' });
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
                  <button onClick={() => openReceta(tipo)} title="Receta de materiales"
                    className="text-orange-400 hover:text-orange-300 transition-colors">
                    <BookOpen className="w-5 h-5 inline" />
                  </button>
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

      {/* Modal crear/editar */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Carrocería' : 'Nueva Carrocería'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Nombre (Tipo)</label>
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors"
              required placeholder="Ej. Caja Seca 12ft" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Descripción / Notas</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors h-24"
              placeholder="Detalles de materiales o especificaciones..." />
          </div>
          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-700 transition-colors">Cancelar</button>
            <button type="submit"
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">{editingId ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal receta de materiales */}
      <Modal isOpen={isRecetaOpen} onClose={() => setIsRecetaOpen(false)} title={`Receta — ${recetaTipoNombre}`}>
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">Define qué materiales y cantidades consume esta carrocería al pasar a <span className="text-orange-400 font-medium">En Proceso</span>.</p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {recetaItems.map((item, i) => (
              <div key={i} className="flex items-center space-x-2">
                <select
                  value={item.materialId}
                  onChange={e => updateRecetaLine(i, 'materialId', e.target.value)}
                  className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-lg p-2.5 outline-none focus:border-orange-500 text-sm"
                >
                  {materiales.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre} ({m.unidadMedida})</option>
                  ))}
                </select>
                <input
                  type="number" min="0.01" step="0.01"
                  value={item.cantidadNecesaria}
                  onChange={e => updateRecetaLine(i, 'cantidadNecesaria', e.target.value)}
                  className="w-24 bg-neutral-800 border border-neutral-700 text-white rounded-lg p-2.5 outline-none focus:border-orange-500 text-sm"
                />
                <button onClick={() => removeRecetaLine(i)} className="text-red-400 hover:text-red-300 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            {recetaItems.length === 0 && (
              <p className="text-center text-neutral-600 text-sm py-4">Sin materiales en la receta</p>
            )}
          </div>

          {materiales.length > 0 && (
            <button onClick={addRecetaLine}
              className="w-full py-2 border border-dashed border-neutral-700 text-neutral-400 hover:text-white hover:border-orange-500 rounded-xl text-sm transition-colors flex items-center justify-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Agregar material</span>
            </button>
          )}

          {materiales.length === 0 && (
            <p className="text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
              Primero registra materiales en el módulo de Inventario.
            </p>
          )}

          <div className="pt-2 flex space-x-3">
            <button onClick={() => setIsRecetaOpen(false)}
              className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-700 transition-colors">Cancelar</button>
            <button onClick={handleGuardarReceta}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">Guardar receta</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Carrocerias;
