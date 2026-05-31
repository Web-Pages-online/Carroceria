import React from 'react';
import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { usuario, logout } = useAuth();

  return (
    <header className="h-20 bg-neutral-900/50 backdrop-blur-xl border-b border-neutral-800/50 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="mr-4 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative hidden md:block">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Buscar pedido, agencia..." 
            className="pl-10 pr-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 focus:bg-neutral-800 transition-all w-64 lg:w-80"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-neutral-900"></span>
        </button>
        
        <div className="h-8 w-px bg-neutral-800 mx-2"></div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{usuario?.nombre || 'Usuario'}</p>
            <p className="text-xs text-neutral-500">{usuario?.rol?.nombre || usuario?.rol_nombre || 'Administrador'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
            {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
          <button 
            onClick={logout}
            className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-2"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
