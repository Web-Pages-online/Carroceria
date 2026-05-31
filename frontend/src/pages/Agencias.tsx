import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAgencias, crearAgencia, actualizarAgencia, eliminarAgencia } from '../api/pedidos';
import { Plus, Edit2, Trash2, MapPin, Search } from 'lucide-react';
import Modal from '../components/Modal';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import Swal from 'sweetalert2';

// Icono personalizado para Leaflet
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Componente para seleccionar ubicación en el mapa al hacer clic
const LocationMarker = ({ position, setPosition }: { position: any, setPosition: any }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
};

// Componente para animar el mapa hacia una nueva coordenada buscada
const MapUpdater = ({ center, setPosition }: { center: [number, number] | null, setPosition: any }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
      setPosition({ lat: center[0], lng: center[1] });
    }
  }, [center, map, setPosition]);
  return null;
};

const Agencias = () => {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ nombre: '', contacto: '', email: '', telefono: '', direccion: '' });
  
  // Estado del mapa
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const cargarAgencias = async () => {
    const data = await getAgencias();
    setAgencias(data);
  };

  useEffect(() => {
    cargarAgencias();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ nombre: '', contacto: '', email: '', telefono: '', direccion: '' });
    setPosition(null);
    setMapCenter(null);
    setSearchQuery('');
    setIsModalOpen(true);
  };

  const openEditModal = (agencia: any) => {
    setEditingId(agencia.id);
    setForm({
      nombre: agencia.nombre,
      contacto: agencia.contacto || '',
      email: agencia.email || '',
      telefono: agencia.telefono || '',
      direccion: agencia.direccion || ''
    });
    setSearchQuery('');
    if (agencia.latitud && agencia.longitud) {
      const latlng = new L.LatLng(agencia.latitud, agencia.longitud);
      setPosition(latlng);
      setMapCenter([agencia.latitud, agencia.longitud]);
    } else {
      setPosition(null);
      setMapCenter(null);
    }
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
        await eliminarAgencia(id);
        await cargarAgencias();
        Swal.fire({
          title: 'Eliminada',
          text: 'La agencia ha sido eliminada correctamente.',
          icon: 'success',
          background: '#171717',
          color: '#fff',
          confirmButtonColor: '#f97316',
        });
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar. Es posible que tenga pedidos asociados.',
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
    const dataToSend = {
      ...form,
      latitud: position ? position.lat : null,
      longitud: position ? position.lng : null
    };

    try {
      if (editingId) {
        await actualizarAgencia(editingId, dataToSend);
      } else {
        await crearAgencia(dataToSend);
      }
      setIsModalOpen(false);
      await cargarAgencias();
      
      Swal.fire({
        title: '¡Éxito!',
        text: editingId ? 'Agencia actualizada correctamente' : 'Agencia creada correctamente',
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

  // Función para buscar en Nominatim (OpenStreetMap) enfocado en Yucatán con Inteligencia Local
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    try {
      const queryLower = searchQuery.toLowerCase();

      // Diccionario Inteligente de Agencias Conocidas (Aliases)
      // Cuando el usuario escriba esto, el sistema sabrá exactamente la coordenada
      const agenciasConocidas: Record<string, [number, number]> = {
        'nissan francisco de montejo': [21.034600, -89.644100], // Coordenadas aproximadas de la agencia
        'francisco de montejo': [21.034600, -89.644100],        // Si solo pone la colonia, asume la Nissan
        'nissan altabrisa': [21.021000, -89.584000],            // Ejemplo extra
        'nissan norte': [21.034600, -89.644100],
        'nissan prolongacion': [21.015000, -89.620000]
      };

      // Revisar si la búsqueda contiene alguna de nuestras palabras clave
      let coordenadasExactas: [number, number] | null = null;
      for (const [alias, coords] of Object.entries(agenciasConocidas)) {
        if (queryLower.includes(alias)) {
          coordenadasExactas = coords;
          break;
        }
      }

      // Si encontramos una coincidencia en el diccionario, vamos directo ahí sin preguntar a Nominatim
      if (coordenadasExactas) {
        setMapCenter(coordenadasExactas);
        setIsSearching(false);
        return;
      }

      // Si no está en nuestro diccionario, hacemos la búsqueda normal en OpenStreetMap
      const queryFocus = queryLower.includes('yucatan') 
        ? searchQuery 
        : `${searchQuery}, Yucatán, México`;

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryFocus)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      } else {
        Swal.fire({
          title: 'No encontrado',
          text: 'No se encontró ninguna ubicación con esa búsqueda en Yucatán.',
          icon: 'info',
          background: '#171717',
          color: '#fff',
          confirmButtonColor: '#f97316',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Error al buscar la ubicación.',
        icon: 'error',
        background: '#171717',
        color: '#fff',
        confirmButtonColor: '#f97316',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Coordenadas por defecto: Mérida, Yucatán
  const defaultCenter = [20.97537, -89.61696] as [number, number];

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Directorio de Agencias</h1>
          <p className="text-neutral-400 mt-1">Administra tus clientes y puntos de contacto.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreateModal}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-colors shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Agencia</span>
        </motion.button>
      </div>

      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-neutral-300">
          <thead className="bg-neutral-800/50 text-neutral-400 text-sm">
            <tr>
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Contacto</th>
              <th className="p-4 font-medium">Teléfono</th>
              <th className="p-4 font-medium">Dirección</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {agencias.map((agencia) => (
              <tr key={agencia.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                <td className="p-4 text-white font-medium">{agencia.nombre}</td>
                <td className="p-4">{agencia.contacto || '-'}</td>
                <td className="p-4">{agencia.telefono || '-'}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {agencia.latitud && <MapPin className="w-4 h-4 text-orange-500" />}
                    <span>{agencia.direccion || '-'}</span>
                  </div>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => openEditModal(agencia)} className="text-blue-400 hover:text-blue-300 transition-colors">
                    <Edit2 className="w-5 h-5 inline" />
                  </button>
                  <button onClick={() => handleDelete(agencia.id)} className="text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
            {agencias.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">No hay agencias registradas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Agencia' : 'Nueva Agencia'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Nombre Comercial</label>
              <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Persona de Contacto</label>
              <input type="text" value={form.contacto} onChange={e => setForm({...form, contacto: e.target.value})} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Teléfono</label>
              <input type="text" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Dirección (Texto)</label>
              <input type="text" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Correo electrónico</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="contacto@agencia.com" className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors placeholder-neutral-600" />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-400 mb-1">Buscar Ubicación en el Mapa</label>
            <div className="flex space-x-2 mb-3">
              <input 
                type="text" 
                placeholder="Ej. Av. Reforma, CDMX..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if(e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchLocation();
                  }
                }}
                className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-lg p-3 outline-none focus:border-orange-500 transition-colors text-sm" 
              />
              <button 
                type="button" 
                onClick={handleSearchLocation}
                disabled={isSearching}
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isSearching ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Search className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="h-48 w-full rounded-xl overflow-hidden border border-neutral-700 relative z-0">
              <MapContainer center={mapCenter || position || defaultCenter} zoom={position ? 15 : 5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap" />
                <LocationMarker position={position} setPosition={setPosition} />
                <MapUpdater center={mapCenter} setPosition={setPosition} />
              </MapContainer>
            </div>
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

export default Agencias;
