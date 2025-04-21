
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MicrophoneButtonProps {
  onToggle: () => void;
  isActive?: boolean;
  className?: string;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  onToggle,
  isActive = false,
  className
}) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-500",
        isActive
          ? "bg-black text-white scale-110 shadow-lg"
          : "bg-white text-black border-2 border-black hover:scale-105",
        "hover:shadow-md active:scale-95",
        className
      )}
      aria-label={isActive ? "Stop recording" : "Start recording"}
    >
      <div className={cn(
        "absolute inset-0 rounded-full",
        isActive ? "animate-ripple" : "hidden"
      )} />

      {isActive ? (
        <MicOff size={32} className="animate-pulse-subtle" />
      ) : (
        <Mic size={32} className="animate-float" />
      )}
    </button>
  );
};

export default MicrophoneButton;
