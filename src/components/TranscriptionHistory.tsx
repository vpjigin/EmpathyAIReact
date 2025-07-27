import React from 'react';
import './TranscriptionHistory.css';

export interface ChatMessage {
  id: string;
  timestamp: Date;
  type: 'user' | 'ai';
  content: string;
  filename?: string;
  needHumanIntervention?: boolean;
}

export interface Conversation {
  id: string;
  messages: ChatMessage[];
  startTime: Date;
}

interface TranscriptionHistoryProps {
  conversations: Conversation[];
}

const TranscriptionHistory: React.FC<TranscriptionHistoryProps> = ({ conversations }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const currentConversation = conversations.length > 0 ? conversations[0] : null;
  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);

  return (
    <div className="transcription-history">
      <div className="history-header">
        <h3>Conversation</h3>
        <div className="transcription-count">
          {totalMessages} {totalMessages === 1 ? 'message' : 'messages'}
        </div>
      </div>
      
      <div className="transcriptions-list">
        {!currentConversation || currentConversation.messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"/>
              </svg>
            </div>
            <p>No conversation yet</p>
            <small>Start recording and click "Pause & Send" to begin your conversation</small>
          </div>
        ) : (
          <div className="conversation">
            <div className="conversation-header">
              <div className="conversation-time">
                Started {formatTime(currentConversation.startTime)}
              </div>
            </div>
            <div className="messages">
              {[...currentConversation.messages].reverse().map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === 'user' ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H21V9ZM3 19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V11H3V19ZM12 13.5C13.4 13.5 14.5 14.6 14.5 16S13.4 18.5 12 18.5 9.5 17.4 9.5 16 10.6 13.5 12 13.5Z"/>
                      </svg>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-text">
                      {message.content}
                    </div>
                    <div className="message-meta">
                      <span className="message-time">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.needHumanIntervention && (
                        <div className="intervention-badge">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z"/>
                          </svg>
                          Attention
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionHistory;