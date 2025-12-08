import React, { useState } from 'react';
import { NoiseType } from '../types';
import { NOISE_ICONS } from '../constants';

interface NoiseMenuProps {
  currentNoise: NoiseType;
  onNoiseChange: (type: NoiseType) => void;
  visible: boolean;
}

const NoiseMenu: React.FC<NoiseMenuProps> = ({ currentNoise, onNoiseChange, visible }) => {
  const [isOpen, setIsOpen] = useState(false);

  // If hidden by parent (not flying), don't render or close interaction
  if (!visible) return null;

  return (
    <div className={`absolute top-6 right-6 z-[30] flex flex-col items-end transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1A1A1A]/80 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-lg active:scale-95"
      >
        {/* Simple Music/Menu Icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="mt-3 flex flex-col space-y-2 bg-[#1A1A1A]/90 backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-2xl animate-fade-in-down origin-top-right">
          {(Object.keys(NOISE_ICONS) as NoiseType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                onNoiseChange(type);
                setIsOpen(false);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                currentNoise === type 
                  ? 'text-[#0F0F0F] bg-[#EDEDED] shadow-md' 
                  : 'text-[#757575] hover:text-[#EDEDED] hover:bg-white/5'
              }`}
              title={type}
              dangerouslySetInnerHTML={{ __html: NOISE_ICONS[type] }}
            />
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default NoiseMenu;