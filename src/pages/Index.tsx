
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MicrophoneButton from '@/components/MicrophoneButton';
import ModelSelector from '@/components/ModelSelector';
import StatusIndicator from '@/components/StatusIndicator';
import PromptDisplay from '@/components/PromptDisplay';

// Mock models - in a real app these would be defined elsewhere
const AI_MODELS = [
  { id: 'cursor', name: 'Cursor' },
  { id: 'windsurf', name: 'Windsurf' },
  { id: 'claude', name: 'Claude' },
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

  // Simulate recording functionality
  const handleMicToggle = (isActive: boolean) => {
    if (isActive) {
      // Start recording
      setStatus('listening');
      setShowResults(false);
      
      // Simulate recording for 3 seconds
      toast({
        title: "Recording started",
        description: "Capture your genius thoughts now!",
      });
      
      // After 3 seconds, simulate processing
      setTimeout(() => {
        setStatus('processing');
        
        // Simulate raw text from voice recognition
        setRawText("Hey I was thinking we could create a tool that helps developers quickly debug code visually maybe something that shows memory allocation and call stacks in a nice graph");
        
        // Simulate processing for 2 more seconds
        setTimeout(() => {
          // Generate refined prompt based on selected model
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
      }, 3000);
    } else {
      // Stop recording
      setStatus('idle');
      toast({
        title: "Recording stopped",
        description: "Your thoughts weren't fully captured.",
        variant: "destructive",
      });
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

  // Animated background elements
  const renderRandomElements = () => {
    const elements = [];
    const shapes = ['circle', 'square', 'triangle'];
    
    for (let i = 0; i < 15; i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = Math.floor(Math.random() * 8) + 4; // 4-12px
      const left = Math.floor(Math.random() * 100);
      const top = Math.floor(Math.random() * 100);
      const duration = Math.floor(Math.random() * 40) + 20; // 20-60s
      const delay = Math.floor(Math.random() * 10);
      
      let shapeClass = 'rounded-full';
      if (shape === 'square') shapeClass = 'rounded-sm';
      if (shape === 'triangle') shapeClass = 'triangle';
      
      elements.push(
        <div
          key={i}
          className={`absolute ${shapeClass} bg-gray-200 z-[-1]`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
            animation: `float ${duration}s infinite ease-in-out ${delay}s`
          }}
        />
      );
    }
    
    return elements;
  };

  return (
    <div className="grain min-h-screen flex flex-col items-center justify-between px-4 py-8 overflow-x-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden z-[-1]">
        {renderRandomElements()}
      </div>
      
      <Header />
      
      <main className="w-full flex-1 flex flex-col items-center justify-center space-y-8 py-10 max-w-3xl mx-auto">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-mono">
            <span className="inline-block transform rotate-1">Turn voice thoughts</span> 
            <span className="inline-block mx-1">→</span> 
            <span className="inline-block transform -rotate-1">into refined prompts</span>
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            For when brilliance strikes at the most unexpected moments.
            No typing required.
          </p>
        </div>
        
        <StatusIndicator status={status} className="mb-4" />
        
        <div className="relative">
          <MicrophoneButton 
            onToggle={handleMicToggle} 
            className="mb-6" 
          />
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 rotate-12">
            <div className="bg-white border border-black rounded-lg p-1 text-xs font-mono">
              tap me
            </div>
          </div>
        </div>
        
        <div className="w-full space-y-8">
          <ModelSelector 
            options={AI_MODELS} 
            selectedModel={selectedModel} 
            onSelect={handleModelSelect} 
            className="mt-6"
          />
          
          <PromptDisplay 
            rawText={rawText} 
            refinedPrompt={refinedPrompt} 
            isVisible={showResults} 
            className="mt-8"
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
