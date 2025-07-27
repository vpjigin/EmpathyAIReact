const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface AudioResponse {
  success: boolean;
  audioUrl?: string;
  message?: string;
  error?: string;
  status?: string;
  filename?: string;
  transcription?: string;
  needHumanIntervention?: boolean;
  transcriptionReply?: string;
}

export class AudioService {
  static async sendAudioToServer(audioBlob: Blob, conversationUuid: string): Promise<AudioResponse> {
    try {
      console.log('Sending audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type
      });
      
      if (audioBlob.size === 0) {
        throw new Error('Audio blob is empty');
      }
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('uuid', conversationUuid);
      
      const response = await fetch(`${API_BASE_URL}/api/audio`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        return {
          success: true,
          status: result.status,
          message: result.message,
          filename: result.filename,
          transcription: result.transcription,
          needHumanIntervention: result.needHumanIntervention,
          transcriptionReply: result.transcriptionReply,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to transcribe audio',
        };
      }
    } catch (error: any) {
      console.error('Error communicating with server:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to connect to server. Please check your connection.',
      };
    }
  }

  static async downloadAudio(audioUrl: string): Promise<Blob | null> {
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to download audio: ${response.status}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Error downloading audio:', error);
      return null;
    }
  }

  static createAudioUrl(audioBlob: Blob): string {
    return URL.createObjectURL(audioBlob);
  }

  static releaseAudioUrl(audioUrl: string): void {
    URL.revokeObjectURL(audioUrl);
  }
}