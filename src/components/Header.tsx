
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full flex flex-col items-center justify-center py-6 relative">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight relative font-['Bungee_Shade']">
        Poompt
      </h1>
      <div className="relative flex items-center mt-2">
        <p className="text-sm font-mono text-gray-600 italic dark:text-gray-400">
          Dump your thoughts. Prompt your future.
        </p>
        <span className="ml-2 animate-spin-slow inline-block">💩</span>
      </div>
    </header>
  );
};

export default Header;
