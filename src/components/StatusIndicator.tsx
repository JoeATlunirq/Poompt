
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
      "flex items-center justify-center space-x-2 font-mono text-sm",
      status === 'error' ? "text-red-600" : "text-gray-600",
      className
    )}>
      <span className="animate-pulse-subtle text-lg">{icon}</span>
      <span>{displayText}</span>
    </div>
  );
};

export default StatusIndicator;
