import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

const Topbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
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
      </div>
    </header>
  );
};

export default Topbar;
