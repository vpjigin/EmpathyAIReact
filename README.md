# Empathy AI - Mental Health Support Application

A React-based web application designed to provide empathetic AI-powered voice support for individuals experiencing mental health challenges, particularly those having suicidal thoughts.

## 🌟 Purpose

This application creates a safe, judgment-free space where users can:

- Share their thoughts and feelings through voice recordings
- Receive supportive AI-generated audio responses
- Access immediate crisis resources and professional help information
- Find comfort in a compassionate, always-available support system

## 🚀 Features

### Core Functionality

- **Voice Recording**: High-quality audio capture with real-time feedback
- **Real-time Audio Streaming**: WebSocket-based live audio transmission to server
- **AI Processing**: Secure server communication for empathetic response generation
- **Live Transcription**: Real-time speech-to-text processing during recording
- **Audio Playback**: Smooth playback of AI-generated supportive responses
- **Responsive Design**: Works across desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: CSS3 with modern gradients and animations
- **Audio**: Web Audio API for recording and playback
- **State Management**: React Hooks
- **HTTP Client**: Fetch API for server communication
- **Real-time Communication**: WebSocket for live audio streaming

## 📋 Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- A compatible server backend for AI processing

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd empathy-ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env to set your API server URL
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🔌 Server Integration

The application expects a server that supports both HTTP and WebSocket connections:

### HTTP Endpoint: POST `/api/process-audio`

- Accepts `multipart/form-data` with an `audio` field
- Returns JSON with:
  ```json
  {
    "success": true,
    "audioUrl": "https://your-server.com/response-audio.mp3",
    "message": "Optional text description of the response"
  }
  ```

### WebSocket Endpoint: `ws://localhost:8080/ws/audio-stream-native`

- Supports real-time audio streaming and transcription
- **Connection Flow**:
  1. Client connects to WebSocket endpoint
  2. Client sends session start message:
     ```json
     {
       "type": "start_streaming",
       "conversation_uuid": "unique-conversation-id"
     }
     ```
  3. Client streams raw audio data as binary messages
  4. Server responds with transcription and AI reply messages:
     ```json
     {
       "type": "transcription",
       "transcript": "User's spoken text",
       "reply": "AI-generated response",
       "conversation_uuid": "conversation-id",
       "needsHumanIntervention": false
     }
     ```

### Audio Requirements

- Input: WebM format with Opus codec or raw audio buffer
- Output: Any web-compatible audio format (MP3, WAV, WebM)
- WebSocket: Supports binary audio data streaming

## 🚀 Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`

Launches the test runner in interactive watch mode

### `npm run build`

Creates an optimized production build in the `build` folder
