import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, StopIcon } from './icons/MediaIcons';

const ImprovedTextSection: React.FC<{ text: string }> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES'; // Set language for better voice
    utteranceRef.current = u;
    
    u.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    u.onpause = () => {
      setIsSpeaking(false);
      setIsPaused(true);
    };
    u.onresume = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    u.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    // Cleanup on component unmount or text change
    return () => {
      synth.cancel();
    };
  }, [text]);

  const handlePlay = () => {
    const synth = window.speechSynthesis;
    if (!utteranceRef.current) return;
    
    if (isPaused) {
      synth.resume();
    } else {
      synth.cancel(); // Stop any previous speech
      synth.speak(utteranceRef.current);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-xl font-bold">Guion de Ventas Mejorado</h3>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 p-1">
             <button
                onClick={handlePlay}
                disabled={isSpeaking}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Reproducir texto"
             >
                <PlayIcon className="h-5 w-5" />
             </button>
             <button
                onClick={handlePause}
                disabled={!isSpeaking}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Pausar texto"
             >
                <PauseIcon className="h-5 w-5" />
             </button>
             <button
                onClick={handleStop}
                disabled={!isSpeaking && !isPaused}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Detener texto"
             >
                <StopIcon className="h-5 w-5" />
             </button>
           </div>
        </div>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-serif">
        {text}
      </div>
    </div>
  );
};

export default ImprovedTextSection;