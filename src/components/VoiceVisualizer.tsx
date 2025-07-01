import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
  isProcessing: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening, isProcessing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = 200;
    const height = canvas.height = 60;

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      if (isListening || isProcessing) {
        const bars = 20;
        const barWidth = width / bars;
        
        for (let i = 0; i < bars; i++) {
          const barHeight = isListening 
            ? Math.sin(time * 0.1 + i * 0.5) * 20 + 25
            : Math.sin(time * 0.05 + i * 0.3) * 10 + 15;
          
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, isListening ? '#00d9ff' : '#8b5cf6');
          gradient.addColorStop(1, isListening ? '#0ea5e9' : '#3b82f6');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(
            i * barWidth + barWidth * 0.2, 
            height - barHeight, 
            barWidth * 0.6, 
            barHeight
          );
        }
        
        time += 1;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, isProcessing]);

  if (!isListening && !isProcessing) return null;

  return (
    <div className="flex items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        className="rounded-lg bg-gray-800/50"
        width={200}
        height={60}
      />
    </div>
  );
};