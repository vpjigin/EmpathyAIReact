export interface TTSResponse {
  success: boolean;
  audioBlob?: Blob;
  error?: string;
}

export class TextToSpeechService {
  private static readonly API_BASE_URL = 'http://localhost:8080';
  private static currentAudio: HTMLAudioElement | null = null;
  private static currentAudioUrl: string | null = null;

  static async convertTextToSpeech(text: string): Promise<TTSResponse> {
    try {
      console.log('Converting text to speech:', text);
      
      // URL encode the text parameter
      const encodedText = encodeURIComponent(text);
      const url = `${this.API_BASE_URL}/api/text-to-speech?text=${encodedText}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'audio/*',
        },
      });

      if (!response.ok) {
        throw new Error(`TTS API request failed: ${response.status} ${response.statusText}`);
      }

      // Get the audio data as blob
      const audioBlob = await response.blob();
      
      console.log('TTS conversion successful, audio blob size:', audioBlob.size);
      
      return {
        success: true,
        audioBlob: audioBlob,
      };
      
    } catch (error) {
      console.error('Text-to-speech conversion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown TTS error',
      };
    }
  }

  static stopCurrentAudio(): void {
    if (this.currentAudio) {
      console.log('Stopping current audio playback');
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
  }

  static async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop any currently playing audio first
        this.stopCurrentAudio();
        
        // Create audio URL from blob
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Store references for management
        this.currentAudio = audio;
        this.currentAudioUrl = audioUrl;
        
        audio.onended = () => {
          console.log('Audio playback completed');
          // Clean up the object URL
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          this.currentAudioUrl = null;
          resolve();
        };
        
        audio.onerror = (error) => {
          console.error('Audio playback error:', error);
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          this.currentAudioUrl = null;
          reject(new Error('Audio playback failed'));
        };
        
        // Handle manual pause/stop
        audio.onpause = () => {
          if (audio.currentTime === 0) {
            // Audio was stopped, not just paused
            URL.revokeObjectURL(audioUrl);
            this.currentAudio = null;
            this.currentAudioUrl = null;
            resolve();
          }
        };
        
        // Start playing
        console.log('Starting new audio playback');
        audio.play().catch(reject);
        
      } catch (error) {
        console.error('Failed to create audio from blob:', error);
        reject(error);
      }
    });
  }

  static async convertAndPlay(text: string): Promise<void> {
    // Stop any currently playing audio before starting new conversion
    this.stopCurrentAudio();
    
    const result = await this.convertTextToSpeech(text);
    
    if (result.success && result.audioBlob) {
      await this.playAudio(result.audioBlob);
    } else {
      throw new Error(result.error || 'TTS conversion failed');
    }
  }
  
  static isAudioPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}