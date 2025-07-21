import React, { useState, useRef } from 'react';
import './VoiceControls.css';

const VoiceControls = ({ onVoiceInput }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        
        // Clean up
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('language', 'auto');

      const response = await fetch('http://localhost:8000/api/voice-to-text', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && result.transcription) {
        onVoiceInput?.(result.transcription);
      } else {
        console.error('Transcription failed:', result);
        alert('Could not transcribe audio. Please try again.');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Error processing voice input. Please try again.');
    } finally {
      setIsProcessing(false);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  return (
    <div className="voice-controls">
      <button 
        className={`voice-btn ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
        onClick={handleClick}
        disabled={isProcessing}
        title={isRecording ? 'Stop Recording' : isProcessing ? 'Processing...' : 'Start Voice Recording'}
      >
        <div className="voice-icon">
          {isProcessing ? (
            <div className="processing-spinner"></div>
          ) : isRecording ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="2"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2"/>
            </svg>
          )}
        </div>
        
        {isRecording && (
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            <span className="recording-time">{formatTime(recordingTime)}</span>
          </div>
        )}
        
        {isProcessing && (
          <span className="processing-text">Processing...</span>
        )}
        
        {!isRecording && !isProcessing && (
          <span className="voice-text">Voice</span>
        )}
      </button>

      {/* Voice Status */}
      <div className="voice-status">
        {isRecording && (
          <div className="status-message recording">
            <div className="status-icon">🎤</div>
            <span>Listening... Speak about your drawing</span>
          </div>
        )}
        
        {isProcessing && (
          <div className="status-message processing">
            <div className="status-icon">🔄</div>
            <span>Converting speech to text...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceControls; 