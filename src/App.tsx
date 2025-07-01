import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Send,
  Settings,
  Activity,
  Waves,
  Brain,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useJarvis } from './hooks/useJarvis';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { ImageUpload } from './components/ImageUpload';
import { WebcamDetection } from './components/WebcamDetection';
import { VoiceCommands } from './components/VoiceCommands';
import { SystemDashboard } from './components/AISystemDashboard';
import { ChatStatus } from './components/ChatStatus';
import { AboutPage } from './components/AboutPage';

function App() {
  const [inputMessage, setInputMessage] = useState('');
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isObjectDetectionActive, setIsObjectDetectionActive] = useState(false);
  const [isVoiceCommandsActive, setIsVoiceCommandsActive] = useState(false);
  const [activeTab, setActiveTab] = useState('controls');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isListening,
    isProcessing,
    systemStatus,
    performanceMetrics,
    sendMessage,
    toggleListening,
    analyzeImage
  } = useJarvis();

  const handleVoiceCommand = async (command: string, action: string) => {
    // Add voice command to chat
    sendMessage(`🎤 Voice Command: ${command}`);
    
    // Process with backend if needed
    try {
      const response = await fetch('/api/process-voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, context: 'Smart Home Control' })
      });
      
      if (response.ok) {
        const result = await response.json();
        // Add JARVIS response
        setTimeout(() => {
          sendMessage(`🤖 JARVIS: ${result.response}`);
        }, 500);
      }
    } catch (error) {
      console.error('Voice command processing failed:', error);
      setTimeout(() => {
        sendMessage(`🤖 JARVIS: ${action}`);
      }, 500);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Animated background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{x: number, y: number, vx: number, vy: number, size: number, opacity: number}> = [];
    
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 217, 255, ${particle.opacity})`;
        ctx.fill();
      });
      
      // Draw connections
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) + 
            Math.pow(particle.y - otherParticle.y, 2)
          );
          
          if (distance < 80) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(0, 217, 255, ${0.08 * (1 - distance / 80)})`;
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="h-screen bg-gray-900 text-white relative overflow-hidden flex flex-col">
      {/* Animated Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ zIndex: 1 }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                J.A.R.V.I.S
              </h1>
              <p className="text-xs text-gray-400">Just a Reality Versatile System</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              title={isSpeechEnabled ? 'Disable speech' : 'Enable speech'}
            >
              {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Activity className="w-3 h-3 text-green-400" />
              <span>Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        <div className="w-full flex gap-6 p-6">
          
          {/* Main Chat Interface */}
          <div className="flex-1 flex flex-col min-w-0 max-w-4xl">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      J.A.R.V.I.S Chat Interface
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Just a Reality Versatile System - Multi-Modal Interface
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ChatStatus isConnected={true} isProcessing={isProcessing} />
                    <ImageUpload 
                      onImageUpload={analyzeImage}
                      disabled={isProcessing}
                    />
                    <button
                      onClick={toggleListening}
                      disabled={isProcessing}
                      className={`p-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/25' 
                          : 'bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/25'
                      }`}
                      title={isListening ? 'Stop listening' : 'Start voice input'}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {(isListening || isProcessing) && (
                  <div className="flex items-center justify-center space-x-2 py-2">
                    <Waves className="w-4 h-4 text-cyan-400 animate-bounce" />
                    <span className="text-sm text-cyan-400 font-medium">
                      {isListening ? 'Listening for your command...' : 'Processing your request...'}
                    </span>
                  </div>
                )}
                
                <VoiceVisualizer isListening={isListening} isProcessing={isProcessing} />
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl text-sm whitespace-pre-wrap ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-100 border border-gray-600'
                      }`}
                    >
                      <div className="space-y-2">
                        {message.content.split('\n').map((line, lineIndex) => (
                          <div key={lineIndex} className={`${
                            line.startsWith('🔍') ? 'font-semibold text-cyan-300' :
                            line.startsWith('🤖') ? 'font-semibold text-blue-300' :
                            line.startsWith('⚠️') ? 'font-semibold text-yellow-300' :
                            line.startsWith('📸') ? 'font-semibold text-purple-300' :
                            ''
                          }`}>
                            {line}
                          </div>
                        ))}
                      </div>
                      {message.timestamp && (
                        <div className="text-xs opacity-70 mt-2 pt-2 border-t border-gray-600">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-100 px-3 py-2 rounded-xl text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span>JARVIS is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="p-6 border-t border-gray-700 flex-shrink-0">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask JARVIS anything... Try voice commands, image analysis, or smart home controls!"
                    disabled={isProcessing}
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isProcessing || !inputMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
                  >
                    <Send className="w-4 h-4" />
                    <span className="font-medium">Send</span>
                  </button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => setInputMessage("What can you see in this room?")}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs text-gray-300 hover:text-white transition-colors"
                  >
                    🔍 Room Analysis
                  </button>
                  <button
                    onClick={() => setInputMessage("Turn on smart home mode")}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs text-gray-300 hover:text-white transition-colors"
                  >
                    🏠 Smart Home
                  </button>
                  <button
                    onClick={() => setInputMessage("Show me your capabilities")}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs text-gray-300 hover:text-white transition-colors"
                  >
                    ⚡ Capabilities
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Tabbed Interface */}
          <div className="w-[32rem] flex-shrink-0 flex flex-col">
            {/* Tab Navigation */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-t-xl border border-gray-700 border-b-0">
              <div className="flex">
                {[
                  { id: 'controls', label: 'Controls', icon: '🎮' },
                  { id: 'vision', label: 'Vision', icon: '👁️' },
                  { id: 'system', label: 'System', icon: '💻' },
                  { id: 'about', label: 'About', icon: '👨‍💻' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gray-700 text-white border-b-2 border-cyan-400'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-b-xl border border-gray-700 border-t-0 flex-1 overflow-y-auto">
              <div className={`${activeTab === 'about' ? 'p-0' : 'p-6'} ${activeTab === 'about' ? '' : 'space-y-6'} max-h-[calc(100vh-200px)]`}>
                {activeTab === 'controls' && (
                  <>
                    {/* Voice Commands */}
                    <VoiceCommands
                      onCommand={handleVoiceCommand}
                      isListening={isVoiceCommandsActive}
                      onToggleListening={() => setIsVoiceCommandsActive(!isVoiceCommandsActive)}
                    />
                    
                    {/* Quick System Status */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <h3 className="text-base font-semibold mb-3 flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        <span>System Status</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Neural Networks</span>
                          <span className="font-medium text-green-400">Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Voice</span>
                          <span className="font-medium text-green-400">Ready</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Vision</span>
                          <span className="font-medium text-green-400">Online</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Uptime</span>
                          <span className="font-medium text-blue-400">{formatUptime(performanceMetrics.uptime)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'vision' && (
                  <>
                    {/* Object Detection */}
                    <WebcamDetection
                      isActive={isObjectDetectionActive}
                      onToggle={() => setIsObjectDetectionActive(!isObjectDetectionActive)}
                    />
                  </>
                )}

                {activeTab === 'system' && (
                  <>
                    {/* System Dashboard */}
                    <SystemDashboard 
                      systemStatus={systemStatus}
                      performanceMetrics={performanceMetrics}
                    />
                  </>
                )}

                {activeTab === 'about' && (
                  <>
                    {/* About Page */}
                    <AboutPage />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;