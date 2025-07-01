import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Cpu, 
  Zap, 
  Camera, 
  Monitor,
  Wifi,
  Battery,
  Thermometer
} from 'lucide-react';

interface SystemDashboardProps {
  systemStatus: any;
  performanceMetrics: any;
}

export const SystemDashboard: React.FC<SystemDashboardProps> = () => {
  const [neuralActivity, setNeuralActivity] = useState<number[]>([]);
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(62);
  const [networkActivity, setNetworkActivity] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate neural network activity
  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralActivity(prev => {
        const newActivity = [...prev];
        newActivity.push(Math.random() * 100);
        if (newActivity.length > 50) {
          newActivity.shift();
        }
        return newActivity;
      });

      // Simulate system metrics
      setCpuUsage(prev => Math.max(20, Math.min(90, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.max(30, Math.min(85, prev + (Math.random() - 0.5) * 8)));
      setNetworkActivity(Math.random() * 100);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Draw neural network visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw neural activity graph
    if (neuralActivity.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#00d9ff';
      ctx.lineWidth = 2;

      const stepX = canvas.width / (neuralActivity.length - 1);
      
      neuralActivity.forEach((activity, index) => {
        const x = index * stepX;
        const y = canvas.height - (activity / 100) * canvas.height;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();

      // Add glow effect
      ctx.shadowColor = '#00d9ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [neuralActivity]);

  const captureScreen = async () => {
    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { width: 1920, height: 1080 } 
      });
      
      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        // Convert to blob and analyze
        canvas.toBlob(async (blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append('image', blob, 'screen-capture.jpg');
            
            const response = await fetch('/api/analyze-image', {
              method: 'POST',
              body: formData
            });
            
            if (response.ok) {
              const result = await response.json();
              console.log('Screen analysis:', result.analysis);
            }
          }
        });
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
      });
      
    } catch (error) {
      console.error('Screen capture failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Neural Network Activity */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <span>Neural Network Activity</span>
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Active</span>
          </div>
        </div>
        
        <div className="relative h-24 bg-gray-900 rounded-lg overflow-hidden">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
            style={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}
          />
          <div className="absolute top-2 left-3 text-xs text-cyan-400">
            Processing: {neuralActivity[neuralActivity.length - 1]?.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* System Resources */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <span>System Resources</span>
        </h3>
        
        <div className="space-y-3">
          {/* CPU Usage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">CPU Usage</span>
              <span className="text-sm font-medium text-purple-400">{cpuUsage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${cpuUsage}%` }}
              ></div>
            </div>
          </div>

          {/* Memory Usage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">Memory Usage</span>
              <span className="text-sm font-medium text-blue-400">{memoryUsage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${memoryUsage}%` }}
              ></div>
            </div>
          </div>

          {/* Network Activity */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">Network Activity</span>
              <span className="text-sm font-medium text-green-400">{networkActivity.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${networkActivity}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Capabilities Status */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span>AI Capabilities</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">Speech Recognition</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">Computer Vision</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">Natural Language</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">Object Detection</span>
          </div>
        </div>
      </div>

      {/* Advanced Tools */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-orange-400" />
          <span>Advanced Tools</span>
        </h3>
        
        <div className="space-y-2">
          <button
            onClick={captureScreen}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>Capture & Analyze Screen</span>
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-700 rounded-lg p-2 text-center">
              <Wifi className="w-4 h-4 mx-auto mb-1 text-blue-400" />
              <div className="text-xs text-gray-400">Network</div>
              <div className="text-xs font-medium text-blue-400">Online</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-2 text-center">
              <Battery className="w-4 h-4 mx-auto mb-1 text-green-400" />
              <div className="text-xs text-gray-400">Power</div>
              <div className="text-xs font-medium text-green-400">Optimal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Sensors */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
          <Thermometer className="w-5 h-5 text-red-400" />
          <span>Environmental</span>
        </h3>
        
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="text-center">
            <div className="text-gray-400">Temperature</div>
            <div className="text-lg font-bold text-red-400">23°C</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Humidity</div>
            <div className="text-lg font-bold text-blue-400">45%</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Light</div>
            <div className="text-lg font-bold text-yellow-400">750lx</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 