import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Settings, Zap, Home } from 'lucide-react';

interface VoiceCommandsProps {
  onCommand: (command: string, action: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

interface SmartHomeState {
  lights: boolean;
  temperature: number;
  security: boolean;
  music: boolean;
}

export const VoiceCommands: React.FC<VoiceCommandsProps> = ({ 
  onCommand, 
  isListening, 
  onToggleListening 
}) => {
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [smartHome, setSmartHome] = useState<SmartHomeState>({
    lights: false,
    temperature: 22,
    security: true,
    music: false
  });
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      setupSpeechRecognition(SpeechRecognition);
    }
  }, []);

  const setupSpeechRecognition = (SpeechRecognition: any) => {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results);
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.toLowerCase().trim();
        const confidenceScore = lastResult[0].confidence;
        
        setLastCommand(transcript);
        setConfidence(confidenceScore);
        
        // Check for wake word
        if (transcript.includes('hey jarvis') || transcript.includes('jarvis')) {
          setWakeWordActive(true);
          setTimeout(() => setWakeWordActive(false), 3000);
          processVoiceCommand(transcript);
        } else if (wakeWordActive) {
          processVoiceCommand(transcript);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
    };

    recognitionRef.current = recognition;
  };

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Smart home controls
    if (lowerCommand.includes('turn on lights') || lowerCommand.includes('lights on')) {
      setSmartHome(prev => ({ ...prev, lights: true }));
      onCommand(command, 'Lights turned on');
    } else if (lowerCommand.includes('turn off lights') || lowerCommand.includes('lights off')) {
      setSmartHome(prev => ({ ...prev, lights: false }));
      onCommand(command, 'Lights turned off');
    } else if (lowerCommand.includes('temperature')) {
      const tempMatch = lowerCommand.match(/(\d+)/);
      if (tempMatch) {
        const temp = parseInt(tempMatch[1]);
        setSmartHome(prev => ({ ...prev, temperature: temp }));
        onCommand(command, `Temperature set to ${temp}°C`);
      }
    } else if (lowerCommand.includes('security on') || lowerCommand.includes('arm security')) {
      setSmartHome(prev => ({ ...prev, security: true }));
      onCommand(command, 'Security system armed');
    } else if (lowerCommand.includes('security off') || lowerCommand.includes('disarm security')) {
      setSmartHome(prev => ({ ...prev, security: false }));
      onCommand(command, 'Security system disarmed');
    } else if (lowerCommand.includes('play music') || lowerCommand.includes('music on')) {
      setSmartHome(prev => ({ ...prev, music: true }));
      onCommand(command, 'Music started playing');
    } else if (lowerCommand.includes('stop music') || lowerCommand.includes('music off')) {
      setSmartHome(prev => ({ ...prev, music: false }));
      onCommand(command, 'Music stopped');
    } else if (lowerCommand.includes('scan room') || lowerCommand.includes('detect objects')) {
      onCommand(command, 'Starting object detection scan...');
    } else if (lowerCommand.includes('take picture') || lowerCommand.includes('capture image')) {
      onCommand(command, 'Capturing image for analysis...');
    } else {
      // Send to main chat system
      onCommand(command, 'Processing your request...');
    }
  };

  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    onToggleListening();
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Volume2 className="w-5 h-5 text-purple-400" />
          <span>Voice Commands</span>
        </h3>
        {isSupported ? (
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        ) : (
          <span className="text-red-400 text-sm">Not supported</span>
        )}
      </div>

      {/* Wake Word Status */}
      <div className={`mb-4 p-3 rounded-lg transition-all duration-300 ${
        wakeWordActive 
          ? 'bg-green-500/20 border border-green-500' 
          : 'bg-gray-700 border border-gray-600'
      }`}>
        <div className="flex items-center space-x-2">
          <Zap className={`w-4 h-4 ${wakeWordActive ? 'text-green-400' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">
            {wakeWordActive ? 'Wake Word Detected!' : 'Say "Hey JARVIS" to activate'}
          </span>
        </div>
      </div>

      {/* Last Command */}
      {lastCommand && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Last Command:</p>
          <p className="text-sm text-white">{lastCommand}</p>
          <p className="text-xs text-cyan-400 mt-1">Confidence: {(confidence * 100).toFixed(1)}%</p>
        </div>
      )}

      {/* Smart Home Controls */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3 flex items-center space-x-2">
          <Home className="w-4 h-4 text-blue-400" />
          <span>Smart Home Status</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Lights:</span>
            <span className={`font-medium ${smartHome.lights ? 'text-green-400' : 'text-red-400'}`}>
              {smartHome.lights ? 'ON' : 'OFF'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Temperature:</span>
            <span className="text-blue-400 font-medium">{smartHome.temperature}°C</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Security:</span>
            <span className={`font-medium ${smartHome.security ? 'text-green-400' : 'text-red-400'}`}>
              {smartHome.security ? 'ARMED' : 'DISARMED'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Music:</span>
            <span className={`font-medium ${smartHome.music ? 'text-green-400' : 'text-red-400'}`}>
              {smartHome.music ? 'PLAYING' : 'STOPPED'}
            </span>
          </div>
        </div>
      </div>

      {/* Voice Commands Help */}
      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <h4 className="text-xs font-semibold mb-2 text-gray-300">Voice Commands:</h4>
        <div className="text-xs text-gray-400 space-y-1">
          <p>• "Hey JARVIS, turn on lights"</p>
          <p>• "Set temperature to 24"</p>
          <p>• "Arm security system"</p>
          <p>• "Scan the room"</p>
          <p>• "Take a picture"</p>
        </div>
      </div>
    </div>
  );
}; 