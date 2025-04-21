
import React from 'react';
import { cn } from '@/lib/utils';

interface PromptDisplayProps {
  rawText: string;
  refinedPrompt: string;
  isVisible: boolean;
  className?: string;
  exportEnabled?: boolean;
}

const downloadTxt = (filename: string, text: string) => {
  const element = document.createElement('a');
  const file = new Blob([text], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const PromptDisplay: React.FC<PromptDisplayProps> = ({
  rawText,
  refinedPrompt,
  isVisible,
  className,
  exportEnabled
}) => {
  if (!isVisible) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    console.log('Copied to clipboard:', text);
  };

  return (
    <div className={cn(
      "w-full max-w-2xl mx-auto space-y-4 transition-all duration-500",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
      className
    )}>
      {rawText && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono">Raw thought</h3>
            <button
              onClick={() => copyToClipboard(rawText)}
              className="text-xs text-gray-500 hover:text-black dark:hover:text-white"
              aria-label="Copy raw text"
            >
              copy
            </button>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
            {rawText}
          </div>
        </div>
      )}

      {refinedPrompt && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-wider text-black dark:text-white font-mono">Refined prompt</h3>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(refinedPrompt)}
                className="text-xs text-gray-500 hover:text-black dark:hover:text-white"
                aria-label="Copy refined prompt"
              >
                copy
              </button>
              {exportEnabled && (
                <button
                  onClick={() => downloadTxt("poompt.txt", refinedPrompt)}
                  className="text-xs text-gray-500 hover:text-black dark:hover:text-white"
                  aria-label="Export as .txt"
                >
                  export .txt
                </button>
              )}
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-md font-medium relative">
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-black dark:bg-white rounded-full" />
            {refinedPrompt}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptDisplay;
