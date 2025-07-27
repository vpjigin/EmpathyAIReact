import React, { useState, useEffect } from 'react';
import './App.css';
import AudioRecorder from './components/AudioRecorder';
import AudioPlayer from './components/AudioPlayer';
import TranscriptionHistory, { Conversation, ChatMessage } from './components/TranscriptionHistory';
import HelplinePopup from './components/HelplinePopup';
import { WebSocketMessage } from './services/webSocketService';
import { TextToSpeechService } from './services/textToSpeechService';

// Generate UUID function
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

function App() {
  const [isProcessing] = useState(false);
  const [currentResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationUuid, setCurrentConversationUuid] = useState<string | null>(null);
  const [showHelplinePopup, setShowHelplinePopup] = useState<boolean>(false);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    // This is now handled by WebSocket, keeping for compatibility
    console.log('Recording complete - WebSocket mode');
  };

  const handleWebSocketMessage = async (message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);
    
    if (message.type === 'transcript' && message.transcript && message.reply) {
      // Add user message with transcript
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'user',
        content: message.transcript,
      };
      
      // Add AI response message
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        timestamp: new Date(Date.now() + 100),
        type: 'ai',
        content: message.reply,
        needHumanIntervention: message.needsHumanIntervention || false,
      };
      
      setConversations(prev => {
        const updatedConversations = [...prev];
        if (updatedConversations.length > 0) {
          const currentMessages = [...updatedConversations[0].messages, userMessage, aiMessage];
          updatedConversations[0] = {
            ...updatedConversations[0],
            messages: currentMessages
          };
        }
        return updatedConversations;
      });

      // Check if human intervention is needed and show popup
      if (message.needsHumanIntervention) {
        console.log('Human intervention needed - showing helpline popup');
        setShowHelplinePopup(true);
      }

      // Convert AI reply to speech and play it (this will automatically stop any current audio)
      try {
        console.log('Converting AI reply to speech:', message.reply);
        console.log('Previous audio will be stopped if playing');
        await TextToSpeechService.convertAndPlay(message.reply);
        console.log('TTS playback completed');
      } catch (ttsError) {
        console.error('TTS failed:', ttsError);
        // Don't show TTS errors to user as they're not critical
      }
    }
    
    if (message.error) {
      setError(message.error);
    }
  };
  
  const handleWebSocketError = (error: string) => {
    console.error('WebSocket error:', error);
    setError(error);
  };

  const handleStartNewConversation = (): string => {
    const uuid = generateUUID();
    setCurrentConversationUuid(uuid);
    
    // Create new conversation
    const newConversation: Conversation = {
      id: uuid,
      messages: [],
      startTime: new Date(),
    };
    
    // Clear previous conversations and start fresh with new one
    setConversations([newConversation]);
    console.log('Started new conversation with UUID:', uuid);
    return uuid;
  };

  const handleEndConversation = () => {
    setCurrentConversationUuid(null);
    // Stop any playing TTS audio when conversation ends
    TextToSpeechService.stopCurrentAudio();
    console.log('Ended conversation and stopped any playing audio');
  };

  const handleCloseHelplinePopup = () => {
    setShowHelplinePopup(false);
  };

  const handlePlaybackComplete = () => {
    // Optional: Add any cleanup or next steps after audio playback
  };

  // Cleanup effect to stop any playing audio when component unmounts
  useEffect(() => {
    return () => {
      TextToSpeechService.stopCurrentAudio();
      console.log('App unmounting - stopped any playing audio');
    };
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>Empathy AI</h1>
        <p>A safe space to share your thoughts and feelings</p>
      </header>

      <main className="app-main">
        <div className="support-message">
          <h2>You're Not Alone</h2>
          <p>
            This is a judgment-free space where you can express yourself freely. 
            Our AI companion is here to listen with empathy and provide supportive guidance.
          </p>
        </div>

        <div className="main-content">
          <div className="recording-section">
            <AudioRecorder 
              onRecordingComplete={handleRecordingComplete}
              onProcessingComplete={() => {}} // Empty callback as auto-resume is handled internally
              isProcessing={isProcessing}
              conversationUuid={currentConversationUuid}
              onStartNewConversation={handleStartNewConversation}
              onEndConversation={handleEndConversation}
              onWebSocketMessage={handleWebSocketMessage}
              onWebSocketError={handleWebSocketError}
            />

            {error && (
              <div className="error-message">
                <p>⚠️ {error}</p>
                <small>Please try again or check your connection.</small>
              </div>
            )}

            {currentResponse && currentResponse.success && (
              <AudioPlayer
                audioUrl={currentResponse.audioUrl || null}
                message={currentResponse.message}
                onPlaybackComplete={handlePlaybackComplete}
              />
            )}
          </div>

          <TranscriptionHistory conversations={conversations} />
        </div>

      </main>

      <HelplinePopup 
        isOpen={showHelplinePopup} 
        onClose={handleCloseHelplinePopup} 
      />
    </div>
  );
}

export default App;
