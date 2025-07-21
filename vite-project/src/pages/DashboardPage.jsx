import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(8);
  const [brushColor, setBrushColor] = useState('#ef4444');
  const [isToolboxOpen, setIsToolboxOpen] = useState(true);
  const [isAIVisible, setIsAIVisible] = useState(true);
  
  // AI and API state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  
  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  
  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  
  // Speaking mode state
  const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState(false);
  
  // AI Agent state
  const [aiPosition, setAiPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [inputMessage, setInputMessage] = useState('');

  // Color palette
  const colors = [
    '#ef4444', '#06b6d4', '#0ea5e9', '#10b981', '#fbbf24', '#a855f7',
    '#10b981', '#eab308', '#8b5cf6', '#3b82f6', '#f97316', '#22c55e',
    '#f87171', '#60a5fa', '#c084fc', '#6ee7b7', '#fde047', '#d8b4fe',
    '#7dd3fc', '#86efac', '#fde68a', '#ddd6fe', '#60a5fa', '#7dd3fc'
  ];

  // Drawing templates
  const templates = {
    'Basic Shapes': [
      { name: 'Circle', path: 'circle' },
      { name: 'Square', path: 'square' },
      { name: 'Triangle', path: 'triangle' },
      { name: 'Star', path: 'star' }
    ],
    'Objects': [
      { name: 'House', path: 'house' },
      { name: 'Tree', path: 'tree' },
      { name: 'Car', path: 'car' },
      { name: 'Flower', path: 'flower' }
    ],
    'Faces': [
      { name: 'Happy Face', path: 'happy_face' },
      { name: 'Sad Face', path: 'sad_face' },
      { name: 'Cat Face', path: 'cat_face' },
      { name: 'Dog Face', path: 'dog_face' }
    ]
  };

  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('Basic Shapes');

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  // Auto-speak persistence effect
  useEffect(() => {
    const saved = localStorage.getItem('autoSpeakEnabled');
    if (saved !== null) {
      setIsAutoSpeakEnabled(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('autoSpeakEnabled', JSON.stringify(isAutoSpeakEnabled));
  }, [isAutoSpeakEnabled]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const ctx = canvas.getContext('2d');
      // Keep canvas background white in both modes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []); // Canvas background stays white regardless of dark mode

  // Drawing functions
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : brushColor;
    ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Auto-analyze drawing after user stops drawing
    setTimeout(() => {
      analyzeDrawing();
    }, 1000);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setCurrentDrawing(null);
    setConversationHistory([]);
  };

  // Template drawing functions
  const drawTemplate = (templatePath) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Add slight randomization to prevent overlapping
    const centerX = canvas.width / 2 + (Math.random() - 0.5) * 100;
    const centerY = canvas.height / 2 + (Math.random() - 0.5) * 100;
    const size = 100; // Base size for templates
    
    ctx.strokeStyle = brushColor;
    ctx.fillStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    switch (templatePath) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2, 0, 2 * Math.PI);
        ctx.stroke();
        break;
        
      case 'square':
        ctx.beginPath();
        ctx.rect(centerX - size / 2, centerY - size / 2, size, size);
        ctx.stroke();
        break;
        
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size / 2);
        ctx.lineTo(centerX - size / 2, centerY + size / 2);
        ctx.lineTo(centerX + size / 2, centerY + size / 2);
        ctx.closePath();
        ctx.stroke();
        break;
        
      case 'star':
        drawStar(ctx, centerX, centerY, 5, size / 2, size / 4);
        break;
        
      case 'house':
        drawHouse(ctx, centerX, centerY, size);
        break;
        
      case 'tree':
        drawTree(ctx, centerX, centerY, size);
        break;
        
      case 'car':
        drawCar(ctx, centerX, centerY, size);
        break;
        
      case 'flower':
        drawFlower(ctx, centerX, centerY, size);
        break;
        
      case 'happy_face':
        drawHappyFace(ctx, centerX, centerY, size);
        break;
        
      case 'sad_face':
        drawSadFace(ctx, centerX, centerY, size);
        break;
        
      case 'cat_face':
        drawCatFace(ctx, centerX, centerY, size);
        break;
        
      case 'dog_face':
        drawDogFace(ctx, centerX, centerY, size);
        break;
    }
    
    // Auto-analyze drawing after template is added
    setTimeout(() => {
      analyzeDrawing();
    }, 500);
  };

  // Helper functions for complex templates
  const drawStar = (ctx, x, y, points, outerRadius, innerRadius) => {
    const angle = Math.PI / points;
    ctx.beginPath();
    for (let i = 0; i < 2 * points; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const theta = i * angle - Math.PI / 2;
      const px = x + radius * Math.cos(theta);
      const py = y + radius * Math.sin(theta);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  };

  const drawHouse = (ctx, x, y, size) => {
    // House base
    ctx.beginPath();
    ctx.rect(x - size / 2, y, size, size * 0.6);
    ctx.stroke();
    
    // Roof
    ctx.beginPath();
    ctx.moveTo(x - size / 2, y);
    ctx.lineTo(x, y - size / 3);
    ctx.lineTo(x + size / 2, y);
    ctx.stroke();
    
    // Door
    ctx.beginPath();
    ctx.rect(x - size / 8, y + size * 0.2, size / 4, size * 0.4);
    ctx.stroke();
    
    // Window
    ctx.beginPath();
    ctx.rect(x + size / 8, y + size * 0.1, size / 4, size / 4);
    ctx.stroke();
  };

  const drawTree = (ctx, x, y, size) => {
    // Trunk
    ctx.beginPath();
    ctx.rect(x - size / 8, y + size / 4, size / 4, size / 2);
    ctx.stroke();
    
    // Leaves (circle)
    ctx.beginPath();
    ctx.arc(x, y, size / 3, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const drawCar = (ctx, x, y, size) => {
    // Car body
    ctx.beginPath();
    ctx.rect(x - size / 2, y - size / 4, size, size / 2);
    ctx.stroke();
    
    // Car top
    ctx.beginPath();
    ctx.rect(x - size / 4, y - size / 2, size / 2, size / 4);
    ctx.stroke();
    
    // Wheels
    ctx.beginPath();
    ctx.arc(x - size / 4, y + size / 4, size / 8, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + size / 4, y + size / 4, size / 8, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const drawFlower = (ctx, x, y, size) => {
    // Center
    ctx.beginPath();
    ctx.arc(x, y, size / 8, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Petals
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const petalX = x + (size / 3) * Math.cos(angle);
      const petalY = y + (size / 3) * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(petalX, petalY, size / 6, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Stem
    ctx.beginPath();
    ctx.moveTo(x, y + size / 8);
    ctx.lineTo(x, y + size / 2);
    ctx.stroke();
  };

  const drawHappyFace = (ctx, x, y, size) => {
    // Face
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Eyes
    ctx.beginPath();
    ctx.arc(x - size / 6, y - size / 8, size / 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size / 6, y - size / 8, size / 20, 0, 2 * Math.PI);
    ctx.fill();
    
    // Smile
    ctx.beginPath();
    ctx.arc(x, y, size / 4, 0, Math.PI);
    ctx.stroke();
  };

  const drawSadFace = (ctx, x, y, size) => {
    // Face
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Eyes
    ctx.beginPath();
    ctx.arc(x - size / 6, y - size / 8, size / 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size / 6, y - size / 8, size / 20, 0, 2 * Math.PI);
    ctx.fill();
    
    // Frown
    ctx.beginPath();
    ctx.arc(x, y + size / 3, size / 4, Math.PI, 0);
    ctx.stroke();
  };

  const drawCatFace = (ctx, x, y, size) => {
    // Face
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Ears
    ctx.beginPath();
    ctx.moveTo(x - size / 3, y - size / 3);
    ctx.lineTo(x - size / 6, y - size / 2);
    ctx.lineTo(x - size / 8, y - size / 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + size / 3, y - size / 3);
    ctx.lineTo(x + size / 6, y - size / 2);
    ctx.lineTo(x + size / 8, y - size / 4);
    ctx.stroke();
    
    // Eyes
    ctx.beginPath();
    ctx.arc(x - size / 6, y - size / 8, size / 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size / 6, y - size / 8, size / 20, 0, 2 * Math.PI);
    ctx.fill();
    
    // Nose
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size / 20, y + size / 20);
    ctx.lineTo(x + size / 20, y + size / 20);
    ctx.closePath();
    ctx.fill();
    
    // Whiskers
    ctx.beginPath();
    ctx.moveTo(x - size / 3, y);
    ctx.lineTo(x - size / 8, y);
    ctx.moveTo(x + size / 8, y);
    ctx.lineTo(x + size / 3, y);
    ctx.stroke();
  };

  const drawDogFace = (ctx, x, y, size) => {
    // Face
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Ears
    ctx.beginPath();
    ctx.arc(x - size / 3, y - size / 4, size / 6, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + size / 3, y - size / 4, size / 6, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Eyes
    ctx.beginPath();
    ctx.arc(x - size / 6, y - size / 8, size / 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size / 6, y - size / 8, size / 20, 0, 2 * Math.PI);
    ctx.fill();
    
    // Nose
    ctx.beginPath();
    ctx.arc(x, y + size / 12, size / 20, 0, 2 * Math.PI);
    ctx.fill();
    
    // Mouth
    ctx.beginPath();
    ctx.arc(x, y + size / 6, size / 8, 0, Math.PI);
    ctx.stroke();
    
    // Tongue
    ctx.beginPath();
    ctx.arc(x, y + size / 4, size / 12, 0, Math.PI);
    ctx.fill();
  };

  // Get template icon for preview
  const getTemplateIcon = (templatePath) => {
    const iconMap = {
      // Basic Shapes
      'circle': '⭕',
      'square': '⬜',
      'triangle': '🔺',
      'star': '⭐',
      
      // Objects
      'house': '🏠',
      'tree': '🌳',
      'car': '🚗',
      'flower': '🌸',
      
      // Faces
      'happy_face': '😊',
      'sad_face': '😢',
      'cat_face': '🐱',
      'dog_face': '🐶'
    };
    
    return iconMap[templatePath] || '❓';
  };

  // 🎨 DRAWING ANALYSIS API
  const analyzeDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isAnalyzing) return;

    setIsAnalyzing(true);
    
    try {
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'drawing.png');
        formData.append('conversation_history', JSON.stringify(conversationHistory));

        const response = await fetch('http://localhost:8000/api/analyze-drawing-with-context', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        if (result.success) {
          const aiMessage = {
            type: 'ai',
            text: result.analysis,
            timestamp: new Date()
          };
          
          setConversationHistory(prev => [...prev, aiMessage]);
          
          // Auto-speak the response if enabled
          if (isAutoSpeakEnabled) {
            speakText(result.analysis);
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error analyzing drawing:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 🎤 VOICE INPUT API
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.wav');
      formData.append('language', 'auto');

      const response = await fetch('http://localhost:8000/api/voice-to-text', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && result.transcription) {
        const userMessage = {
          type: 'user',
          text: result.transcription,
          timestamp: new Date()
        };
        
        setConversationHistory(prev => [...prev, userMessage]);
        
        // Send to AI for response
        await handleTextInput(result.transcription);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else if (!isProcessing) {
      startVoiceRecording();
    }
  };

  // 💬 TEXT CHAT API
  const handleTextInput = async (message) => {
    if (!message.trim()) return;

    try {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('conversation_history', JSON.stringify(conversationHistory));

      const response = await fetch('http://localhost:8000/api/text-chat', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        const aiMessage = {
          type: 'ai',
          text: result.analysis,
          timestamp: new Date()
        };
        
        setConversationHistory(prev => [...prev, aiMessage]);
        
        // Auto-speak the response if enabled
        if (isAutoSpeakEnabled) {
          speakText(result.analysis);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // 🔊 TEXT-TO-SPEECH API
  const speakText = async (text) => {
    if (isSpeaking || !text) return;

    setIsSpeaking(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice_id: "21m00Tcm4TlvDq8ikWAM",
          model_id: "eleven_monolingual_v1"
        }),
      });

      if (!response.ok) throw new Error('TTS failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
    }
  };

  // AI Agent drag functions
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setAiPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    const message = inputMessage;
    setInputMessage('');
    
    await handleTextInput(message);
  };

  return (
    <div className="dashboard" data-page="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <span className="username">
              {user?.user_metadata?.username || 'Creator'}
            </span>
          </div>
          <div className="header-actions">
            <button 
              className="action-btn dark-mode-btn"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? 'Light' : 'Dark'}
            </button>
            <button 
              className={`action-btn voice-btn ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
              onClick={handleVoiceClick}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : isRecording ? 'Recording...' : 'Voice'}
            </button>
            <button className="action-btn clear-btn" onClick={clearCanvas}>
              Clear
            </button>
            <button 
              className={`action-btn ai-btn ${isAIVisible ? 'active' : ''}`}
              onClick={() => setIsAIVisible(!isAIVisible)}
            >
              {isAIVisible ? 'Hide AI' : 'Show AI'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Toolbox */}
        <div className={`toolbox ${isToolboxOpen ? 'open' : 'closed'}`}>
          <button 
            className="toolbox-toggle"
            onClick={() => setIsToolboxOpen(!isToolboxOpen)}
          >
            <span className="hamburger">☰</span>
          </button>
          
          {isToolboxOpen && (
            <div className="toolbox-content">
              {/* Magic Tools */}
              <div className="tool-section">
                <div className="section-header">
                  <span className="section-icon">✨</span>
                  <h3>Magic Tools</h3>
                </div>
                <div className="tool-buttons">
                  <button 
                    className={`tool-btn ${currentTool === 'pen' ? 'active' : ''}`}
                    onClick={() => setCurrentTool('pen')}
                  >
                    Pen
                  </button>
                  <button 
                    className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
                    onClick={() => setCurrentTool('eraser')}
                  >
                    Eraser
                  </button>
                </div>
              </div>

              {/* Color Palette */}
              <div className="tool-section">
                <div className="section-header">
                  <h3>Color Palette</h3>
                  <button className="inspire-btn">⚡ Inspire</button>
                </div>
                <div className="color-grid">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      className={`color-btn ${brushColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setBrushColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Drawing Templates */}
                             <div className="tool-section">
                 <div className="section-header">
                   <h3>Drawing Templates</h3>
                   <button className="inspire-btn">✨ Quick Start</button>
                 </div>
                <div className="template-categories">
                  {Object.keys(templates).map((category, index) => (
                    <button
                      key={index}
                      className={`template-category-btn ${selectedTemplateCategory === category ? 'active' : ''}`}
                      onClick={() => setSelectedTemplateCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="template-grid">
                  {templates[selectedTemplateCategory].map((template, index) => (
                                         <button
                       key={index}
                       className="template-btn"
                       onClick={() => {
                         drawTemplate(template.path);
                         const userMessage = {
                           type: 'user',
                           text: `Added template: ${template.name}`,
                           timestamp: new Date()
                         };
                         setConversationHistory(prev => [...prev, userMessage]);
                       }}
                       title={`Add ${template.name} to canvas`}
                     >
                       <span className="template-preview">
                         {getTemplateIcon(template.path)}
                       </span>
                       <span className="template-name">{template.name}</span>
                     </button>
                  ))}
                </div>
              </div>

              {/* Brush Magic */}
              <div className="tool-section">
                <h3>Brush Magic</h3>
                <div className="brush-controls">
                  <div className="size-control">
                    <button 
                      className="size-btn"
                      onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
                    >
                      −
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="size-slider"
                    />
                    <button 
                      className="size-btn"
                      onClick={() => setBrushSize(Math.min(50, brushSize + 1))}
                    >
                      +
                    </button>
                  </div>
                  <div className="size-display">{brushSize}px</div>
                  <div className="brush-preview">
                    <div 
                      className="brush-dot"
                      style={{ 
                        width: `${Math.max(8, brushSize)}px`, 
                        height: `${Math.max(8, brushSize)}px`,
                        backgroundColor: brushColor 
                      }}
                    />
                  </div>
                </div>
              </div>


            </div>
          )}
        </div>

        {/* Drawing Canvas */}
        <div className="canvas-container">
          <div className="canvas-status">
            <span className="status-icon">
              {isAnalyzing ? '🤔' : isSpeaking ? '🔊' : '✨'}
            </span>
            {isAnalyzing ? 'AI analyzing...' : isSpeaking ? 'AI speaking...' : `Creating • ${brushSize}px`}
          </div>
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* AI Agent */}
        {isAIVisible && (
          <div 
            className={`ai-agent ${isDragging ? 'dragging' : ''}`}
            style={{ 
              left: `${aiPosition.x}px`, 
              top: `${aiPosition.y}px` 
            }}
          >
            <div className="ai-header" onMouseDown={handleMouseDown}>
              <div className="ai-title">
                <span className="ai-icon">🤖</span>
                AI Assistant
                {isAutoSpeakEnabled && <span className="auto-speak-indicator">🎵</span>}
                {isSpeaking && <span className="speaking-indicator">🔊</span>}
              </div>
              <div className="ai-header-actions">
                <button 
                  className="ai-analyze-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    analyzeDrawing();
                  }}
                  disabled={isAnalyzing}
                  title="Analyze current drawing"
                >
                  {isAnalyzing ? '⏳' : 'Analyze'}
                </button>
                <button 
                  className={`ai-speak-toggle ${isAutoSpeakEnabled ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAutoSpeakEnabled(!isAutoSpeakEnabled);
                  }}
                  title={isAutoSpeakEnabled ? 'Disable auto-speaking' : 'Enable auto-speaking'}
                >
                  {isAutoSpeakEnabled ? '🔊' : '🔇'}
                </button>
                <button 
                  className="ai-close"
                  onClick={() => setIsAIVisible(false)}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="ai-messages">
              {conversationHistory.length === 0 && (
                <div className="message ai">
                  <div className="message-content">
                    Hello! I'm your AI assistant. Start drawing and I'll analyze your artwork, or ask me anything!
                  </div>
                </div>
              )}
              {conversationHistory.map((message, index) => (
                <div key={index} className={`message ${message.type}`}>
                  <div className="message-content">
                    {message.text}
                  </div>
                </div>
              ))}
              {isAnalyzing && (
                <div className="message ai">
                  <div className="message-content thinking">
                    🤔 Analyzing your drawing...
                  </div>
                </div>
              )}
            </div>
            
            <div className="ai-input">
              <input
                type="text"
                placeholder="Ask AI about your drawing..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="message-input"
              />
              <button 
                className="send-btn"
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage; 