
import React from 'react';
import { cn } from '@/lib/utils';

interface ModelOption {
  id: string;
  name: string;
}

interface ModelSelectorProps {
  options: ModelOption[];
  selectedModel: string;
  onSelect: (modelId: string) => void;
  className?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  options,
  selectedModel,
  onSelect,
  className
}) => {
  return (
    <div className={cn("flex flex-wrap justify-center gap-2 max-w-md mx-auto", className)}>
      {options.map((model) => (
        <button
          key={model.id}
          onClick={() => onSelect(model.id)}
          className={cn(
            "px-4 py-2 rounded-full border transition-all duration-300 text-sm font-mono",
            selectedModel === model.id
              ? "bg-black text-white border-black" 
              : "bg-white text-black border-gray-300 hover:border-black"
          )}
        >
          {model.name}
        </button>
      ))}
    </div>
  );
};

export default ModelSelector;
