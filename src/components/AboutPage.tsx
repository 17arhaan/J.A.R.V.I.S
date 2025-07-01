import React from 'react';
import { User, Globe, Code, Brain, Zap, ExternalLink } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            About the Creator
          </h1>
        </div>
        <p className="text-sm text-gray-300">
          Meet Arhaan - the innovative mind behind J.A.R.V.I.S
        </p>
      </div>

      {/* Creator Info */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <User className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Arhaan</h2>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-300 leading-relaxed">
            A passionate technology innovator who created J.A.R.V.I.S (Just a Reality Versatile System). 
            Combining cutting-edge technologies like computer vision, natural language processing, and real-time 
            voice recognition to build versatile reality-based computing solutions.
          </p>
          
          <div className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors">
            <Globe className="w-4 h-4" />
            <a 
              href="https://www.arhaanportfolio.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:underline text-sm"
            >
              <span>www.arhaanportfolio.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* JARVIS Features */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">J.A.R.V.I.S Capabilities</h2>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-300">Advanced Speech Recognition</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span className="text-sm text-gray-300">Object Detection & Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            <span className="text-sm text-gray-300">Real-time Computer Vision</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
            <span className="text-sm text-gray-300">Natural Language Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
            <span className="text-sm text-gray-300">Voice Command Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-gray-300">Smart Home Controls</span>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Code className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-bold text-white">Technology Stack</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 mb-2">Frontend</h3>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
              <div>• React + TypeScript</div>
              <div>• Tailwind CSS</div>
              <div>• Vite Build Tool</div>
              <div>• Lucide Icons</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-blue-400 mb-2">Backend</h3>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
              <div>• Node.js + Express</div>
              <div>• Socket.IO</div>
              <div>• TensorFlow.js</div>
              <div>• OpenAI API</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-purple-400 mb-2">ML/Vision</h3>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
              <div>• COCO-SSD Model</div>
              <div>• Web Speech API</div>
              <div>• Computer Vision</div>
              <div>• NLP Processing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">
          Built with ❤️ by Arhaan • Powered by Innovation
        </p>
        <p className="text-xs text-gray-500 mt-1">
          "Just a Reality Versatile System - bridging digital and reality"
        </p>
      </div>
    </div>
  );
}; 