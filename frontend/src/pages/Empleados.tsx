import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, User, Calendar, Building2 } from 'lucide-react';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';
import { getEmpleados, getEmpleadoConPedidos, crearEmpleado, actualizarEmpleado, eliminarEmpleado } from '../api/pedidos';

const emptyForm = { nombre: '', telefono: '' };

const Empleados = () => {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [form, setForm]               = useState(emptyForm);
  const [expandedId, setExpandedId]   = useState<number | null>(null);
  const [pedidosEmpleado, setPedidosEmpleado] = useState<any[]>([]);
  const [loadingPedidos, setLoadingPedidos]   = useState(false);

  const cargar = async () => {
    setEmpleados(await getEmpleados());
  };

  useEffect(() => { cargar(); }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (e: any) => { setEditingId(e.id); setForm({ nombre: e.nombre, telefono: e.telefono ?? '' }); setIsModalOpen(true); };

  const toggleExpand = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setLoadingPedidos(true);
    const data = await getEmpleadoConPedidos(id);
    setPedidosEmpleado(data.pedidos ?? []);
    setLoadingPedidos(false);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar empleado?', text: 'Se quitará la asignación de sus pedidos.',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#f97316', cancelButtonColor: '#525252',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
      background: '#171717', color: '#fff',
    });
    if (!result.isConfirmed) return;
    try {
      await eliminarEmpleado(id);
      if (expandedId === id) setExpandedId(null);
      await cargar();
    } catch (e: any) {
      Swal.fire({ title: 'Error', text: e.response?.data?.error || 'No se pudo eliminar', icon: 'error', background: '#171717', color: '#fff', confirmButtonColor: '#f97316' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await actualizarEmpleado(editingId, form);
      else await crearEmpleado(form);
      setIsModalOpen(false);
      await cargar();
      if (expandedId) { const data = await getEmpleadoConPedidos(expandedId); setPedidosEmpleado(data.pedidos ?? []); }
      Swal.fire({ title: '¡Guardado!', icon: 'success', background: '#171717', color: '#fff', confirmButtonColor: '#f97316', timer: 1500, showConfirmButton: false });
    } catch (e: any) {
      Swal.fire({ title: 'Error', text: e.response?.data?.error || 'Error al guardar', icon: 'error', background: '#171717', color: '#fff', confirmButtonColor: '#f97316' });
    }
  };

  const fmtFecha = (d: string) =>
    new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

  const estadoBadge: Record<string, string> = {
    PENDIENTE:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    EN_PROCESO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    TERMINADO:  'bg-green-500/10 text-green-400 border-green-500/20',
    ENTREGADO:  'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Empleados</h1>
          <p className="text-neutral-400 mt-1">Gestiona tu equipo y consulta el historial de trabajo de cada uno.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openCreate}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-colors shadow-lg shadow-orange-500/20">
          <Plus className="w-5 h-5" /><span>Nuevo Empleado</span>
        </motion.button>
      </div>

      <div className="space-y-3">
        {empleados.length === 0 && (
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-10 text-center text-neutral-500">
            No hay empleados registrados
          </div>
        )}

        {empleados.map(emp => (
          <div key={emp.id} className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden">
            {/* Fila del empleado */}
            <div className="flex items-center justify-between px-5 py-4">
              <button onClick={() => toggleExpand(emp.id)} className="flex items-center space-x-4 flex-1 text-left group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-orange-500/20">
                  {emp.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold group-hover:text-orange-400 transition-colors">{emp.nombre}</p>
                  <p className="text-sm text-neutral-500">{emp.telefono || 'Sin teléfono'}</p>
                </div>
                <div className="ml-4">
                  {expandedId === emp.id
                    ? <ChevronUp className="w-4 h-4 text-orange-400" />
                    : <ChevronDown className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300" />}
                </div>
              </button>

              <div className="flex items-center space-x-2 ml-4">
                <button onClick={() => openEdit(emp)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-neutral-800 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(emp.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-neutral-800 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Historial de pedidos */}
            <AnimatePresence>
              {expandedId === emp.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-neutral-800 overflow-hidden"
                >
                  <div className="px-5 py-4">
                    <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">
                      Historial de trabajo
                    </p>

                    {loadingPedidos ? (
                      <div className="text-neutral-500 text-sm py-4 text-center animate-pulse">Cargando...</div>
                    ) : pedidosEmpleado.length === 0 ? (
                      <div className="text-neutral-600 text-sm py-4 text-center">Sin pedidos asignados aún</div>
                    ) : (
                      <div className="space-y-2">
                        {pedidosEmpleado.map(p => (
                          <div key={p.id} className="flex items-center justify-between py-2.5 px-3 bg-neutral-800/40 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <span className="text-xs font-bold text-orange-400">#{String(p.id).padStart(4,'0')}</span>
                              <div>
                                <p className="text-sm text-white font-medium">
                                  {p.tipo_vehiculo || p.tipo_carroceria?.nombre || 'Carrocería'}
                                </p>
                                <div className="flex items-center space-x-3 mt-0.5">
                                  <span className="flex items-center space-x-1 text-xs text-neutral-500">
                                    <Building2 className="w-3 h-3" />
                                    <span>{p.agencia?.nombre ?? '—'}</span>
                                  </span>
                                  <span className="flex items-center space-x-1 text-xs text-neutral-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{fmtFecha(p.fecha_creacion)}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${estadoBadge[p.estado] ?? ''}`}>
                              {p.estado.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Empleado' : 'Nuevo Empleado'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Nombre completo</label>
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Juan Pérez" required
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-orange-500 transition-all placeholder-neutral-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Teléfono</label>
            <input type="text" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
              placeholder="Ej. 9991234567"
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-orange-500 transition-all placeholder-neutral-600" />
          </div>
          <div className="pt-2 flex space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-700 transition-colors">Cancelar</button>
            <button type="submit"
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Empleados;
