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
      className={`fixed inset-0 z-[40] flex items-center justify-center pointer-events-none transition-opacity duration-1000 ease-in-out ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="text-center space-y-4 p-8 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-light tracking-widest text-[#EDEDED] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          歡迎搭乘前往 {destination.code} 的航班
        </h1>
        <div className="h-[1px] w-24 bg-white/20 mx-auto my-6" />
        <p className="text-xl md:text-2xl text-[#C8C8C8] font-light tracking-wider">
          祝你擁有高效率的 {durationMinutes} 分鐘
        </p>
        <p className="text-lg text-[#7FA4FF] font-medium tracking-widest italic pt-4 animate-pulse">
          {randomGreeting}
        </p>
      </div>
    </div>
  );
};

export default Announcement;
