import React, { useState, useRef, useEffect } from 'react';
import './AudioPlayer.css';

interface AudioPlayerProps {
  audioUrl: string | null;
  message?: string;
  onPlaybackComplete?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, message, onPlaybackComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (onPlaybackComplete) {
      onPlaybackComplete();
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return null;
  }

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      
      <div className="player-header">
        <div className="ai-avatar">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H21V9ZM3 19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V11H3V19ZM12 13.5C13.4 13.5 14.5 14.6 14.5 16S13.4 18.5 12 18.5 9.5 17.4 9.5 16 10.6 13.5 12 13.5Z"/>
          </svg>
        </div>
        <div className="response-info">
          <h3>AI Response</h3>
          {message && <p className="response-message">{message}</p>}
        </div>
      </div>

      <div className="player-controls">
        <button 
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="8,5 19,12 8,19"/>
            </svg>
          )}
        </button>

        <div className="progress-container">
          <span className="time current-time">{formatTime(currentTime)}</span>
          <div className="progress-bar" onClick={handleProgressClick}>
            <div 
              className="progress-fill"
              style={{ 
                width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' 
              }}
            />
          </div>
          <span className="time duration">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-footer">
        <p>Listen to this supportive response. You matter, and help is available.</p>
      </div>
    </div>
  );
};

export default AudioPlayer;