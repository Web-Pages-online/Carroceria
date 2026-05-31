import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';
import { getMateriales, crearMaterial, actualizarMaterial, eliminarMaterial } from '../api/pedidos';

const emptyForm = { nombre: '', unidadMedida: '', stockActual: '', stockMinimo: '' };

const Inventario = () => {
  const [materiales, setMateriales] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const cargar = async () => {
    const data = await getMateriales();
    setMateriales(data);
  };

  useEffect(() => { cargar(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (m: any) => {
    setEditingId(m.id);
    setForm({ nombre: m.nombre, unidadMedida: m.unidadMedida, stockActual: m.stockActual, stockMinimo: m.stockMinimo });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar material?',
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
      await eliminarMaterial(id);
      await cargar();
    } catch (e: any) {
      Swal.fire({ title: 'Error', text: e.response?.data?.error || 'No se pudo eliminar', icon: 'error', background: '#171717', color: '#fff', confirmButtonColor: '#f97316' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: form.nombre,
      unidadMedida: form.unidadMedida,
      stockActual: Number(form.stockActual),
      stockMinimo: Number(form.stockMinimo),
    };
    try {
      if (editingId) {
        await actualizarMaterial(editingId, payload);
      } else {
        await crearMaterial(payload);
      }
      setIsModalOpen(false);
      await cargar();
      Swal.fire({ title: '¡Guardado!', icon: 'success', background: '#171717', color: '#fff', confirmButtonColor: '#f97316', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ title: 'Error', text: 'No se pudo guardar', icon: 'error', background: '#171717', color: '#fff', confirmButtonColor: '#f97316' });
    }
  };

  const bajoStock = materiales.filter((m) => m.stockActual <= m.stockMinimo).length;

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Inventario</h1>
          <p className="text-neutral-400 mt-1">Control de materiales y stock del taller.</p>
          {bajoStock > 0 && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl w-fit">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{bajoStock} material{bajoStock > 1 ? 'es' : ''} con stock bajo</span>
            </div>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreate}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-colors shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Material</span>
        </motion.button>
      </div>

      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-neutral-300">
          <thead className="bg-neutral-800/50 text-neutral-400 text-sm">
            <tr>
              <th className="p-4 font-medium">Material</th>
              <th className="p-4 font-medium">Unidad</th>
              <th className="p-4 font-medium">Stock Actual</th>
              <th className="p-4 font-medium">Stock Mínimo</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materiales.map((m) => {
              const bajo = m.stockActual <= m.stockMinimo;
              return (
                <tr
                  key={m.id}
                  className={`border-b border-neutral-800/50 transition-colors ${bajo ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-neutral-800/30'}`}
                >
                  <td className="p-4 font-medium text-white flex items-center space-x-2">
                    <Package className={`w-4 h-4 shrink-0 ${bajo ? 'text-red-400' : 'text-orange-400'}`} />
                    <span>{m.nombre}</span>
                  </td>
                  <td className="p-4 text-neutral-400">{m.unidadMedida}</td>
                  <td className={`p-4 font-semibold ${bajo ? 'text-red-400' : 'text-white'}`}>{m.stockActual}</td>
                  <td className="p-4 text-neutral-400">{m.stockMinimo}</td>
                  <td className="p-4">
                    {bajo ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded-full border border-red-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Stock bajo</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button onClick={() => openEdit(m)} className="text-blue-400 hover:text-blue-300 transition-colors">
                      <Edit2 className="w-5 h-5 inline" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {materiales.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">No hay materiales registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Material' : 'Nuevo Material'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Nombre del material</label>
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors"
              required placeholder="Ej. Tubo de acero 2&quot;" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Unidad de medida</label>
            <input type="text" value={form.unidadMedida} onChange={e => setForm({ ...form, unidadMedida: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors"
              required placeholder="Ej. metros, piezas, litros" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Stock actual</label>
              <input type="number" min="0" step="0.01" value={form.stockActual} onChange={e => setForm({ ...form, stockActual: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Stock mínimo</label>
              <input type="number" min="0" step="0.01" value={form.stockMinimo} onChange={e => setForm({ ...form, stockMinimo: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors"
                required />
            </div>
          </div>
          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-700 transition-colors">Cancelar</button>
            <button type="submit"
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">{editingId ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventario;
