import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface SystemStatus {
  neuralNetworks: string;
  voiceRecognition: string;
  computerVision: string;
  apiIntegrations: string;
  lastUpdate: string;
}

interface PerformanceMetrics {
  speechAccuracy: number;
  faceAuth: number;
  objectDetection: number;
  wakeWordDetection: number;
  responseTime: number;
  uptime: number;
}

export const useJarvis = () => {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'assistant', content: 'Hello! I\'m J.A.R.V.I.S - Just a Reality Versatile System. How can I help you today?' }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    neuralNetworks: 'Active',
    voiceRecognition: 'Ready',
    computerVision: 'Online',
    apiIntegrations: '20+ Active',
    lastUpdate: new Date().toISOString()
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    speechAccuracy: 95,
    faceAuth: 98,
    objectDetection: 91,
    wakeWordDetection: 99,
    responseTime: 0.3,
    uptime: 0
  });

  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    console.log('Connecting to WebSocket...');
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to JARVIS server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from JARVIS server');
    });

    socketRef.current.on('status-update', (data) => {
      console.log('Status update received:', data);
      setSystemStatus(data.status);
      setPerformanceMetrics(data.metrics);
    });

    socketRef.current.on('metrics-update', (metrics) => {
      setPerformanceMetrics(metrics);
    });

    socketRef.current.on('chat-response', (data) => {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      }]);
      setIsProcessing(false);
      
      // Text-to-speech for responses
      speakText(data.response);
    });

    socketRef.current.on('chat-error', (data) => {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again.',
        timestamp: data.timestamp
      }]);
      setIsProcessing(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Always use HTTP API for reliability
      console.log('Sending message via HTTP API:', content);
      
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages.slice(-10)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response:', data);
      
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: data.response || data.fallbackResponse,
        timestamp: data.timestamp
      }]);
      
      setIsProcessing(false);
      
      // Text-to-speech for responses
      if (data.response) {
        speakText(data.response);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting to my neural networks. Please check your connection and try again.',
        timestamp: new Date().toISOString()
      }]);
      setIsProcessing(false);
    }
  }, [messages]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const speakText = useCallback(async (text: string) => {
    try {
      // Use Web Speech API for immediate response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Try to use a more natural voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft') ||
          voice.name.includes('Alex') ||
          voice.name.includes('Samantha')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
    }
  }, []);

  const analyzeImage = useCallback(async (imageFile: File, detectionResult?: any) => {
    try {
      let analysisText = '';
      let objectsText = '';

             // If we have object detection results, use them
       if (detectionResult && detectionResult.detections) {
         const objectList = Object.entries(detectionResult.objectCounts)
           .map(([obj, count]) => `${count as number} ${obj}${(count as number) > 1 ? 's' : ''}`)
           .join(', ');
        
        objectsText = `🔍 Object Detection Results:\n- ${detectionResult.totalObjects} objects detected\n- Found: ${objectList}\n\n`;
      }

      // Also get AI description
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('http://localhost:3001/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      // Handle undefined analysis gracefully
      const analysis = data.analysis || "I was unable to analyze this image at the moment.";
              analysisText = `🔍 Image Analysis: ${analysis}`;
      
      // Show quota warning if needed
      if (data.quotaExceeded) {
        analysisText += "\n\n⚠️ Note: Analysis is temporarily limited due to high demand.";
      }
      
      setMessages(prev => [...prev, 
        {
          type: 'user',
          content: `📸 Image uploaded: ${imageFile.name}`,
          timestamp: new Date().toISOString()
        },
        {
          type: 'assistant',
          content: `${objectsText}${analysisText}`,
          timestamp: data.timestamp || new Date().toISOString()
        }
      ]);

      const speakContent = detectionResult 
        ? `I detected ${detectionResult.totalObjects} objects including ${Object.keys(detectionResult.objectCounts).join(', ')}. ${data.analysis}`
        : `I can see ${data.analysis}`;
      
      speakText(speakContent);
      
      return { ...data, objectDetection: detectionResult };
    } catch (error) {
      console.error('Image analysis error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'I\'m having trouble analyzing that image. My computer vision systems may be temporarily offline.',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  return {
    messages,
    isListening,
    isProcessing,
    systemStatus,
    performanceMetrics,
    sendMessage,
    toggleListening,
    startListening,
    stopListening,
    speakText,
    analyzeImage
  };
};