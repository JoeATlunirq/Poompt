import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
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

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  color: 'white',
  fontSize: '2.5rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
};

const Index = () => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState('cursor');
  const [status, setStatus] = useState<StatusType>('idle');
  const [rawText, setRawText] = useState('');
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);

  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  
  useEffect(() => {
    // Apply the theme to the HTML element instead of body
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Countdown states
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

const handleMicToggle = async () => {
  if (!isRecording) {
    // Show countdown overlay
    setShowCountdown(true);
    setCountdown(5);
    let current = 5;
    countdownRef.current && clearInterval(countdownRef.current);
    countdownRef.current = setInterval(async () => {
      current -= 1;
      setCountdown(current);
      if (current <= 0) {
        clearInterval(countdownRef.current!);
        setShowCountdown(false);
        // Start recording after countdown
        setIsRecording(true);
        setStatus('listening');
        setShowResults(false);
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          audioChunksRef.current = [];
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          recorder.onstop = async () => {
            setStatus('processing');
            setProgress(50);
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('model', selectedModel);
            try {
              const apiUrl = 'https://poompt.onrender.com';
              const response = await fetch(`${apiUrl}/api/transcribe`, {
                method: 'POST',
                body: formData,
              });
              const data = await response.json();
              if (data.transcription) {
                setRawText(data.transcription);
                setRefinedPrompt(data.refinedPrompt || data.transcription);
                setShowResults(true);
                setStatus('complete');
                setProgress(100);
                toast({
                  title: 'Prompt ready!',
                  description: `Optimized for ${AI_MODELS.find(m => m.id === selectedModel)?.name}`,
                });
              } else {
                setStatus('error');
                toast({ title: 'Error', description: 'Transcription failed.' });
              }
            } catch (err) {
              setStatus('error');
              toast({ title: 'Error', description: 'Transcription failed.' });
            }
          };
          mediaRecorderRef.current = recorder;
          recorder.start();
        } catch (err) {
          setStatus('error');
          setIsRecording(false);
          toast({ title: 'Error', description: 'Could not access microphone.' });
        }
      }
    }, 1000);
  } else {
    // Stop recording
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
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

  const renderRandomElements = () => {
    const elements = [];
    const shapes = ['circle', 'square', 'triangle'];
    
    for (let i = 0; i < 15; i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = Math.floor(Math.random() * 8) + 4;
      const left = Math.floor(Math.random() * 100);
      const top = Math.floor(Math.random() * 100);
      const duration = Math.floor(Math.random() * 40) + 20;
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

  // Animate progress bar during processing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (status === 'processing') {
      setProgress(50);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 5 + 1;
        });
      }, 500);
    } else {
      setProgress(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  // Snap to 100% when complete
  useEffect(() => {
    if (status === 'complete') setProgress(100);
  }, [status]);

  return (
    <div className={`grain min-h-screen flex flex-col items-center justify-between px-4 py-8 overflow-x-hidden`}>
      <div className="fixed inset-0 overflow-hidden z-[-1]">
        {renderRandomElements()}
      </div>

      <div className="w-full flex items-center justify-end mb-2 px-2 max-w-3xl mx-auto">
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      {/* Countdown Overlay */}
      {showCountdown && (
        <div style={overlayStyle}>
          <div style={{ marginBottom: '1.5rem', fontSize: '2.2rem', fontWeight: 400 }}>Get ready...</div>
          <div style={{ fontSize: '4rem', fontWeight: 700, color: '#FFD700', textShadow: '2px 2px 8px #000' }}>{countdown}</div>
        </div>
      )}

      <Header />

      <main className="w-full flex-1 flex flex-col items-center justify-center space-y-8 py-10 max-w-3xl mx-auto">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl md:text-2xl font-mono">
            <span className="inline-block transform rotate-1">Turn voice thoughts</span>
            <span className="inline-block mx-1">→</span>
            <span className="inline-block transform -rotate-1">into refined prompts</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            For when brilliance strikes at the most unexpected moments.
            No typing required.
          </p>
        </div>

        <StatusIndicator status={status} className="mb-4" />

        <div className="relative">
  <MicrophoneButton
    onToggle={handleMicToggle}
    isActive={isRecording}
    className="mb-6"
  />
  <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 rotate-12">
    <div className="bg-white dark:bg-gray-800 border border-black dark:border-white rounded-lg p-1 text-xs font-mono dark:text-white">
      tap me
    </div>
  </div>
</div>

        {status === 'processing' && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center gap-2 animate-fade-in">
            <div className="relative w-full">
              <Progress
                value={progress}
                className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 overflow-hidden border border-black dark:border-white shadow-lg"
              />
              {/* Animated stripes overlay */}
              <div className="absolute inset-0 pointer-events-none animate-stripes opacity-60 rounded-full" />
              {/* Shimmer effect */}
              <div className="absolute inset-0 pointer-events-none animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <svg className="animate-spin h-5 w-5 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
              <span className="font-mono text-xs text-gray-700 dark:text-gray-300 animate-pulse">Transcribing & refining your prompt...</span>
            </div>
          </div>
        )}

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
            exportEnabled
          />
          {showResults && rawText && (
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 border-t pt-2">
              <strong>Raw transcription:</strong>
              <div className="whitespace-pre-line">{rawText}</div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
