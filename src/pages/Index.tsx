
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MicrophoneButton from '@/components/MicrophoneButton';
import ModelSelector from '@/components/ModelSelector';
import StatusIndicator from '@/components/StatusIndicator';
import PromptDisplay from '@/components/PromptDisplay';
import { Progress } from '@/components/ui/progress';
import ThemeToggle from '@/components/ThemeToggle';

const AI_MODELS = [
  { id: 'cursor', name: 'Cursor' },
  { id: 'windsurf', name: 'Windsurf' },
  { id: 'v0', name: 'v0' },
  { id: 'lovable', name: 'Lovable' },
  { id: 'bolt', name: 'Bolt' },
];

type StatusType = 'idle' | 'listening' | 'processing' | 'complete' | 'error';

const Index = () => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState('cursor');
  const [status, setStatus] = useState<StatusType>('idle');
  const [rawText, setRawText] = useState('');
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const handleMicToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      setStatus('listening');
      setShowResults(false);
      toast({
        title: "Recording started",
        description: "Capture your genius thoughts now!",
      });
    } else {
      setIsRecording(false);
      setStatus('processing');
      setProgress(0);
      setRawText("Hey I was thinking we could create a tool that helps developers quickly debug code visually maybe something that shows memory allocation and call stacks in a nice graph");

      let curr = 0;
      const interval = setInterval(() => {
        curr += 10;
        setProgress(curr);
        if (curr >= 100) clearInterval(interval);
      }, 200);

      setTimeout(() => {
        const refinedText = `Create a development tool that provides visual debugging capabilities for code, with the following features:
1. Real-time memory allocation visualization
2. Interactive call stack graphs
3. Performance bottleneck identification
4. Integration with popular IDEs
5. Support for multiple programming languages

The tool should help developers quickly identify issues and optimize their code through intuitive visual representations rather than traditional text-based debugging.`;
        setRefinedPrompt(refinedText);
        setStatus('complete');
        setShowResults(true);

        toast({
          title: "Prompt ready!",
          description: `Optimized for ${AI_MODELS.find(m => m.id === selectedModel)?.name}`,
        });
      }, 2000);
    }
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    if (status === 'complete') {
      toast({
        title: "Model changed",
        description: `Switched to ${AI_MODELS.find(m => m.id === modelId)?.name}`,
      });
    }
  };

  useEffect(() => {
    if (status !== 'processing') setProgress(0);
  }, [status]);

  // --- Layout changes START here ---
  return (
    <div className="grain min-h-screen flex flex-col items-center justify-between bg-background transition-all px-2 sm:px-4 py-8 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        {/* background static/floating shapes can stay */}
      </div>

      <Header />

      {/* Toggle and Model Selector together, stacked, centered */}
      <div className="w-full flex flex-col items-center justify-center mt-2 gap-2 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-1">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
        <ModelSelector
          options={AI_MODELS}
          selectedModel={selectedModel}
          onSelect={handleModelSelect}
        />
      </div>

      <main className="w-full flex-1 flex flex-col items-center justify-center space-y-10 py-4 max-w-2xl mx-auto">
        {/* Title, description */}
        <section className="flex flex-col items-center justify-center pt-2 pb-6">
          <h2 className="font-['Bungee_Shade'] text-5xl md:text-7xl font-bold text-black dark:text-white tracking-wide mb-2 animate-fade-in drop-shadow-lg select-none">
            Poompt
          </h2>
          <span className="inline-block text-sm md:text-base font-mono text-gray-600 dark:text-gray-400 italic mb-1">
            Dump your thoughts. Prompt your future.
            <span className="ml-2 animate-spin-slow inline-block">💩</span>
          </span>
        </section>

        {/* Large record button, status, tap me label */}
        <section className="flex flex-col items-center justify-center gap-3">
          <div className="flex flex-col items-center justify-center gap-3">
            <MicrophoneButton
              onToggle={handleMicToggle}
              isActive={isRecording}
              className="mb-2 w-40 h-40 sm:w-52 sm:h-52"
            />
            <div className="relative w-full flex justify-center mt-[-8px]">
              <div className="bg-white dark:bg-gray-800 border border-black dark:border-white rounded-xl px-3 py-1 text-base md:text-lg font-mono dark:text-white text-black font-bold shadow-lg pointer-events-none select-none">
                tap to {isRecording ? "stop" : "record"}
              </div>
            </div>
          </div>
          <StatusIndicator status={status} className="mt-2 text-base md:text-xl" />
        </section>

        {/* Loading/progress bar */}
        {status === 'processing' && (
          <div className="w-full max-w-md mx-auto mt-2 px-3">
            <Progress value={progress} className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        )}

        {/* Prompts output */}
        <div className="w-full mt-6">
          <PromptDisplay
            rawText={rawText}
            refinedPrompt={refinedPrompt}
            isVisible={showResults}
            className="mt-8"
            exportEnabled
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

