
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full flex flex-col items-center justify-center py-6 relative">
      <h1 className="text-4xl md:text-6xl font-bold font-mono tracking-tight relative">
        P
        <span className="absolute -top-1 left-5 transform rotate-6">o</span>
        <span className="absolute top-0 left-10 transform -rotate-3">o</span>
        mpt
      </h1>
      <div className="relative flex items-center mt-2">
        <p className="text-sm font-mono text-gray-600 italic">
          Dump your thoughts. Prompt your future.
        </p>
        <span className="ml-2 animate-spin-slow inline-block">💩</span>
      </div>
    </header>
  );
};

export default Header;
