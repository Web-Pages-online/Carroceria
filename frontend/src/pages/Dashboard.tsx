import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Loader, CheckCircle, Truck, AlertCircle, Plus, Filter, X, ChevronDown, Search } from 'lucide-react';
import { getPedidos, getAgencias, getTiposCarroceria, actualizarEstadoPedido } from '../api/pedidos';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Swal from 'sweetalert2';

const COLUMNAS = [
  { id: 'PENDIENTE',  titulo: 'Pendientes', icono: <Clock className="w-5 h-5 text-yellow-400" />,  color: 'border-yellow-500/30' },
  { id: 'EN_PROCESO', titulo: 'En Proceso', icono: <Loader className="w-5 h-5 text-blue-400" />,    color: 'border-blue-500/30'    },
  { id: 'TERMINADO',  titulo: 'Terminados', icono: <CheckCircle className="w-5 h-5 text-green-400" />, color: 'border-green-500/30' },
  { id: 'ENTREGADO',  titulo: 'Entregados', icono: <Truck className="w-5 h-5 text-orange-400" />,   color: 'border-orange-500/30'  },
];

const emptyFiltros = { agenciaId: '', fechaDesde: '', fechaHasta: '', busqueda: '' };

const Dashboard = () => {
  const [pedidos, setPedidos]   = useState<any[]>([]);
  const [agencias, setAgencias] = useState<any[]>([]);
  const [tipos, setTipos]       = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState('');

  const navigate = useNavigate();

  const [filtros, setFiltros]         = useState(emptyFiltros);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const hayFiltros = filtros.agenciaId !== '' || filtros.fechaDesde !== '' || filtros.fechaHasta !== '' || filtros.busqueda !== '';

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (filtros.agenciaId && p.agencia_id !== parseInt(filtros.agenciaId)) return false;

      const fecha = new Date(p.fecha_creacion);
      if (filtros.fechaDesde) {
        const desde = new Date(filtros.fechaDesde);
        desde.setHours(0, 0, 0, 0);
        if (fecha < desde) return false;
      }
      if (filtros.fechaHasta) {
        const hasta = new Date(filtros.fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        if (fecha > hasta) return false;
      }
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        const coincide =
          p.agencia?.nombre?.toLowerCase().includes(q) ||
          p.tipo_carroceria?.nombre?.toLowerCase().includes(q) ||
          p.id.toString().includes(q);
        if (!coincide) return false;
      }
      return true;
    });
  }, [pedidos, filtros]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dataPedidos, dataAgencias, dataTipos] = await Promise.all([
        getPedidos(), getAgencias(), getTiposCarroceria(),
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

  useEffect(() => { cargarDatos(); }, []);

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const sourceCol = result.source.droppableId;
    const destCol   = result.destination.droppableId;
    if (sourceCol === destCol) return;

    const pedidoId = parseInt(result.draggableId);
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
        Swal.fire({ title: '¡Carrocería Entregada!', icon: 'success', background: '#171717', color: '#fff', confirmButtonColor: '#f97316', timer: 2000, showConfirmButton: false });
      }
    } catch (err: any) {
      newPedidos[pedidoIndex].estado = oldState;
      setPedidos([...newPedidos]);

      const faltantes = err?.response?.data?.faltantes;
      if (faltantes?.length > 0) {
        const lista = faltantes.map((f: any) => `• <b>${f.material}</b>: necesita ${f.necesario} ${f.unidad}, disponible ${f.disponible}`).join('<br/>');
        Swal.fire({ title: 'Stock insuficiente', html: `No hay suficiente material para iniciar esta carrocería:<br/><br/>${lista}`, icon: 'warning', background: '#171717', color: '#fff', confirmButtonColor: '#f97316' });
      } else {
        Swal.fire({ title: 'Error', text: err?.response?.data?.error || 'No se pudo actualizar el estado', icon: 'error', background: '#171717', color: '#fff', confirmButtonColor: '#f97316' });
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tablero de Pedidos</h1>
          <p className="text-neutral-400 mt-1">Supervisa el estado de todas las carrocerías en el taller y mueve las tarjetas.</p>
        </div>
        <button
          onClick={() => navigate('/pedidos')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-colors shadow-lg shadow-orange-500/20 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Pedido</span>
        </button>
      </div>

      {/* Barra de búsqueda + filtros */}
      <div className="mb-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden">
        {/* Fila principal: buscador + botón filtros */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={filtros.busqueda}
              onChange={e => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Buscar pedido, agencia, carrocería..."
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-800/60 border border-neutral-700/50 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 focus:bg-neutral-800 transition-all"
            />
          </div>

          <button
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors shrink-0 ${
              filtrosAbiertos || (hayFiltros && filtros.busqueda !== filtros.busqueda)
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                : filtros.agenciaId || filtros.fechaDesde || filtros.fechaHasta
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white hover:border-neutral-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            {(filtros.agenciaId || filtros.fechaDesde || filtros.fechaHasta) && (
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${filtrosAbiertos ? 'rotate-180' : ''}`} />
          </button>

          {hayFiltros && (
            <button
              onClick={() => setFiltros(emptyFiltros)}
              title="Limpiar todo"
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 border border-neutral-700 hover:border-red-500/30 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Contador cuando hay filtros activos */}
        {hayFiltros && (
          <div className="px-4 pb-2 -mt-1">
            <span className="text-xs text-neutral-500">
              Mostrando <span className="text-orange-400 font-medium">{pedidosFiltrados.length}</span> de {pedidos.length} pedidos
            </span>
          </div>
        )}

        {/* Panel de filtros expandible */}
        <div className={`transition-all duration-300 overflow-hidden ${filtrosAbiertos ? 'max-h-40' : 'max-h-0'}`}>
          <div className="px-4 pb-4 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-800">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Agencia</label>
              <select
                value={filtros.agenciaId}
                onChange={e => setFiltros({ ...filtros, agenciaId: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors"
              >
                <option value="">Todas las agencias</option>
                {agencias.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Desde</label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={e => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Hasta</label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={e => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Kanban */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
          {COLUMNAS.map((columna) => {
            const tarjetas = pedidosFiltrados.filter(p => p.estado === columna.id);
            return (
              <div key={columna.id} className={`bg-neutral-900/40 rounded-2xl border ${columna.color} p-4 flex flex-col h-full`}>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800/50">
                  <div className="flex items-center space-x-2">
                    {columna.icono}
                    <h2 className={`font-semibold ${columna.id === 'PENDIENTE' ? 'text-yellow-400' : 'text-neutral-200'}`}>{columna.titulo}</h2>
                  </div>
                  <span className="bg-neutral-800 text-neutral-300 text-xs font-bold px-2 py-1 rounded-md">
                    {tarjetas.length}
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
                      ) : tarjetas.length === 0 ? (
                        <div className="text-center text-neutral-600 py-4 text-sm">Sin pedidos</div>
                      ) : (
                        tarjetas.map((pedido, index) => (
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
            );
          })}
        </div>
      </DragDropContext>

    </div>
  );
};

const PedidoCard = ({ pedido }: { pedido: any }) => (
  <div className="bg-neutral-800 hover:bg-neutral-700/80 transition-colors p-4 rounded-xl border border-neutral-700 shadow-sm cursor-grab active:cursor-grabbing">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-bold text-orange-400 tracking-wider">#{pedido.id.toString().padStart(4, '0')}</span>
      <span className="text-xs text-neutral-500">{new Date(pedido.fecha_creacion).toLocaleDateString()}</span>
    </div>
    <h3 className="text-white font-medium mb-1">{pedido.tipo_vehiculo || pedido.tipo_carroceria?.nombre || 'Sin descripción'}</h3>
    <p className="text-sm text-neutral-400 flex items-center">
      <span className="w-2 h-2 rounded-full bg-neutral-600 mr-2"></span>
      {pedido.agencia?.nombre || 'Agencia Desconocida'}
    </p>
    {pedido.fecha_entrega_est && (
      <p className="text-xs text-neutral-500 mt-1.5">
        Entrega est.: {new Date(pedido.fecha_entrega_est).toLocaleDateString()}
      </p>
    )}
  </div>
);

export default Dashboard;
