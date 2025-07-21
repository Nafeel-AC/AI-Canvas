import React, { useState, useRef } from 'react';
import './VoiceSynthesis.css';

const VoiceSynthesis = ({ text }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Clean up previous audio URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

      // Request TTS from backend
      const response = await fetch('http://localhost:8000/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice_id: "21m00Tcm4TlvDq8ikWAM", // Default voice
          model_id: "eleven_monolingual_v1"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        // Clean up
        URL.revokeObjectURL(audioUrl);
        audioUrlRef.current = null;
      };

      audio.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
        setIsLoading(false);
      };

      await audio.play();

    } catch (error) {
      console.error('Error generating speech:', error);
      setError('Failed to generate speech');
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="voice-synthesis">
      <button
        className={`play-btn ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={handlePlayAudio}
        disabled={isLoading || !text}
        title={isPlaying ? 'Stop Audio' : isLoading ? 'Generating Audio...' : 'Play as Speech'}
      >
        <div className="play-icon">
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
              <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <polygon points="5,3 19,12 5,21" fill="currentColor"/>
            </svg>
          )}
        </div>
        
        <span className="play-text">
          {isLoading ? 'Generating...' : isPlaying ? 'Playing' : 'Listen'}
        </span>
      </button>

      {error && (
        <div className="error-message" title={error}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default VoiceSynthesis; 