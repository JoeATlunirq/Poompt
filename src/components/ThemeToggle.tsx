
import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  return (
    <button
      className={`flex items-center gap-1 px-2 py-1 border rounded-lg transition-colors duration-200 font-mono text-xs
        ${theme === 'dark' 
          ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700' 
          : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`}
      aria-label="Toggle light/dark mode"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <>
          <Moon size={16} /> Dark
        </>
      ) : (
        <>
          <Sun size={16} /> Light
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
