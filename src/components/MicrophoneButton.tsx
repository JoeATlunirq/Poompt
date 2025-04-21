
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
        "relative flex items-center justify-center scale-100 transition-all duration-500 shadow-2xl",
        "rounded-full border-4",
        isActive
          ? "bg-black text-white border-white animate-pulse scale-105 ring-4 ring-primary"
          : "bg-white text-black border-black hover:scale-105 dark:bg-gray-800 dark:text-white dark:border-white",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/70",
        // always large
        "w-40 h-40 sm:w-52 sm:h-52",
        className
      )}
      aria-label={isActive ? "Stop recording" : "Start recording"}
    >
      <div className={cn(
        "absolute inset-0 rounded-full pointer-events-none",
        isActive ? "animate-ripple" : "hidden"
      )} />

      {isActive ? (
        <MicOff size={56} className="animate-pulse-subtle" />
      ) : (
        <Mic size={56} className="animate-float" />
      )}
    </button>
  );
};

export default MicrophoneButton;
