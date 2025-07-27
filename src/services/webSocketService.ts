export interface WebSocketMessage {
  type: string;
  message?: string;
  conversation_uuid?: string;
  transcript?: string;
  reply?: string;
  needsHumanIntervention?: boolean;
  error?: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private conversationUuid: string | null = null;
  private onTranscription: ((message: WebSocketMessage) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;

  constructor(
    onTranscription: (message: WebSocketMessage) => void,
    onError: (error: string) => void
  ) {
    this.onTranscription = onTranscription;
    this.onError = onError;
  }

  connect(conversationUuid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.conversationUuid = conversationUuid;
        this.ws = new WebSocket('ws://localhost:8080/ws/audio-stream-native');

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          
          // Send session start message
          const startMessage = {
            type: "start_streaming",
            conversation_uuid: conversationUuid
          };
          
          this.ws?.send(JSON.stringify(startMessage));
          console.log('Sent start streaming message:', startMessage);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('Received WebSocket message:', message);
            
            if (this.onTranscription) {
              this.onTranscription(message);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            if (this.onError) {
              this.onError('Failed to parse server response');
            }
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          if (this.onError) {
            this.onError(`WebSocket connection error. Make sure the server is running at ws://localhost:8080/ws/audio-stream-native`);
          }
          reject(new Error(`WebSocket connection failed. Server may not be running.`));
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed unexpectedly:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            timestamp: new Date().toISOString()
          });
          
          // Only reconnect if it wasn't a clean close (code 1000) and we haven't exceeded attempts
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log(`WebSocket closed unexpectedly, attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
              this.reconnectAttempts++;
              if (this.conversationUuid) {
                console.log('Reconnecting to WebSocket...');
                this.connect(this.conversationUuid).catch(console.error);
              }
            }, this.reconnectInterval);
          } else if (event.code === 1000) {
            console.log('WebSocket closed cleanly by user or server');
          } else {
            console.log('Max reconnection attempts reached, giving up');
          }
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  sendAudioData(audioData: ArrayBuffer): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioData);
    } else {
      console.warn('WebSocket not connected, cannot send audio data. State:', 
        this.ws ? this.ws.readyState : 'null');
      
      // Log the WebSocket state for debugging
      if (this.ws) {
        const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
        console.warn('WebSocket state:', states[this.ws.readyState] || 'UNKNOWN');
      }
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }
    this.conversationUuid = null;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}