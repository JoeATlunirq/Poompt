
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
      "w-full max-w-2xl mx-auto space-y-7 transition-all duration-500",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
      className
    )}>
      {rawText && (
        <div className="space-y-1">
          <div className="flex justify-between items-center pb-1">
            <h3 className="text-base font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300 font-mono">Raw thought</h3>
            <button
              onClick={() => copyToClipboard(rawText)}
              className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              aria-label="Copy raw text"
            >
              Copy
            </button>
          </div>
          <div className="p-5 md:p-6 bg-gray-100 dark:bg-gray-800 rounded-xl text-base md:text-lg leading-snug text-black dark:text-white font-mono shadow-inner select-text">
            {rawText}
          </div>
        </div>
      )}

      {refinedPrompt && (
        <div className="space-y-1">
          <div className="flex justify-between items-center pb-1">
            <h3 className="text-base font-semibold uppercase tracking-wider text-black dark:text-white font-mono">Refined prompt</h3>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(refinedPrompt)}
                className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                aria-label="Copy refined prompt"
              >
                Copy
              </button>
              {exportEnabled && (
                <button
                  onClick={() => downloadTxt("poompt.txt", refinedPrompt)}
                  className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  aria-label="Export as .txt"
                >
                  Export .txt
                </button>
              )}
            </div>
          </div>
          <div className="p-5 md:p-6 bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-xl font-semibold text-black dark:text-white text-lg md:text-xl font-mono shadow-lg relative">
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-black dark:bg-white rounded-full border-2 border-white dark:border-black" />
            {refinedPrompt}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptDisplay;
