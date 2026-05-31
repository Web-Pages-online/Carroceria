import React from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Topbar = () => {
  return (
    <header className="h-20 bg-neutral-900/30 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center bg-neutral-800/50 rounded-full px-4 py-2 w-96 border border-neutral-700/50 focus-within:border-orange-500/50 transition-colors">
        <Search className="w-5 h-5 text-neutral-400" />
        <input 
          type="text" 
          placeholder="Buscar pedidos, agencias..." 
          className="bg-transparent border-none outline-none text-white ml-3 w-full placeholder-neutral-500"
        />
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative text-neutral-400 hover:text-white transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-neutral-900"></span>
        </button>
        
        <div className="flex items-center space-x-3 pl-6 border-l border-neutral-700">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
            J
          </div>
          <div className="hidden md:block text-sm">
            <p className="text-white font-medium">Jesús</p>
            <p className="text-neutral-400 text-xs">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
