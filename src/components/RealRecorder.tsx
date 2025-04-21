import React, { useRef, useState } from 'react';

interface RealRecorderProps {
  onTranscription: (text: string) => void;
  onStatusChange?: (status: 'idle' | 'listening' | 'processing' | 'complete' | 'error') => void;
}

const RealRecorder: React.FC<RealRecorderProps> = ({ onTranscription, onStatusChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
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

  const stopRecording = () => {
    mediaRecorder?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className={`px-6 py-3 rounded-full text-lg font-bold transition-colors duration-200 ${isRecording ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}
    >
      {isRecording ? 'Stop Recording' : 'Start Recording'}
    </button>
  );
};

export default RealRecorder;
