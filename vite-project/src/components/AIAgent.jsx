import React, { useState, useRef, useEffect } from 'react';
import VoiceSynthesis from './VoiceSynthesis';
import { clsx } from 'clsx';

const AIAgent = ({ response, isAnalyzing, conversationHistory, onClose, onTextInput }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isTextSending, setIsTextSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(() => {
    // Smart initial positioning
    const initialX = Math.max(20, window.innerWidth - 420);
    const initialY = 20;
    return { x: initialX, y: initialY };
  });
  const chatContainerRef = useRef(null);
  const agentRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationHistory, response]);

  // Dragging functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('[data-agent-controls]')) return; // Don't drag when clicking controls
    setIsDragging(true);
    const rect = agentRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none'; // Prevent text selection during drag
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds with some padding
    const maxX = window.innerWidth - 420;
    const maxY = window.innerHeight - 150;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = ''; // Restore text selection
  };

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      const maxX = window.innerWidth - 400;
      const maxY = window.innerHeight - 100;
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY))
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

     const formatTimestamp = (timestamp) => {
     return new Date(timestamp).toLocaleTimeString('en-US', {
       hour: '2-digit',
       minute: '2-digit'
     });
   };

   const handleTextSubmit = async (e) => {
     e.preventDefault();
     
     if (!textInput.trim() || isTextSending) {
       return;
     }

     const message = textInput.trim();
     console.log('🤖 AIAgent sending:', message);
     setTextInput('');
     setIsTextSending(true);

     try {
       // Call the parent component's text input handler
       await onTextInput?.(message);
     } catch (error) {
       console.error('❌ Error sending text message:', error);
     } finally {
       setIsTextSending(false);
     }
   };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'drawing':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 19l7-7 3 3-7 7-3-3z" stroke="currentColor" strokeWidth="2"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
             case 'voice':
         return (
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
             <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="2"/>
             <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2"/>
           </svg>
         );
       case 'text':
         return (
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
             <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
             <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
           </svg>
         );
      case 'ai_response':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" 
                  stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={agentRef}
      className={clsx(
        "fixed w-96 bg-gradient-to-br from-amber-50/95 to-orange-50/95",
        "backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-200/30",
        "transition-all duration-300 ease-in-out font-sans select-none z-50",
        "hover:shadow-orange-200/40 hover:shadow-2xl",
        isExpanded ? "max-h-[600px]" : "h-auto",
        isDragging && "scale-105 shadow-orange-200/50 shadow-2xl z-[60]"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Agent Header */}
      <div 
        className={clsx(
          "flex items-center p-6 cursor-grab border-b border-orange-200/20",
          "transition-all duration-200 rounded-t-3xl",
          "hover:bg-orange-100/30 active:cursor-grabbing",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
        onClick={(e) => { e.stopPropagation(); if (!isDragging) setIsExpanded(!isExpanded); }}
      >
        <div className="relative mr-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-400/30">
            {isAnalyzing ? (
              <div className="w-6 h-6 border-2 border-orange-100/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" 
                      stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
          </div>
          <div className={clsx(
            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-amber-50 transition-all duration-300",
            isAnalyzing ? "bg-orange-400 animate-pulse" : "bg-emerald-400"
          )}></div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-amber-900 mb-1">AI Art Critic</h3>
          <p className="text-sm text-amber-700/80">
            {isAnalyzing ? 'Analyzing your artwork...' : 'Ready to help with your art!'}
          </p>
        </div>

        <div className="flex items-center gap-2 ml-auto" data-agent-controls>
          <div className="text-amber-600/60 mr-2 transition-opacity duration-200 group-hover:opacity-100 opacity-60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="9" cy="6" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="6" r="1.5" fill="currentColor"/>
              <circle cx="9" cy="18" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="18" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <button 
            className="w-8 h-8 bg-transparent border border-orange-300/30 rounded-xl text-amber-600 hover:bg-orange-100/50 hover:border-orange-400 hover:text-amber-800 hover:scale-105 transition-all duration-200 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none"
              className={clsx("transition-transform duration-300", isExpanded ? "rotate-180" : "rotate-0")}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="w-8 h-8 bg-transparent border border-orange-300/30 rounded-xl text-amber-600 hover:bg-red-100/50 hover:border-red-400 hover:text-red-600 hover:scale-105 transition-all duration-200 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Agent Content */}
      {isExpanded && (
        <div className="p-6 bg-gradient-to-b from-amber-50/50 to-orange-50/50 max-h-96 overflow-hidden flex flex-col">
          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2" ref={chatContainerRef}>
            {conversationHistory.length === 0 && !response && !isAnalyzing && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" 
                          stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-amber-900">Welcome to AI Canvas!</h4>
                  <p className="text-sm text-amber-700/80 max-w-xs mx-auto leading-relaxed">Start drawing and I'll automatically analyze your artwork. You can also speak to me about your drawing!</p>
                </div>
              </div>
            )}

            {conversationHistory.map((message, index) => (
              <div key={index} className={clsx(
                "flex w-full",
                message.user ? "justify-end" : "justify-start"
              )}>
                <div className={clsx(
                  "max-w-[85%] rounded-2xl shadow-sm",
                  message.user 
                    ? "bg-gradient-to-br from-orange-400 to-red-500 text-white px-4 py-3" 
                    : "bg-white/80 text-amber-900 border border-orange-200/50 p-4"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      {getMessageIcon(message.type)}
                    </div>
                    <span className={clsx(
                      "text-xs font-medium",
                      message.user ? "text-orange-100" : "text-amber-700"
                    )}>
                      {message.type === 'drawing' && 'Drawing Analysis'}
                      {message.type === 'voice' && message.user && 'Your Voice'}
                      {message.type === 'text' && message.user && 'Your Message'}
                      {message.type === 'ai_response' && 'AI Response'}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed mb-2">
                    {message.text || message.analysis}
                  </div>
                  <div className={clsx(
                    "text-xs opacity-70",
                    message.user ? "text-orange-100" : "text-amber-700"
                  )}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                  {!message.user && message.text && (
                    <div className="mt-3">
                      <VoiceSynthesis text={message.text || message.analysis} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Current Response */}
            {(response || isAnalyzing) && (
              <div className="flex w-full justify-start">
                <div className="max-w-[85%] bg-white/80 text-amber-900 border border-orange-200/50 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      {isAnalyzing ? (
                        <div className="w-4 h-4 border-2 border-orange-300/30 border-t-orange-400 rounded-full animate-spin"></div>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-orange-400">
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" 
                                stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-xs font-medium text-amber-700">
                      {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed mb-2">
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <span>Examining your artwork</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    ) : (
                      response
                    )}
                  </div>
                  <div className="text-xs opacity-70 text-amber-700">
                    {formatTimestamp(new Date())}
                  </div>
                  {response && !isAnalyzing && (
                    <div className="mt-3">
                      <VoiceSynthesis text={response} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

                    {/* Text Input */}
          <div className="mt-4 pt-4 border-t border-orange-200/20">
            <form onSubmit={handleTextSubmit} className="flex gap-3">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type a message about your drawing..."
                className="flex-1 px-4 py-3 border border-orange-300/30 rounded-2xl text-sm bg-white/80 text-amber-900 placeholder-amber-600/60 focus:outline-none focus:border-orange-400 focus:bg-white transition-all duration-200"
                disabled={isTextSending}
              />
              <button
                type="submit"
                className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 min-w-[3rem]",
                  !textInput.trim() || isTextSending
                    ? "bg-amber-200/50 text-amber-400/60 cursor-not-allowed"
                    : "bg-gradient-to-br from-orange-400 to-red-500 text-white hover:from-red-500 hover:to-red-600 hover:scale-105 shadow-lg hover:shadow-orange-400/30"
                )}
                disabled={!textInput.trim() || isTextSending}
                title="Send message"
              >
                {isTextSending ? (
                  <div className="w-4 h-4 border-2 border-orange-100/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </form>
          </div>

          {/* Agent Actions */}
          <div className="px-6 pb-6">
            <div className="text-center text-xs text-amber-600/70 italic bg-orange-50/50 rounded-xl py-3 px-4 border border-orange-200/30">
              💡 Draw, speak, or type to interact with AI about your artwork!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgent; 