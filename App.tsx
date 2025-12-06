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

  // Timer Logic - Updates FlightState every second for the UI
  // Note: Fluid map animation is handled inside FlightMap using requestAnimationFrame
  useEffect(() => {
    if (flightState.status === FlightStatus.FLYING) {
      timerRef.current = window.setInterval(() => {
        setFlightState(prev => {
          if (prev.elapsedTime >= prev.totalDuration) {
            // Completed
            if (timerRef.current) clearInterval(timerRef.current);
            audioService.stop();
            return { ...prev, status: FlightStatus.COMPLETED, elapsedTime: prev.totalDuration };
          }
          
          return {
            ...prev,
            elapsedTime: prev.elapsedTime + 1,
          };
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
    <div className="relative w-full h-screen overflow-hidden bg-[#0F0F0F] text-[#EDEDED] font-sans selection:bg-[#7FA4FF] selection:text-[#0F0F0F]">
      
      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <FlightMap 
          destination={flightState.destination} 
          isFlying={flightState.status === FlightStatus.FLYING}
          totalDuration={flightState.totalDuration}
          elapsedTime={flightState.elapsedTime}
        />
      </div>

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Announcement Overlay */}
      <Announcement 
        destination={flightState.destination} 
        durationMinutes={Math.floor(flightState.totalDuration / 60)} 
        show={showAnnouncement}
      />

      {/* Noise Menu */}
      <NoiseMenu 
        currentNoise={currentNoise}
        onNoiseChange={handleNoiseChange}
        visible={flightState.status === FlightStatus.FLYING}
      />

      {/* Main UI */}
      <ControlPanel 
        status={flightState.status}
        timeLeft={timeLeft}
        totalDuration={flightState.totalDuration}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onAdjustTime={handleAdjustTime}
        destinationCode={flightState.destination?.code || null}
      />
    </div>
  );
};

export default App;
