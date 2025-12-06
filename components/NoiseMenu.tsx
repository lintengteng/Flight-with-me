import React from 'react';
import { NoiseType } from '../types';
import { NOISE_ICONS } from '../constants';

interface NoiseMenuProps {
  currentNoise: NoiseType;
  onNoiseChange: (type: NoiseType) => void;
  visible: boolean;
}

const NoiseMenu: React.FC<NoiseMenuProps> = ({ currentNoise, onNoiseChange, visible }) => {
  return (
    <div className={`absolute top-6 right-6 z-[30] transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`}>
      <div className="flex space-x-4 bg-[#1A1A1A]/90 backdrop-blur-sm p-3 rounded-2xl border border-white/5 shadow-xl">
        {(Object.keys(NOISE_ICONS) as NoiseType[]).map((type) => (
          <button
            key={type}
            onClick={() => onNoiseChange(type)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
              currentNoise === type 
                ? 'text-[#7FA4FF] bg-white/10 shadow-[0_0_10px_rgba(127,164,255,0.2)]' 
                : 'text-[#757575] hover:text-[#EDEDED] hover:bg-white/5 hover:-translate-y-0.5'
            }`}
            title={type}
            dangerouslySetInnerHTML={{ __html: NOISE_ICONS[type] }}
          />
        ))}
      </div>
    </div>
  );
};

export default NoiseMenu;
