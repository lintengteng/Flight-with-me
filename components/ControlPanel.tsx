import React, { useState, useEffect, useRef } from 'react';
import { FlightStatus } from '../types';
import { STEP_MINUTES } from '../constants';

interface ControlPanelProps {
  status: FlightStatus;
  timeLeft: number;
  totalDuration: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onAdjustTime: (minutes: number) => void;
  destinationCode: string | null;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Animated Time Component
const AnimatedTimeDisplay: React.FC<{ timeLeft: number; isFlying: boolean }> = ({ timeLeft, isFlying }) => {
  const [displayTime, setDisplayTime] = useState(formatTime(timeLeft));
  const [animatingTime, setAnimatingTime] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState('');
  const prevTimeLeftRef = useRef(timeLeft);

  useEffect(() => {
    const diff = timeLeft - prevTimeLeftRef.current;
    
    // Only animate on significant changes (manual adjustment > 1 second), ignoring timer ticks
    if (Math.abs(diff) > 1) {
      const direction = diff > 0 ? 'up' : 'down';
      const prevStr = formatTime(prevTimeLeftRef.current);
      const newStr = formatTime(timeLeft);

      setAnimatingTime(prevStr);
      setDisplayTime(newStr);
      
      // Set Slide Classes
      // If adding time (UP): Old slides UP/Out, New slides UP/In
      // If subtracting time (DOWN): Old slides DOWN/Out, New slides DOWN/In
      setAnimationClass(direction === 'up' ? 'slide-up' : 'slide-down');

      const timer = setTimeout(() => {
        setAnimatingTime(null);
        setAnimationClass('');
      }, 250); // Match animation duration

      prevTimeLeftRef.current = timeLeft;
      return () => clearTimeout(timer);
    } else {
      // Normal tick, just update
      setDisplayTime(formatTime(timeLeft));
      prevTimeLeftRef.current = timeLeft;
    }
  }, [timeLeft]);

  return (
    <div className={`relative h-20 overflow-hidden flex items-center justify-center min-w-[240px] ${isFlying ? 'text-[#EDEDED]' : 'text-[#757575]'}`}>
      <style>{`
        .slide-up-enter { animation: slideUpEnter 0.25s ease-out forwards; }
        .slide-up-exit { animation: slideUpExit 0.25s ease-out forwards; }
        .slide-down-enter { animation: slideDownEnter 0.25s ease-out forwards; }
        .slide-down-exit { animation: slideDownExit 0.25s ease-out forwards; }
        
        @keyframes slideUpEnter {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUpExit {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes slideDownEnter {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDownExit {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
      `}</style>
      
      {/* Current/New Time */}
      <div 
        className={`text-7xl font-bold font-mono tracking-tighter tabular-nums absolute inset-0 flex items-center justify-center
          ${animationClass === 'slide-up' ? 'slide-up-enter' : ''}
          ${animationClass === 'slide-down' ? 'slide-down-enter' : ''}
        `}
      >
        {displayTime}
      </div>

      {/* Exiting/Old Time */}
      {animatingTime && (
        <div 
          className={`text-7xl font-bold font-mono tracking-tighter tabular-nums absolute inset-0 flex items-center justify-center
            ${animationClass === 'slide-up' ? 'slide-up-exit' : ''}
            ${animationClass === 'slide-down' ? 'slide-down-exit' : ''}
          `}
        >
          {animatingTime}
        </div>
      )}
    </div>
  );
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  timeLeft,
  totalDuration,
  onStart,
  onPause,
  onReset,
  onAdjustTime,
  destinationCode,
}) => {
  const isFlying = status === FlightStatus.FLYING;
  const isPaused = status === FlightStatus.PAUSED;
  const isCompleted = status === FlightStatus.COMPLETED;

  // Immersive Mode Logic: Fade out when flying
  const containerClass = isFlying 
    ? "opacity-20 hover:opacity-100 transition-opacity duration-700 delay-1000" 
    : "opacity-100 transition-opacity duration-300";

  return (
    <div className={`absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center justify-end z-[20] pointer-events-none ${containerClass}`}>
      {/* Container with Grain Texture & Dark Theme */}
      <div className="bg-grain bg-[#1A1A1A]/95 backdrop-blur-md rounded-[32px] shadow-2xl p-8 w-full max-w-lg pointer-events-auto border border-white/5">
        
        {/* Status Header */}
        <div className="mb-6 text-center min-h-[28px] flex items-center justify-center">
           {isCompleted ? (
             <h2 className="text-xl font-bold text-[#7FA4FF] animate-pulse tracking-wide">
               🎉 已抵達目的地 {destinationCode}
             </h2>
           ) : (
             <div className="flex items-center space-x-2 text-[#C8C8C8] text-sm font-medium tracking-wider uppercase">
               <span>TPE</span>
               <span className="text-[#757575]">✈</span>
               <span>{destinationCode || '???'}</span>
             </div>
           )}
        </div>

        {/* Timer Display */}
        <div className="flex items-center justify-center mb-8 space-x-6">
           {(status === FlightStatus.IDLE || isPaused) && (
             <button 
               onClick={() => onAdjustTime(-STEP_MINUTES)}
               className="w-12 h-12 rounded-full bg-[#1E1E1E] text-[#EDEDED] border border-white/5 active:scale-90 transition-transform duration-100 flex items-center justify-center font-bold text-lg shadow-lg touch-manipulation"
               disabled={totalDuration <= 5 * 60}
             >
               -
             </button>
           )}
           
           <AnimatedTimeDisplay timeLeft={timeLeft} isFlying={isFlying} />

           {(status === FlightStatus.IDLE || isPaused) && (
             <button 
               onClick={() => onAdjustTime(STEP_MINUTES)}
               className="w-12 h-12 rounded-full bg-[#1E1E1E] text-[#EDEDED] border border-white/5 active:scale-90 transition-transform duration-100 flex items-center justify-center font-bold text-lg shadow-lg touch-manipulation"
               disabled={totalDuration >= 120 * 60}
             >
               +
             </button>
           )}
        </div>

        {/* Main Actions */}
        <div className="flex items-center justify-center space-x-5">
          {!isFlying && !isPaused && (
             <button
               onClick={onStart}
               className="px-10 py-4 bg-[#1E1E1E] text-[#EDEDED] rounded-2xl font-medium text-lg border border-white/10 shadow-lg active:scale-95 transition-transform duration-200 touch-manipulation"
             >
               {isCompleted ? '再次飛行' : '開始飛行'}
             </button>
          )}

          {(isFlying || isPaused) && (
            <button
              onClick={isFlying ? onPause : onStart}
              className={`px-10 py-4 rounded-2xl font-medium text-lg border shadow-lg active:scale-95 transition-transform duration-200 touch-manipulation ${
                isFlying 
                ? 'bg-[#2A2A1E] text-[#FFD700] border-[#FFD700]/20' 
                : 'bg-[#1E2A25] text-[#7FA4FF] border-[#7FA4FF]/20'
              }`}
            >
              {isFlying ? '暫停飛行' : '繼續飛行'}
            </button>
          )}

          <button
            onClick={onReset}
            className="px-6 py-4 bg-transparent text-[#757575] rounded-2xl font-medium text-lg active:text-[#EDEDED] active:bg-white/5 transition-colors duration-200 touch-manipulation"
            title="重置"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;