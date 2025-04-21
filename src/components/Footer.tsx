
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-8">
      <div className="flex flex-col items-center justify-center">
        <p className="text-xs text-gray-500 font-mono">
          No login. No tracking. Just dumping.
        </p>
        <div className="mt-2 font-mono text-xs flex items-center justify-center">
          <div className="transform -rotate-3">
            <span>Made with</span> <span className="inline-block animate-pulse-subtle">💩</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
