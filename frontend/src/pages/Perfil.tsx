import React from 'react';
import { User, Mail, Shield, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Perfil = () => {
  const { usuario } = useAuth();

  const rolNombre = usuario?.rol?.nombre || usuario?.rol_nombre || 'Sin rol';
  const inicial = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Mi Perfil</h1>
      <p className="text-neutral-500 text-sm mb-8">Información de tu cuenta</p>

      {/* Avatar y nombre */}
      <div className="flex items-center space-x-5 mb-8 p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-orange-500/20 shrink-0">
          {inicial}
        </div>
        <div>
          <p className="text-xl font-bold text-white">{usuario?.nombre || 'Usuario'}</p>
          <span className="inline-block mt-1 px-3 py-1 bg-orange-500/10 text-orange-400 text-xs font-medium rounded-full border border-orange-500/20">
            {rolNombre}
          </span>
        </div>
      </div>

      {/* Datos del usuario */}
      <div className="space-y-4">
        <InfoRow icon={<User className="w-5 h-5" />} label="Nombre completo" value={usuario?.nombre || '—'} />
        <InfoRow icon={<Mail className="w-5 h-5" />} label="Correo electrónico" value={usuario?.email || '—'} />
        <InfoRow icon={<Shield className="w-5 h-5" />} label="Rol" value={rolNombre} />
        <InfoRow
          icon={<Building2 className="w-5 h-5" />}
          label="Agencia asignada"
          value={usuario?.agencia_id ? `Agencia #${usuario.agencia_id}` : 'Sin agencia'}
        />
      </div>
    </div>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center space-x-4 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl">
    <div className="text-orange-400 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-white truncate">{value}</p>
    </div>
  </div>
);

export default Perfil;
