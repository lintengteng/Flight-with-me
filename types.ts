export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  coords: Coordinates;
}

export enum FlightStatus {
  IDLE = 'IDLE',
  FLYING = 'FLYING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export enum NoiseType {
  PLANE = 'PLANE',
  RAIN = 'RAIN',
  WIND = 'WIND',
  OCEAN = 'OCEAN',
}

export interface FlightState {
  destination: Airport | null;
  status: FlightStatus;
  startTime: number | null; // Timestamp when flight started/resumed
  pausedAt: number | null; // Timestamp when flight was paused
  elapsedTime: number; // Total seconds elapsed
  totalDuration: number; // Total seconds expected
}
