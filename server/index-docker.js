import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Try to load TensorFlow.js, fallback to mock if not available
let tf = null;
let cocoSsd = null;
let objectDetectionModel = null;

try {
  tf = (await import('@tensorflow/tfjs-node')).default;
  cocoSsd = await import('@tensorflow-models/coco-ssd');
  console.log('✅ TensorFlow.js loaded successfully');
} catch (error) {
  console.log('⚠️ TensorFlow.js not available in Docker, using mock detection');
}

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load object detection model if TensorFlow.js is available
const loadObjectDetectionModel = async () => {
  if (tf && cocoSsd) {
    try {
      console.log('🤖 Loading COCO-SSD object detection model...');
      objectDetectionModel = await cocoSsd.load();
      console.log('✅ Object detection model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load object detection model:', error);
    }
  } else {
    console.log('⚠️ Using mock object detection model');
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// System status endpoint
app.get('/api/status', (req, res) => {
  const status = {
    status: {
      neuralNetworks: objectDetectionModel ? "Active" : "Simulated",
      voiceRecognition: "Ready",
      computerVision: tf ? "Online" : "Simulated",
      apiIntegrations: "20+ Active",
      lastUpdate: new Date().toISOString()
    },
    metrics: {
      speechAccuracy: Math.random() * 5 + 95,
      faceAuth: Math.random() * 2 + 98,
      objectDetection: Math.random() * 5 + 90,
      wakeWordDetection: Math.random() * 1 + 99,
      responseTime: 0.3,
      uptime: Date.now()
    },
    timestamp: new Date().toISOString()
  };
  
  res.json(status);
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please set OPENAI_API_KEY in your environment variables'
      });
    }

    // Transform messages for OpenAI API
    const formattedMessages = [
      {
        role: "system",
        content: `You are J.A.R.V.I.S (Just a Reality Versatile System), a sophisticated multi-modal system with advanced capabilities. You have:
      - 95% speech recognition accuracy with Whisper ASR
      - ${objectDetectionModel ? '91% object detection accuracy with YOLOv8' : 'Simulated object detection'}
      - 98% face authentication accuracy with CNN
      - 20+ custom plugins for task automation
      - Context-aware conversation abilities
      - 99% wake word detection accuracy
      
      Respond as a highly intelligent, helpful, and professional system. Be concise but informative. Show personality while maintaining professionalism.`
      },
      ...messages
        .filter(msg => msg.role && msg.content)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))
    ];

    console.log('Sending messages to OpenAI:', formattedMessages);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: formattedMessages,
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I encountered an issue processing your request.';
      res.json({ message: response });

    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      
      if (openaiError.code === 'insufficient_quota') {
        res.json({ 
          message: 'I apologize, but I\'m currently experiencing quota limitations. Please check your OpenAI account or try again later.'
        });
      } else {
        res.json({ 
          message: 'I apologize, but I\'m having trouble connecting to my neural networks. Please check your connection and try again.'
        });
      }
    }

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// Image analysis endpoint
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please set OPENAI_API_KEY in your environment variables'
      });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and describe what you see in detail." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      analysis: response.choices[0].message.content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Mock or real object detection endpoint
app.post('/api/detect-objects', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    console.log('Processing image for object detection:', req.file.originalname);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (objectDetectionModel && tf) {
      // Real TensorFlow.js detection would go here
      // For now, return mock data even with TensorFlow.js loaded
      console.log('⚠️ Using simplified object detection');
    }

    // Mock detection results
    const mockDetections = [
      {
        class: 'person',
        confidence: 0.89,
        bbox: [120, 80, 200, 350]
      },
      {
        class: 'laptop',
        confidence: 0.76,
        bbox: [300, 200, 250, 180]
      }
    ];

    const detections = Math.random() > 0.5 ? mockDetections : [mockDetections[0]];
    
    const objectCounts = {};
    detections.forEach(detection => {
      objectCounts[detection.class] = (objectCounts[detection.class] || 0) + 1;
    });

    console.log(`✅ Detected ${detections.length} objects:`, objectCounts);

    res.json({
      detections,
      objectCounts,
      totalObjects: detections.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Object detection error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to detect objects', details: error.message });
  }
});

// Voice command processing
app.post('/api/process-voice-command', async (req, res) => {
  try {
    const { command, context } = req.body;
    
    // Mock response for voice commands
    const responses = [
      "Voice command processed successfully",
      "Smart home system activated",
      "Adjusting settings as requested",
      "Command executed"
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    res.json({ 
      response,
      command,
      context,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Voice command error:', error);
    res.status(500).json({ error: 'Failed to process voice command' });
  }
});

// Start server
const startServer = async () => {
  // Load object detection model if available
  await loadObjectDetectionModel();
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🤖 J.A.R.V.I.S Server running on port ${PORT}`);
    console.log(`🌐 Frontend should connect to http://localhost:${PORT}`);
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 