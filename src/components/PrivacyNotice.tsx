import React, { useState } from 'react';
import './PrivacyNotice.css';

interface PrivacyNoticeProps {
  onAccept: () => void;
}

const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ onAccept }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="privacy-notice-overlay">
      <div className="privacy-notice">
        <div className="notice-header">
          <h2>Privacy & Safety Notice</h2>
          <div className="security-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.4 7 14.5 8.1 14.5 9.5V10.5C15.1 10.5 15.5 11 15.5 11.5V15.5C15.5 16 15.1 16.5 14.5 16.5H9.5C9 16.5 8.5 16 8.5 15.5V11.5C8.5 11 9 10.5 9.5 10.5V9.5C9.5 8.1 10.6 7 12 7ZM12 8.2C11.2 8.2 10.7 8.7 10.7 9.5V10.5H13.3V9.5C13.3 8.7 12.8 8.2 12 8.2Z"/>
            </svg>
          </div>
        </div>

        <div className="notice-content">
          <div className="key-points">
            <div className="point">
              <strong>🔒 Your Privacy Matters</strong>
              <p>Your audio recordings are processed securely and are not stored permanently on our servers.</p>
            </div>
            <div className="point">
              <strong>🤖 AI Support Only</strong>
              <p>This tool provides AI-generated responses and is not a substitute for professional mental health care.</p>
            </div>
            <div className="point">
              <strong>🚨 Crisis Situations</strong>
              <p>If you're having thoughts of self-harm, please contact emergency services (911) or a crisis hotline immediately.</p>
            </div>
          </div>

          <button 
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Read Full Privacy Policy'}
          </button>

          {isExpanded && (
            <div className="full-policy">
              <h3>Full Privacy Policy</h3>
              <div className="policy-section">
                <h4>Data Collection</h4>
                <p>We collect audio recordings for the sole purpose of providing AI-generated supportive responses. No personal identifying information is required or stored.</p>
              </div>
              <div className="policy-section">
                <h4>Data Processing</h4>
                <p>Audio is processed using secure AI services. Recordings are automatically deleted after processing and response generation.</p>
              </div>
              <div className="policy-section">
                <h4>Data Storage</h4>
                <p>No audio recordings or transcripts are permanently stored. Session data is cleared when you close the application.</p>
              </div>
              <div className="policy-section">
                <h4>Third Party Services</h4>
                <p>We may use trusted AI service providers to process audio. All providers are bound by strict data protection agreements.</p>
              </div>
              <div className="policy-section">
                <h4>Your Rights</h4>
                <p>You can stop using the service at any time. No data is retained after your session ends.</p>
              </div>
            </div>
          )}
        </div>

        <div className="notice-actions">
          <div className="consent-checkbox">
            <label>
              <input type="checkbox" required />
              <span>I understand this is an AI tool and not professional therapy</span>
            </label>
          </div>
          <div className="action-buttons">
            <button className="decline-button" onClick={() => window.close()}>
              Decline
            </button>
            <button className="accept-button" onClick={onAccept}>
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;