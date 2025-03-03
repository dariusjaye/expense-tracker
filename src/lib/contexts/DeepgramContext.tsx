"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DeepgramContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  connectToDeepgram: () => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  realtimeTranscript: string;
}

const DeepgramContext = createContext<DeepgramContextType>({
  apiKey: null,
  setApiKey: () => {},
  connectToDeepgram: async () => {},
  disconnectFromDeepgram: () => {},
  connectionState: 'disconnected',
  realtimeTranscript: '',
});

interface DeepgramProviderProps {
  children: ReactNode;
}

export function DeepgramProvider({ children }: DeepgramProviderProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [realtimeTranscript, setRealtimeTranscript] = useState<string>('');
  const [microphone, setMicrophone] = useState<MediaStream | null>(null);
  const [deepgramSocket, setDeepgramSocket] = useState<WebSocket | null>(null);

  // Fetch the API key from the server if needed
  const fetchApiKey = async () => {
    try {
      const response = await fetch('/api/deepgram/transcribe-audio');
      const data = await response.json();
      if (data.apiKey) {
        setApiKey(data.apiKey);
      }
    } catch (error) {
      console.error('Error fetching Deepgram API key:', error);
    }
  };

  // Initialize the API key if it's not set
  useEffect(() => {
    if (!apiKey) {
      fetchApiKey();
    }
  }, [apiKey]);

  // Connect to Deepgram
  const connectToDeepgram = async () => {
    if (!apiKey) {
      await fetchApiKey();
      if (!apiKey) {
        console.error('No Deepgram API key available');
        setConnectionState('error');
        return;
      }
    }

    try {
      setConnectionState('connecting');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophone(stream);
      
      // Create a WebSocket connection to Deepgram
      const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000`);
      
      // Set up event handlers
      socket.onopen = () => {
        // Send the API key for authentication
        socket.send(JSON.stringify({ type: 'Authorization', token: apiKey }));
        setConnectionState('connected');
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'Results') {
            const transcript = data.channel.alternatives[0].transcript;
            if (transcript) {
              setRealtimeTranscript(prev => prev + ' ' + transcript);
            }
          }
        } catch (error) {
          console.error('Error parsing Deepgram message:', error);
        }
      };
      
      socket.onerror = (error) => {
        console.error('Deepgram WebSocket error:', error);
        setConnectionState('error');
      };
      
      socket.onclose = () => {
        setConnectionState('disconnected');
      };
      
      setDeepgramSocket(socket);
      
      // Start sending audio data
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        if (socket.readyState === WebSocket.OPEN) {
          const audioData = e.inputBuffer.getChannelData(0);
          socket.send(audioData);
        }
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
    } catch (error) {
      console.error('Error connecting to Deepgram:', error);
      setConnectionState('error');
    }
  };
  
  // Disconnect from Deepgram
  const disconnectFromDeepgram = () => {
    if (deepgramSocket) {
      deepgramSocket.close();
      setDeepgramSocket(null);
    }
    
    if (microphone) {
      microphone.getTracks().forEach(track => track.stop());
      setMicrophone(null);
    }
    
    setConnectionState('disconnected');
  };

  return (
    <DeepgramContext.Provider value={{ 
      apiKey, 
      setApiKey,
      connectToDeepgram,
      disconnectFromDeepgram,
      connectionState,
      realtimeTranscript
    }}>
      {children}
    </DeepgramContext.Provider>
  );
}

export const useDeepgram = () => useContext(DeepgramContext); 