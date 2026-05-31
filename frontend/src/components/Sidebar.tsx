import React, { useState } from 'react';
import { Home, Users, Settings, Wrench, ChevronDown, User, Shield, Key, FileText, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const esAdmin = usuario?.rol_nombre === 'ADMINISTRADOR' || usuario?.rol_nombre === 'Super-Admin' || usuario?.rol?.nombre === 'Super-Admin' || usuario?.rol?.nombre === 'ADMINISTRADOR';

  // Mantener abierto si estamos en una ruta de settings
  React.useEffect(() => {
    if (location.pathname.startsWith('/settings')) {
      setSettingsOpen(true);
    }
  }, [location.pathname]);

  return (
    <aside className="bg-neutral-900/50 backdrop-blur-md border-r border-neutral-800 text-white w-64 h-screen hidden md:flex flex-col sticky top-0 overflow-y-auto custom-scrollbar">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-orange-500 p-2.5 rounded-xl shrink-0 shadow-lg shadow-orange-500/20">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wide text-white leading-tight">MULTISERVICIOS</span>
          <span className="text-[10px] text-neutral-400 font-medium tracking-wider mt-0.5">DE SOLDADURA TORALES</span>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2 pb-6">
        <NavItem to="/tablero" icon={<Home />} label="Tablero" />
        <NavItem to="/pedidos" icon={<FileText />} label="Pedidos" />
        <NavItem to="/agencias" icon={<Users />} label="Agencias" />

        {esAdmin && (
          <div className="pt-4 mt-4 border-t border-neutral-800">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
              settingsOpen || location.pathname.startsWith('/settings')
                ? 'bg-neutral-800/80 text-white border border-neutral-700/50'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="w-5 h-5"><Settings /></span>
              <span className="font-medium">Settings</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${settingsOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${settingsOpen ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col space-y-1 pl-4 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-neutral-800">
              <SubNavItem to="/settings/users" icon={<User className="w-4 h-4" />} label="Users" />
              <SubNavItem to="/settings/roles" icon={<Shield className="w-4 h-4" />} label="Roles" />
              <SubNavItem to="/settings/permisos" icon={<Key className="w-4 h-4" />} label="Permisos" />
            </div>
          </div>
        </div>
        )}
      </nav>

      {/* Sección de usuario al fondo */}
      <div className="px-4 py-4 border-t border-neutral-800 mt-auto">
        <div className="flex items-center space-x-3">
          <NavLink
            to="/perfil"
            className="flex items-center space-x-3 flex-1 min-w-0 p-2 rounded-xl hover:bg-neutral-800/60 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-orange-500/20">
              {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-white truncate group-hover:text-orange-400 transition-colors">{usuario?.nombre || 'Usuario'}</p>
              <p className="text-xs text-neutral-500 truncate">{usuario?.rol?.nombre || usuario?.rol_nombre || 'Rol'}</p>
            </div>
          </NavLink>
          <button
            onClick={logout}
            className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-orange-500/10 text-orange-400 font-medium' 
          : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
      }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

const SubNavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `flex items-center space-x-3 pl-8 pr-4 py-2.5 rounded-xl transition-all duration-200 text-sm ${
        isActive 
          ? 'bg-neutral-800 text-white font-medium' 
          : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40'
      }`}
    >
      <span className="opacity-70">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

export default Sidebar;
