
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full flex flex-col items-center justify-center pt-4 pb-2">
      {/* Remove tightly packed text, use Bungee_Shade font, nice size */}
      {/* Main title is now in Index, but this is backup branding if user scrolls up */}
      <h1
        className="font-['Bungee_Shade'] text-4xl md:text-6xl font-bold tracking-tight text-black dark:text-white select-none drop-shadow"
        style={{ fontFamily: "'Bungee Shade', cursive", letterSpacing: "0.03em", lineHeight: 1.1 }}
      >
        Poompt
      </h1>
    </header>
  );
};
export default Header;
