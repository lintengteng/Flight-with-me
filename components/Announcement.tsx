
import React, { useEffect, useState } from 'react';
import { Airport } from '../types';
import { GREETINGS } from '../constants';

interface AnnouncementProps {
  destination: Airport | null;
  durationMinutes: number;
  show: boolean;
}

const Announcement: React.FC<AnnouncementProps> = ({ destination, durationMinutes, show }) => {
  const [randomGreeting, setRandomGreeting] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setRandomGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 1000); // Wait for fade out
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!destination || !visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[40] flex flex-col items-center justify-start pt-[20vh] pointer-events-none transition-opacity duration-1000 ease-in-out ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="text-center space-y-8 max-w-3xl drop-shadow-2xl px-6">
        
        {/* Destination Group */}
        <div className="flex flex-col items-center space-y-2">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-medium font-sans">
            Destination
          </p>
          
          <div className="space-y-0">
            {/* Huge, Thin Sans-Serif Code */}
            <h1 className="text-7xl md:text-9xl font-[100] tracking-[0.1em] text-white/95 font-sans leading-none">
              {destination.code}
            </h1>
            {/* Elegant Serif City Name */}
            <p className="text-xl md:text-3xl font-[200] tracking-[0.15em] text-white/60 font-serif italic mt-2">
              {destination.city}
            </p>
          </div>
        </div>

        {/* Minimal Divider */}
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto" />

        {/* Message Group */}
        <div className="space-y-4">
          <p className="text-lg md:text-xl text-white/80 font-[300] tracking-widest font-serif leading-relaxed">
            祝你擁有高效率的 <span className="text-white font-normal border-b border-white/20 pb-0.5">{durationMinutes}</span> 分鐘
          </p>

          <p className="text-xs text-white/30 font-medium tracking-[0.4em] uppercase font-sans pt-2">
            {randomGreeting}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Announcement;
