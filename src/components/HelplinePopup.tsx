import React from 'react';
import './HelplinePopup.css';

interface HelplinePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelplineNumber {
  country: string;
  number: string;
  description: string;
}

const helplineNumbers: HelplineNumber[] = [
  {
    country: "USA",
    number: "988",
    description: "Suicide & Crisis Lifeline"
  },
  {
    country: "USA",
    number: "1-800-273-8255",
    description: "National Suicide Prevention Lifeline"
  },
  {
    country: "Canada",
    number: "1-833-456-4566",
    description: "Talk Suicide Canada"
  },
  {
    country: "UK",
    number: "116 123",
    description: "Samaritans"
  },
  {
    country: "Australia",
    number: "13 11 14",
    description: "Lifeline Australia"
  },
  {
    country: "Germany",
    number: "0800 111 0 111",
    description: "Telefonseelsorge"
  },
  {
    country: "France",
    number: "3114",
    description: "National Suicide Prevention Line"
  },
  {
    country: "Japan",
    number: "0570-783-556",
    description: "Japanese Association for Suicide Prevention"
  },
  {
    country: "South Korea",
    number: "1393",
    description: "Korea Suicide Prevention Center"
  },
  {
    country: "India",
    number: "91-9152987821",
    description: "AASRA Suicide Prevention"
  },
  {
    country: "Brazil",
    number: "188",
    description: "Centro de Valorização da Vida"
  },
  {
    country: "Netherlands",
    number: "0900-0113",
    description: "Foundation 113 Suicide Prevention"
  },
  {
    country: "Sweden",
    number: "90101",
    description: "Mind Suicide Prevention"
  },
  {
    country: "Norway",
    number: "815 33 300",
    description: "Mental Helse"
  },
  {
    country: "New Zealand",
    number: "1737",
    description: "Need to Talk?"
  },
  {
    country: "International",
    number: "Text HOME to 741741",
    description: "Crisis Text Line"
  }
];

const HelplinePopup: React.FC<HelplinePopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="helpline-popup-overlay" onClick={handleOverlayClick}>
      <div className="helpline-popup">
        <div className="popup-header">
          <div className="urgency-indicator">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
            </svg>
            <h2>Immediate Help Available</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
            </svg>
          </button>
        </div>

        <div className="popup-content">
          <div className="urgent-message">
            <p>
              <strong>You don't have to face this alone.</strong> Professional help is available 24/7. 
              Please reach out to one of these helplines immediately:
            </p>
          </div>

          <div className="helpline-grid">
            {helplineNumbers.map((helpline, index) => (
              <div key={index} className="helpline-card">
                <div className="helpline-country">{helpline.country}</div>
                <div className="helpline-number">
                  <a href={`tel:${helpline.number.replace(/\s+/g, '')}`}>
                    {helpline.number}
                  </a>
                </div>
                <div className="helpline-description">{helpline.description}</div>
              </div>
            ))}
          </div>

          <div className="additional-resources">
            <h3>Additional Support</h3>
            <ul>
              <li>If you're in immediate danger, call your local emergency services (911, 999, 112)</li>
              <li>Visit your nearest hospital emergency room</li>
              <li>Reach out to a trusted friend, family member, or counselor</li>
              <li>Contact your local mental health crisis center</li>
            </ul>
          </div>

          <div className="popup-footer">
            <p>Remember: This moment is temporary. Help is available, and you matter.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelplinePopup;