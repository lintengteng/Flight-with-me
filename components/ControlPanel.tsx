
import React from 'react';
import { FlightStatus, Airport } from '../types';
import { STEP_MINUTES } from '../constants';

interface ControlPanelProps {
  status: FlightStatus;
  timeLeft: number;
  totalDuration: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onAdjustTime: (minutes: number) => void;
  destination: Airport | null;
}

const formatTimeDigits = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');
  return [mStr[0], mStr[1], ':', sStr[0], sStr[1]];
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  timeLeft,
  totalDuration,
  onStart,
  onPause,
  onReset,
  onAdjustTime,
  destination,
}) => {
  const isFlying = status === FlightStatus.FLYING;
  const isPaused = status === FlightStatus.PAUSED;
  const isCompleted = status === FlightStatus.COMPLETED;
  const isActive = isFlying || isPaused;

  const digits = formatTimeDigits(timeLeft);

  // The "Ceremony Animation" for the container fading out
  const containerClass = isFlying 
    ? "opacity-30 hover:opacity-100 transition-opacity duration-700 delay-[2000ms]" 
    : "opacity-100 transition-opacity duration-300";

  return (
    <div className={`w-full p-8 md:p-12 flex flex-col items-center justify-end pointer-events-none ${containerClass}`}>
      {/* Floating UI Container */}
      <div className="w-full max-w-2xl flex flex-col items-center">
        
        {/* Timer & Buttons Section */}
        <div className="flex flex-col items-center justify-center mb-10 relative w-full">
           
           <div className="flex items-center justify-center relative w-full">
              {/* Minus Button */}
              {(status === FlightStatus.IDLE || isPaused) && (
                <button 
                  onClick={() => onAdjustTime(-STEP_MINUTES)}
                  className="absolute left-0 md:left-8 z-[100] w-16 h-16 rounded-full text-white/30 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-300 flex items-center justify-center text-4xl font-thin cursor-pointer pointer-events-auto drop-shadow-lg"
                  disabled={totalDuration <= 5 * 60}
                  aria-label="Decrease time"
                >
                  −
                </button>
              )}
              
              {/* Timer Display - Instant Update (No Ghosting) */}
              {/* Reduced min-width and font-size for better spacing on mobile */}
              <div className={`relative h-40 flex items-center justify-center min-w-[240px] md:min-w-[320px] pointer-events-none select-none ${isFlying ? 'text-white/90' : 'text-white/50'}`}>
                  <div className="text-7xl md:text-9xl font-[200] tracking-tighter tabular-nums flex items-center drop-shadow-2xl">
                    {digits.map((char, idx) => (
                      <span key={idx} className="w-[0.65em] text-center inline-block">
                        {char}
                      </span>
                    ))}
                  </div>
              </div>

              {/* Plus Button */}
              {(status === FlightStatus.IDLE || isPaused) && (
                <button 
                  onClick={() => onAdjustTime(STEP_MINUTES)}
                  className="absolute right-0 md:right-8 z-[100] w-16 h-16 rounded-full text-white/30 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-300 flex items-center justify-center text-4xl font-thin cursor-pointer pointer-events-auto drop-shadow-lg"
                  disabled={totalDuration >= 120 * 60}
                  aria-label="Increase time"
                >
                  +
                </button>
              )}
           </div>

           {/* Flight Route Display (TPE - DEST) */}
           {/* Visible only when active (Flying/Paused) and destination exists */}
           <div className={`mt-2 h-8 flex items-center justify-center transition-all duration-700 ${isActive && destination ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {destination && (
                <div className="flex items-center space-x-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md shadow-lg">
                   <span className="text-xs font-light tracking-widest text-white/70">TPE</span>
                   <span className="text-[10px] text-white/40">✈</span>
                   <span className="text-xs font-light tracking-widest text-white/90">{destination.code}</span>
                   <span className="text-[10px] uppercase tracking-wider text-white/50 border-l border-white/10 pl-2 ml-1">
                     {destination.city}
                   </span>
                </div>
              )}
           </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-12 pointer-events-auto">
          {!isFlying && !isPaused && (
             <button
               onClick={onStart}
               className="group flex flex-col items-center space-y-2 opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer"
             >
               <span className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 group-active:scale-95 transition-all backdrop-blur-sm shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
               </span>
               <span className="text-xs font-light tracking-widest text-white/50 uppercase drop-shadow-md">{isCompleted ? 'Fly Again' : 'Start'}</span>
             </button>
          )}

          {(isFlying || isPaused) && (
            <button
              onClick={isFlying ? onPause : onStart}
              className="group flex flex-col items-center space-y-2 opacity-100 transition-all duration-300 cursor-pointer"
            >
              {/* Highlight Pause Button for better visibility */}
              <span className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg group-active:scale-95 ${
                  isFlying 
                  ? 'bg-white text-black border-4 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                  : 'bg-white/5 border border-[#7FA4FF]/30 text-[#7FA4FF] hover:bg-white/10'
              }`}>
                 {isFlying ? (
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-black"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                 ) : (
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#7FA4FF] ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                 )}
              </span>
              <span className={`text-xs font-light tracking-widest uppercase drop-shadow-md ${isFlying ? 'text-white font-medium' : 'text-white/50'}`}>{isFlying ? 'Pause' : 'Resume'}</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="group flex flex-col items-center space-y-2 opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer"
          >
            <span className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 group-active:scale-95 transition-all backdrop-blur-sm shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            </span>
            <span className="text-xs font-light tracking-widest text-white/50 uppercase drop-shadow-md">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
