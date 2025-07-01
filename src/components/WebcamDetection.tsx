import React, { useRef, useEffect, useState } from 'react';
import { Camera, Square, Eye, Target } from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';

interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
}

interface WebcamDetectionProps {
  isActive: boolean;
  onToggle: () => void;
}

export const WebcamDetection: React.FC<WebcamDetectionProps> = ({ isActive, onToggle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [objectCounts, setObjectCounts] = useState<Record<string, number>>({});
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [lastDetectionTime, setLastDetectionTime] = useState<Date | null>(null);

  useEffect(() => {
    if (isActive) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => stopWebcam();
  }, [isActive]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 30 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsStreaming(true);
          // Start first detection after video is stable (only if auto mode is on)
          if (isActive) {
            setTimeout(detectObjects, 3000);
          }
        };
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setDetectionStatus('error');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setDetections([]);
    }
  };

  const detectObjects = async () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions for better performance
    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;
    canvas.width = Math.min(videoWidth, 640);
    canvas.height = Math.min(videoHeight, 480);
    
    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Convert canvas to blob and send to backend
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        console.log('Sending frame for detection...');
        const formData = new FormData();
        formData.append('image', blob, 'webcam-frame.jpg');

        try {
          setDetectionStatus('processing');
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch('http://localhost:3001/api/detect-objects', {
            method: 'POST',
            body: formData,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Detection success:', result.totalObjects, 'objects found');
            setDetections(result.detections || []);
            setObjectCounts(result.objectCounts || {});
            setDetectionStatus('success');
            setLastDetectionTime(new Date());
          } else {
            console.error('❌ Detection API error:', response.status);
            setDetectionStatus('error');
          }
                  } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              console.log('⏱️ Detection request timed out');
            } else {
              console.error('❌ Detection request failed:', error);
            }
            setDetectionStatus('error');
          }
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error('Detection error:', error);
    }

    // Continue detection loop - much slower to prevent lag
    if (isActive && detectionStatus !== 'processing') {
      setTimeout(detectObjects, 5000); // Every 5 seconds for smooth video
    }
  };

  const drawDetections = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding boxes
    detections.forEach((detection) => {
      const [x, y, width, height] = detection.bbox;
      
      // Draw bounding box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label background
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      const label = `${detection.class} ${(detection.confidence * 100).toFixed(1)}%`;
      const textMetrics = ctx.measureText(label);
      ctx.fillRect(x, y - 25, textMetrics.width + 10, 20);
      
      // Draw label text
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.fillText(label, x + 5, y - 8);
    });
  };

  useEffect(() => {
    drawDetections();
  }, [detections]);

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Eye className="w-5 h-5 text-cyan-400" />
          <span>YOLOv8 Object Detection</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => detectObjects()}
            disabled={detectionStatus === 'processing' || !isStreaming}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {detectionStatus === 'processing' ? 'Processing...' : 'Detect Now'}
          </button>
          <button
            onClick={onToggle}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            }`}
          >
            {isActive ? 'Stop Auto' : 'Start Auto'}
          </button>
        </div>
      </div>

      {isActive && (
        <div className="space-y-3">
          {/* Video Feed */}
          <div className="relative bg-black rounded-lg overflow-hidden">
                         <video
               ref={videoRef}
               autoPlay
               muted
               playsInline
               className="w-full h-64 object-cover rounded-lg"
               style={{ imageRendering: 'auto' }}
               onLoadedMetadata={() => {
                 if (videoRef.current) {
                   const canvas = canvasRef.current;
                   if (canvas) {
                     canvas.width = Math.min(videoRef.current.videoWidth || 640, 640);
                     canvas.height = Math.min(videoRef.current.videoHeight || 480, 480);
                   }
                 }
               }}
             />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ mixBlendMode: 'normal' }}
            />
            
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}
            
            {detectionStatus === 'processing' && (
              <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
                  🔍 Analyzing frame...
                </div>
              </div>
            )}
          </div>

          {/* Detection Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Objects Detected</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{detections.length}</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Square className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Unique Classes</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{Object.keys(objectCounts).length}</p>
            </div>
          </div>

                     {/* Detection Status */}
           <StatusIndicator
             status={
               detectionStatus === 'processing' ? 'loading' :
               detectionStatus === 'success' ? 'success' :
               detectionStatus === 'error' ? 'error' : 'warning'
             }
             message={
               detectionStatus === 'processing' ? 'Processing frame...' :
               detectionStatus === 'success' ? `Last detection: ${lastDetectionTime?.toLocaleTimeString()}` :
               detectionStatus === 'error' ? 'Detection failed' :
               'Ready to detect'
             }
           />

           {/* Object Counts */}
           {Object.keys(objectCounts).length > 0 && (
             <div className="bg-gray-700 rounded-lg p-3">
               <h4 className="text-sm font-medium mb-2 text-gray-300">Detected Objects:</h4>
               <div className="grid grid-cols-2 gap-2 text-xs">
                 {Object.entries(objectCounts).map(([className, count]) => (
                   <div key={className} className="flex justify-between">
                     <span className="text-gray-400 capitalize">{className}:</span>
                     <span className="text-cyan-400 font-medium">{count}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}; 