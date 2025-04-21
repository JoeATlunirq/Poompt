import React, { useRef, useState } from 'react';

// Add style for countdown overlay
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

interface RealRecorderProps {
  onTranscription: (text: string) => void;
  onStatusChange?: (status: 'idle' | 'listening' | 'processing' | 'complete' | 'error') => void;
}

const RealRecorder: React.FC<RealRecorderProps> = ({ onTranscription, onStatusChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Actual recording logic, to be called after countdown
  const doStartRecording = async () => {
    onStatusChange && onStatusChange('listening');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    setMediaRecorder(recorder);
    setAudioChunks([]);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setAudioChunks((prev) => [...prev, e.data]);
    };
    recorder.onstop = async () => {
      onStatusChange && onStatusChange('processing');
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      try {
        const response = await fetch('http://localhost:5001/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.transcription) {
          onTranscription(data.transcription);
          onStatusChange && onStatusChange('complete');
        } else {
          onStatusChange && onStatusChange('error');
        }
      } catch (err) {
        onStatusChange && onStatusChange('error');
      }
    };
    recorder.start();
    setIsRecording(true);
  };

  // Handles the countdown logic
  const handleStart = () => {
    setShowCountdown(true);
    setCountdown(5);
    let current = 5;
    countdownRef.current && clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current <= 0) {
        clearInterval(countdownRef.current!);
        setShowCountdown(false);
        doStartRecording();
      }
    }, 1000);
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  };

  return (
    <>
      {showCountdown && (
        <div style={overlayStyle}>
          <div style={{ marginBottom: '1.5rem', fontSize: '2.2rem', fontWeight: 400 }}>Get ready...</div>
          <div style={{ fontSize: '4rem', fontWeight: 700, color: '#FFD700', textShadow: '2px 2px 8px #000' }}>{countdown}</div>
        </div>
      )}
      <button
        onClick={isRecording ? stopRecording : handleStart}
        className={`px-6 py-3 rounded-full text-lg font-bold transition-colors duration-200 ${isRecording ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}
        disabled={showCountdown}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </>
  );
};

export default RealRecorder;
