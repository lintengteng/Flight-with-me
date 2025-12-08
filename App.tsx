
import React, { useState, useEffect, useCallback, useRef } from 'react';
import FlightMap from './components/FlightMap';
import ControlPanel from './components/ControlPanel';
import NoiseMenu from './components/NoiseMenu';
import Announcement from './components/Announcement';
import { FlightStatus, FlightState, NoiseType } from './types';
import { DESTINATIONS, DEFAULT_DURATION_MINUTES } from './constants';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [flightState, setFlightState] = useState<FlightState>({
    destination: null,
    status: FlightStatus.IDLE,
    startTime: null,
    pausedAt: null,
    elapsedTime: 0,
    totalDuration: DEFAULT_DURATION_MINUTES * 60,
  });

  const [currentNoise, setCurrentNoise] = useState<NoiseType>(NoiseType.PLANE);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Initialize random destination
  const pickRandomDestination = useCallback(() => {
    return DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
  }, []);

  const handleStart = async () => {
    let currentDest = flightState.destination;
    
    // Pick destination if not set or if previously completed
    if (!currentDest || flightState.status === FlightStatus.COMPLETED) {
      currentDest = pickRandomDestination();
      
      setFlightState(prev => ({
        ...prev,
        destination: currentDest,
        status: FlightStatus.FLYING,
        elapsedTime: 0,
        startTime: Date.now(),
        pausedAt: null,
      }));

      // Show announcement sequence only on fresh start
      setShowAnnouncement(true);
      setTimeout(() => setShowAnnouncement(false), 5000); // 5s display

    } else {
      // Resuming
      setFlightState(prev => ({ 
        ...prev, 
        status: FlightStatus.FLYING,
        startTime: Date.now(), // update reference time
      }));
    }

    await audioService.start(currentNoise);
  };

  const handlePause = () => {
    setFlightState(prev => ({ 
      ...prev, 
      status: FlightStatus.PAUSED,
      pausedAt: Date.now(),
    }));
    audioService.stop();
  };

  const handleReset = () => {
    setFlightState(prev => ({
      destination: null,
      status: FlightStatus.IDLE,
      startTime: null,
      pausedAt: null,
      elapsedTime: 0,
      totalDuration: prev.totalDuration,
    }));
    setShowAnnouncement(false);
    audioService.stop();
  };

  const handleAdjustTime = (minutes: number) => {
    if (flightState.status !== FlightStatus.IDLE && flightState.status !== FlightStatus.COMPLETED) return;
    
    setFlightState(prev => {
      const newDuration = Math.max(5 * 60, Math.min(120 * 60, prev.totalDuration + minutes * 60));
      return {
        ...prev,
        totalDuration: newDuration,
      };
    });
  };

  const handleNoiseChange = (type: NoiseType) => {
    setCurrentNoise(type);
    if (flightState.status === FlightStatus.FLYING) {
      audioService.switchNoise(type);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (flightState.status === FlightStatus.FLYING) {
      timerRef.current = window.setInterval(() => {
        setFlightState(prev => {
          if (prev.elapsedTime >= prev.totalDuration) {
            if (timerRef.current) clearInterval(timerRef.current);
            audioService.stop();
            return { ...prev, status: FlightStatus.COMPLETED, elapsedTime: prev.totalDuration };
          }
          return { ...prev, elapsedTime: prev.elapsedTime + 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [flightState.status, flightState.totalDuration]);

  // Completion Sound
  useEffect(() => {
    if (flightState.status === FlightStatus.COMPLETED) {
      const notification = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      notification.volume = 0.5;
      notification.play().catch(() => {});
    }
  }, [flightState.status]);

  const timeLeft = Math.max(0, flightState.totalDuration - flightState.elapsedTime);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0F0F0F] font-sans text-[#EDEDED]">
      
      {/* 
         LAYER 1: MAP BACKGROUND 
         Absolute inset-0, Z-0. This sits at the very bottom.
      */}
      <div className="absolute inset-0 z-0">
        <FlightMap 
          destination={flightState.destination} 
          isFlying={flightState.status === FlightStatus.FLYING}
          totalDuration={flightState.totalDuration}
          elapsedTime={flightState.elapsedTime}
        />
      </div>

      {/* 
         LAYER 1.5: VIGNETTE
         Adds visual depth, sits between map and UI.
      */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/80" />

      {/* 
         LAYER 2: FOREGROUND UI CONTAINER
         Absolute inset-0, Z-50.
         IMPORTANT: pointer-events-none ensures clicks pass through to map drag events where there is no UI.
         We use Flexbox to position the top (Announcement/Menu) and bottom (ControlPanel) elements.
      */}
      <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between">
        
        {/* TOP SECTION: Menu & Announcement */}
        <div className="relative w-full">
            {/* Announcement Overlay (Centered/Top) */}
             <Announcement 
              destination={flightState.destination} 
              durationMinutes={Math.floor(flightState.totalDuration / 60)} 
              show={showAnnouncement}
            />
            
            {/* Noise Menu (Top Right) - Re-enable pointers! */}
            <div className="absolute top-0 right-0 pointer-events-auto">
                <NoiseMenu 
                  currentNoise={currentNoise}
                  onNoiseChange={handleNoiseChange}
                  visible={flightState.status === FlightStatus.FLYING}
                />
            </div>
        </div>

        {/* BOTTOM SECTION: Control Panel */}
        {/* The ControlPanel component itself has internal pointer-events logic, but we wrap it cleanly here */}
        <div className="w-full">
            <ControlPanel 
              status={flightState.status}
              timeLeft={timeLeft}
              totalDuration={flightState.totalDuration}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onAdjustTime={handleAdjustTime}
              destination={flightState.destination}
            />
        </div>

      </div>

    </div>
  );
};

export default App;
