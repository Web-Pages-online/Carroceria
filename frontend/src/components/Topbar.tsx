import React from 'react';
import { Bell, Menu } from 'lucide-react';

const Topbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <header className="h-16 bg-neutral-900/50 backdrop-blur-xl border-b border-neutral-800/50 flex items-center justify-between px-6 sticky top-0 z-20">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="ml-auto flex items-center space-x-4">
        <button className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-neutral-900"></span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
