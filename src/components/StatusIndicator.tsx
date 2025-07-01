import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Loader } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'warning';
  message: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  message, 
  className = '' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader className="w-4 h-4 animate-spin" />,
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-400',
          textColor: 'text-blue-400'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-400',
          textColor: 'text-green-400'
        };
      case 'error':
        return {
          icon: <XCircle className="w-4 h-4" />,
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-400',
          textColor: 'text-red-400'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-400'
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-400',
          textColor: 'text-gray-400'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className={config.textColor}>
        {config.icon}
      </div>
      <span className={`text-sm ${config.textColor}`}>
        {message}
      </span>
    </div>
  );
}; 