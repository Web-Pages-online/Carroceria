import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Calendar, ClipboardList } from 'lucide-react';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';
import { getEmpleados, getEmpleadoConPedidos, crearEmpleado, actualizarEmpleado, eliminarEmpleado } from '../api/pedidos';
import api from '../api/pedidos';

const agregarRegistro = (empleadoId: number, data: any) =>
  api.post(`/empleados/${empleadoId}/registros`, data).then(r => r.data);

const eliminarRegistroAPI = (empleadoId: number, registroId: number) =>
  api.delete(`/empleados/${empleadoId}/registros/${registroId}`);

const emptyForm   = { nombre: '', telefono: '' };
const emptyReg    = { descripcion: '', cantidad: '1', fecha: new Date().toISOString().split('T')[0] };

const Empleados = () => {
  const [empleados, setEmpleados]       = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isRegOpen, setIsRegOpen]       = useState(false);
  const [editingId, setEditingId]       = useState<number | null>(null);
  const [regEmpleadoId, setRegEmpleadoId] = useState<number | null>(null);
  const [form, setForm]                 = useState(emptyForm);
  const [regForm, setRegForm]           = useState(emptyReg);
  const [expandedId, setExpandedId]     = useState<number | null>(null);
  const [registros, setRegistros]       = useState<any[]>([]);
  const [loadingReg, setLoadingReg]     = useState(false);

  const cargar = async () => setEmpleados(await getEmpleados());

  useEffect(() => { cargar(); }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit   = (e: any) => { setEditingId(e.id); setForm({ nombre: e.nombre, telefono: e.telefono ?? '' }); setIsModalOpen(true); };

  const openAddRegistro = (emp: any) => {
    setRegEmpleadoId(emp.id);
    setRegForm({ descripcion: '', cantidad: '1', fecha: new Date().toISOString().split('T')[0] });
    setIsRegOpen(true);
  };

  const toggleExpand = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setLoadingReg(true);
    const data = await getEmpleadoConPedidos(id);
    setRegistros(data.registros ?? []);
    setLoadingReg(false);
  };

  const recargarRegistros = async (id: number) => {
    const data = await getEmpleadoConPedidos(id);
    setRegistros(data.registros ?? []);
  };

  const handleDelete = async (id: number) => {
    const r = await Swal.fire({ title: '¿Eliminar empleado?', text: 'Se borrará también su historial.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f97316', cancelButtonColor: '#525252', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', background: '#171717', color: '#fff' });
    if (!r.isConfirmed) return;
    try { await eliminarEmpleado(id); if (expandedId === id) setExpandedId(null); await cargar(); }
    catch (e: any) { Swal.fire({ title: 'Error', text: e.response?.data?.error || 'No se pudo eliminar', icon: 'error', background: '#171717', color: '#fff', confirmButtonColor: '#f97316' }); }
  };

  const handleDeleteRegistro = async (registroId: number) => {
    if (!expandedId) return;
    const r = await Swal.fire({ title: '¿Eliminar registro?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f97316', cancelButtonColor: '#525252', confirmButtonText: 'Sí', cancelButtonText: 'No', background: '#171717', color: '#fff' });
    if (!r.isConfirmed) return;
    await eliminarRegistroAPI(expandedId, registroId);
    await recargarRegistros(expandedId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await actualizarEmpleado(editingId, form);
      else await crearEmpleado(form);
      setIsModalOpen(false);
      await cargar();
      Swal.fire({ title: '¡Guardado!', icon: 'success', background: '#171717', color: '#fff', confirmButtonColor: '#f97316', timer: 1500, showConfirmButton: false });
    } catch (e: any) { Swal.fire({ title: 'Error', text: e.response?.data?.error || 'Error al guardar', icon: 'error', background: '#171717', color: '#fff', confirmButtonColor: '#f97316' }); }
  };

  const handleSubmitRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmpleadoId) return;
    try {
      await agregarRegistro(regEmpleadoId, { ...regForm, cantidad: parseInt(regForm.cantidad) || 1 });
      setIsRegOpen(false);
      if (expandedId === regEmpleadoId) await recargarRegistros(regEmpleadoId);
      else { setExpandedId(regEmpleadoId); await recargarRegistros(regEmpleadoId); }
      Swal.fire({ title: '¡Registro agregado!', icon: 'success', background: '#171717', color: '#fff', confirmButtonColor: '#f97316', timer: 1500, showConfirmButton: false });
    } catch { Swal.fire({ title: 'Error', text: 'No se pudo agregar el registro', icon: 'error', background: '#171717', color: '#fff', confirmButtonColor: '#f97316' }); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Empleados</h1>
          <p className="text-neutral-400 mt-1">Registra el historial de trabajo de cada trabajador.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openCreate}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-colors shadow-lg shadow-orange-500/20">
          <Plus className="w-5 h-5" /><span>Nuevo Empleado</span>
        </motion.button>
      </div>

      <div className="space-y-3">
        {empleados.length === 0 && (
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-10 text-center text-neutral-500">No hay empleados registrados</div>
        )}

        {empleados.map(emp => (
          <div key={emp.id} className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <button onClick={() => toggleExpand(emp.id)} className="flex items-center space-x-4 flex-1 text-left group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-orange-500/20">
                  {emp.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold group-hover:text-orange-400 transition-colors">{emp.nombre}</p>
                  <p className="text-sm text-neutral-500">{emp.telefono || 'Sin teléfono'}</p>
                </div>
                <span className="ml-2 text-neutral-600 group-hover:text-neutral-400 transition-colors">
                  {expandedId === emp.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              <div className="flex items-center space-x-2 ml-4">
                <button onClick={() => openAddRegistro(emp)} title="Agregar trabajo"
                  className="p-2 text-orange-400 hover:text-orange-300 hover:bg-neutral-800 rounded-lg transition-colors">
                  <ClipboardList className="w-4 h-4" />
                </button>
                <button onClick={() => openEdit(emp)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-neutral-800 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(emp.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-neutral-800 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === emp.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="border-t border-neutral-800 overflow-hidden">
                  <div className="px-5 py-4">
                    <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">Historial de trabajo</p>

                    {loadingReg ? (
                      <p className="text-neutral-500 text-sm py-3 text-center animate-pulse">Cargando...</p>
                    ) : registros.length === 0 ? (
                      <p className="text-neutral-600 text-sm py-3 text-center">Sin registros aún — usa el botón <span className="text-orange-400">+</span> para agregar</p>
                    ) : (
                      <div className="space-y-2">
                        {registros.map((r: any) => (
                          <div key={r.id} className="flex items-center justify-between py-2.5 px-3 bg-neutral-800/40 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1 text-xs text-neutral-500 shrink-0">
                                <Calendar className="w-3 h-3" />
                                <span>{fmt(r.fecha)}</span>
                              </div>
                              <p className="text-sm text-white">{r.descripcion}</p>
                              <span className="text-xs font-semibold px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full shrink-0">
                                x{r.cantidad}
                              </span>
                            </div>
                            <button onClick={() => handleDeleteRegistro(r.id)} className="p-1.5 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 ml-2">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* Modal empleado */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Empleado' : 'Nuevo Empleado'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Nombre completo</label>
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Juan Pérez" required
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-orange-500 transition-all placeholder-neutral-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Teléfono</label>
            <input type="text" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="Ej. 9991234567"
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-orange-500 transition-all placeholder-neutral-600" />
          </div>
          <div className="pt-2 flex space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-700 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">{editingId ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal agregar registro */}
      <Modal isOpen={isRegOpen} onClose={() => setIsRegOpen(false)} title="Registrar trabajo">
        <form onSubmit={handleSubmitRegistro} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">¿Qué realizó?</label>
            <input type="text" value={regForm.descripcion} onChange={e => setRegForm({ ...regForm, descripcion: e.target.value })}
              placeholder="Ej. Caja seca 12ft, Plataforma tipo rampa..." required
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-orange-500 transition-all placeholder-neutral-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Cantidad</label>
              <input type="number" min="1" step="1" value={regForm.cantidad} onChange={e => setRegForm({ ...regForm, cantidad: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-orange-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Fecha</label>
              <input type="date" value={regForm.fecha} onChange={e => setRegForm({ ...regForm, fecha: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 outline-none focus:border-orange-500 transition-all [color-scheme:dark]" />
            </div>
          </div>
          <div className="pt-2 flex space-x-3">
            <button type="button" onClick={() => setIsRegOpen(false)} className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-700 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">Guardar registro</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Empleados;
