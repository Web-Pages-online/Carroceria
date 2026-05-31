import React from 'react';
import { Home, Package, Users, Settings, Wrench } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="bg-neutral-900/50 backdrop-blur-md border-r border-neutral-800 text-white w-64 h-screen hidden md:flex flex-col sticky top-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-orange-500 p-2 rounded-lg">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-wider">MULTISERVICIOS DE SOLDADURA TORALES</span>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        <NavItem to="/tablero" icon={<Home />} label="Tablero" />
        <NavItem to="/inventario" icon={<Package />} label="Inventario" />
        <NavItem to="/agencias" icon={<Users />} label="Agencias" />
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <NavItem to="/configuracion" icon={<Settings />} label="Configuración" />
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

export default Sidebar;
