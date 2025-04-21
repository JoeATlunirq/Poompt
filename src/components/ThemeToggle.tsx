
import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  return (
    <button
      className="flex items-center gap-1 px-2 py-1 border rounded-lg border-gray-300 bg-white hover:bg-black hover:text-white transition-colors duration-200 font-mono text-xs"
      aria-label="Toggle light/dark mode"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <>
          <ToggleLeft size={16} /> Dark
        </>
      ) : (
        <>
          <ToggleRight size={16} /> Light
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
