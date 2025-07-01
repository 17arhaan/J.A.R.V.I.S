import React from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';

interface ChatStatusProps {
  isConnected: boolean;
  isProcessing: boolean;
}

export const ChatStatus: React.FC<ChatStatusProps> = ({ isConnected, isProcessing }) => {
  return (
    <div className="flex items-center space-x-2 text-xs">
      {isConnected ? (
        <div className="flex items-center space-x-1 text-green-400">
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1 text-red-400">
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </div>
      )}
      
      {isProcessing && (
        <div className="flex items-center space-x-1 text-cyan-400">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}; 