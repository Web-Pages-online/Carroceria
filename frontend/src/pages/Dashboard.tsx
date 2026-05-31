import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Loader, CheckCircle, Truck, AlertCircle, Plus } from 'lucide-react';
import { getPedidos, crearPedido, getAgencias, getTiposCarroceria, actualizarEstadoPedido } from '../api/pedidos';
import Modal from '../components/Modal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import Swal from 'sweetalert2';

const COLUMNAS = [
  { id: 'PENDIENTE', titulo: 'Pendientes', icono: <Clock className="w-5 h-5 text-neutral-400" />, color: 'border-neutral-500/30' },
  { id: 'EN_PROCESO', titulo: 'En Proceso', icono: <Loader className="w-5 h-5 text-blue-400" />, color: 'border-blue-500/30' },
  { id: 'TERMINADO', titulo: 'Terminados', icono: <CheckCircle className="w-5 h-5 text-green-400" />, color: 'border-green-500/30' },
  { id: 'ENTREGADO', titulo: 'Entregados', icono: <Truck className="w-5 h-5 text-orange-400" />, color: 'border-orange-500/30' },
];

const Dashboard = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [agencias, setAgencias] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ agencia_id: '', tipo_carroceria_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dataPedidos, dataAgencias, dataTipos] = await Promise.all([
        getPedidos(), getAgencias(), getTiposCarroceria()
      ]);
      setPedidos(dataPedidos);
      setAgencias(dataAgencias);
      setTipos(dataTipos);
    } catch (err: any) {
      setError('Error al conectar con el servidor: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agencia_id || !form.tipo_carroceria_id) return;
    
    setIsSubmitting(true);
    try {
      await crearPedido({
        agencia_id: parseInt(form.agencia_id),
        tipo_carroceria_id: parseInt(form.tipo_carroceria_id)
      });
      setIsModalOpen(false);
      setForm({ agencia_id: '', tipo_carroceria_id: '' });
      await cargarDatos(); // Recargar pedidos
      
      Swal.fire({
        title: '¡Pedido Creado!',
        text: 'El pedido ha sido registrado con éxito.',
        icon: 'success',
        background: '#171717',
        color: '#fff',
        confirmButtonColor: '#f97316',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al crear el pedido.',
        icon: 'error',
        background: '#171717',
        color: '#fff',
        confirmButtonColor: '#f97316',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const sourceCol = result.source.droppableId;
    const destCol = result.destination.droppableId;
    if (sourceCol === destCol) return; // Mismo lugar

    const pedidoId = parseInt(result.draggableId);

    // Actualización optimista de UI
    const newPedidos = [...pedidos];
    const pedidoIndex = newPedidos.findIndex(p => p.id === pedidoId);
    if (pedidoIndex === -1) return;
    
    const oldState = newPedidos[pedidoIndex].estado;
    newPedidos[pedidoIndex].estado = destCol;
    setPedidos(newPedidos);

    try {
      const fecha_entrega = destCol === 'ENTREGADO' ? new Date().toISOString() : undefined;
      await actualizarEstadoPedido(pedidoId, destCol, fecha_entrega);

      if (destCol === 'ENTREGADO') {
        Swal.fire({
          title: '¡Carrocería Entregada!',
          text: 'Se ha registrado la entrega exitosamente.',
          icon: 'success',
          background: '#171717',
          color: '#fff',
          confirmButtonColor: '#f97316',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      // Revertir si falla
      newPedidos[pedidoIndex].estado = oldState;
      setPedidos([...newPedidos]);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estado',
        icon: 'error',
        background: '#171717',
        color: '#fff',
        confirmButtonColor: '#f97316'
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tablero de Pedidos</h1>
          <p className="text-neutral-400 mt-1">Supervisa el estado de todas las carrocerías en el taller.</p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-colors shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Pedido</span>
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* DRAG AND DROP CONTEXT */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
          {COLUMNAS.map((columna) => (
            <div key={columna.id} className={`bg-neutral-900/40 rounded-2xl border ${columna.color} p-4 flex flex-col h-full`}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800/50">
                <div className="flex items-center space-x-2">
                  {columna.icono}
                  <h2 className="font-semibold text-neutral-200">{columna.titulo}</h2>
                </div>
                <span className="bg-neutral-800 text-neutral-300 text-xs font-bold px-2 py-1 rounded-md">
                  {pedidos.filter(p => p.estado === columna.id).length}
                </span>
              </div>

              <Droppable droppableId={columna.id}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar transition-colors rounded-xl ${snapshot.isDraggingOver ? 'bg-neutral-800/30' : ''}`}
                  >
                    {cargando ? (
                      <div className="text-center text-neutral-500 py-4 text-sm animate-pulse">Cargando datos...</div>
                    ) : pedidos.filter(p => p.estado === columna.id).length === 0 ? (
                      <div className="text-center text-neutral-600 py-4 text-sm">Sin pedidos</div>
                    ) : (
                      pedidos.filter(p => p.estado === columna.id).map((pedido, index) => (
                        <Draggable key={pedido.id.toString()} draggableId={pedido.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? 'opacity-90' : ''}
                            >
                              <PedidoCard pedido={pedido} />
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Pedido">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Agencia</label>
            <select 
              value={form.agencia_id}
              onChange={e => setForm({...form, agencia_id: e.target.value})}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors"
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
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors"
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
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Pedido'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const PedidoCard = ({ pedido }: { pedido: any }) => {
  return (
    <div className="bg-neutral-800 hover:bg-neutral-700/80 transition-colors p-4 rounded-xl border border-neutral-700 shadow-sm cursor-grab active:cursor-grabbing">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-orange-400 tracking-wider">#{pedido.id.toString().padStart(4, '0')}</span>
        <span className="text-xs text-neutral-500">{new Date(pedido.fecha_creacion).toLocaleDateString()}</span>
      </div>
      <h3 className="text-white font-medium mb-1">{pedido.tipo_carroceria?.nombre || 'Carrocería'}</h3>
      <p className="text-sm text-neutral-400 flex items-center">
        <span className="w-2 h-2 rounded-full bg-neutral-600 mr-2"></span>
        {pedido.agencia?.nombre || 'Agencia Desconocida'}
      </p>
    </div>
  );
};

export default Dashboard;
