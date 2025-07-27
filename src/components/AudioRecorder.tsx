import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WebSocketService } from '../services/webSocketService';
import './AudioRecorder.css';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onProcessingComplete: () => void;
  isProcessing: boolean;
  conversationUuid: string | null;
  onStartNewConversation: () => string;
  onEndConversation: () => void;
  onWebSocketMessage: (message: any) => void;
  onWebSocketError: (error: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onRecordingComplete, 
  onProcessingComplete, 
  isProcessing, 
  conversationUuid, 
  onStartNewConversation, 
  onEndConversation,
  onWebSocketMessage,
  onWebSocketError
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const webSocketRef = useRef<WebSocketService | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const initializeAudioContext = useCallback(async () => {
    try {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000
          }
        });
      }

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processorRef.current.onaudioprocess = (event) => {
        if (webSocketRef.current && webSocketRef.current.isConnected()) {
          const inputData = event.inputBuffer.getChannelData(0);
          
          // Convert float32 to 16-bit PCM
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const sample = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          }
          
          webSocketRef.current.sendAudioData(pcmData.buffer);
        }
      };
      
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      
      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Error initializing audio context:', error);
      throw error;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      console.log('Starting recording...');
      
      // Start new conversation if not already started
      let uuid = conversationUuid;
      if (!uuid) {
        uuid = onStartNewConversation();
      }
      
      console.log('Attempting to connect to WebSocket at: ws://localhost:8080/ws/audio-stream-native');
      
      // Initialize WebSocket connection
      webSocketRef.current = new WebSocketService(onWebSocketMessage, onWebSocketError);
      try {
        await webSocketRef.current.connect(uuid);
        console.log('WebSocket connection successful');
      } catch (wsError) {
        console.error('WebSocket connection failed:', wsError);
        throw new Error(`WebSocket connection failed: ${wsError}`);
      }
      
      // Initialize audio streaming
      console.log('Initializing audio context...');
      try {
        await initializeAudioContext();
        console.log('Audio context initialization successful');
      } catch (audioError) {
        console.error('Audio initialization failed:', audioError);
        throw new Error(`Audio initialization failed: ${audioError}`);
      }
      
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      onWebSocketError(`Unable to start recording: ${error}`);
    }
  }, [conversationUuid, onStartNewConversation, onWebSocketMessage, onWebSocketError, initializeAudioContext]);

  const stopRecording = useCallback(() => {
    console.log('Stopping recording...');
    
    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Stop the media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Disconnect WebSocket
    if (webSocketRef.current) {
      webSocketRef.current.disconnect();
      webSocketRef.current = null;
    }
    
    setIsRecording(false);
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // End current conversation
    onEndConversation();
    
    console.log('Recording stopped successfully');
  }, [onEndConversation]);

  // Cleanup on component unmount only
  useEffect(() => {
    return () => {
      // Clean up WebSocket and audio resources on unmount
      if (webSocketRef.current) {
        webSocketRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []); // Empty dependency array - only runs on unmount

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-recorder">
      <div className="recording-status">
        {isRecording && (
          <div className="recording-indicator">
            <div className="pulse-dot"></div>
            <span>Recording... {formatTime(recordingTime)}</span>
          </div>
        )}
      </div>
      
      <div className="recording-controls">
        {!isRecording ? (
          <button 
            className={`record-button start ${isProcessing ? 'processing' : ''}`}
            onClick={startRecording}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="2">
                  <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
                </circle>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="8"/>
              </svg>
            )}
            {isProcessing ? 'Processing...' : 'Start Recording'}
          </button>
        ) : (
          <button 
            className="record-button stop"
            onClick={stopRecording}
            disabled={isProcessing}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            Stop Recording
          </button>
        )}
      </div>
      
      <p className="recording-hint">
        {!isRecording && !isProcessing && "Press 'Start Recording' to begin streaming audio to AI. Real-time responses will appear in the conversation."}
        {isRecording && !isProcessing && "Recording and streaming to AI... Click 'Stop Recording' to end the session."}
        {isProcessing && "Processing your message with care..."}
      </p>
    </div>
  );
};

export default AudioRecorder;