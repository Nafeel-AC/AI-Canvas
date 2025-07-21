import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import './Canvas.css';

const Canvas = forwardRef(({ onDrawingUpdate, className }, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#2563eb');
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Reset to white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      onDrawingUpdate?.(null);
    },
    getImageData: () => {
      return canvasRef.current.toDataURL('image/png');
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set drawing properties
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
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
    setLastPos(pos);
    
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
    
    // Draw smooth line
    ctx.quadraticCurveTo(lastPos.x, lastPos.y, (pos.x + lastPos.x) / 2, (pos.y + lastPos.y) / 2);
    ctx.stroke();
    
    setLastPos(pos);
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    setIsDrawing(false);
    
    // Notify parent component about drawing update
    setTimeout(() => {
      const imageData = canvasRef.current.toDataURL('image/png');
      onDrawingUpdate?.(imageData);
    }, 100);
  };

  const handleToolChange = (tool) => {
    setCurrentTool(tool);
  };

  const colors = [
    '#2563eb', '#dc2626', '#16a34a', '#ca8a04', 
    '#9333ea', '#c2410c', '#0891b2', '#be123c',
    '#374151', '#000000'
  ];

  return (
    <div className={`canvas-container ${className}`}>
      {/* Drawing Tools */}
      <div className="canvas-toolbar">
        <div className="tool-section">
          <span className="tool-section-title">Tools</span>
          <div className="tool-buttons">
            <button 
              className={`tool-btn ${currentTool === 'pen' ? 'active' : ''}`}
              onClick={() => handleToolChange('pen')}
              title="Pen Tool"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 19l7-7 3 3-7 7-3-3z" stroke="currentColor" strokeWidth="2"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button 
              className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
              onClick={() => handleToolChange('eraser')}
              title="Eraser Tool"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 20H8l-4-4 9.17-9.17a2 2 0 012.83 0l2.83 2.83a2 2 0 010 2.83L12 20z" 
                      stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="tool-section">
          <span className="tool-section-title">Size</span>
          <div className="size-control">
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="size-slider"
            />
            <span className="size-display">{brushSize}px</span>
          </div>
        </div>

        <div className="tool-section">
          <span className="tool-section-title">Colors</span>
          <div className="color-palette">
            {colors.map((color) => (
              <button
                key={color}
                className={`color-btn ${brushColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setBrushColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
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
        style={{ touchAction: 'none' }} // Prevent scrolling on touch
      />

      {/* Canvas Info */}
      <div className="canvas-footer">
        <div className="canvas-stats">
          <span>Tool: <strong>{currentTool === 'pen' ? 'Pen' : 'Eraser'}</strong></span>
          <span>Size: <strong>{brushSize}px</strong></span>
          {currentTool === 'pen' && (
            <span>Color: <strong style={{ color: brushColor }}>{brushColor}</strong></span>
          )}
        </div>
        <div className="canvas-hint">
          💡 Draw naturally - AI will automatically analyze your artwork!
        </div>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas; 