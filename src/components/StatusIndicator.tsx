
import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'idle' | 'listening' | 'processing' | 'complete' | 'error';

interface StatusIndicatorProps {
  status: StatusType;
  message?: string;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  className
}) => {
  const getStatusDisplay = () => {
    switch(status) {
      case 'idle':
        return { text: "Ready to dump your thoughts", icon: "💭" };
      case 'listening':
        return { text: "Listening to your genius...", icon: "👂" };
      case 'processing':
        return { text: "Polishing your poompt...", icon: "✨" };
      case 'complete':
        return { text: "Prompt ready to use", icon: "🚀" };
      case 'error':
        return { text: "Something stinks...", icon: "💩" };
      default:
        return { text: "Ready to dump your thoughts", icon: "💭" };
    }
  };

  const { text, icon } = getStatusDisplay();
  const displayText = message || text;

  return (
    <div className={cn(
      "flex items-center justify-center space-x-3 font-mono px-4 py-3 rounded-xl shadow text-base md:text-2xl font-bold",
      status === 'error'
        ? "text-red-600 bg-red-100 dark:text-red-200 dark:bg-red-700"
        : "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800",
      className
    )}>
      <span className="animate-pulse-subtle text-xl md:text-2xl">{icon}</span>
      <span>{displayText}</span>
    </div>
  );
};

export default StatusIndicator;
