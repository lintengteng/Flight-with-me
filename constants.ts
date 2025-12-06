import { Airport } from './types';

export const TAIPEI_AIRPORT: Airport = {
  code: 'TPE',
  name: 'Taipei Taoyuan International',
  city: 'Taipei',
  coords: { lat: 25.0797, lng: 121.2342 },
};

export const DESTINATIONS: Airport[] = [
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', coords: { lat: 35.5494, lng: 139.7798 } },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', coords: { lat: 49.0097, lng: 2.5479 } },
  { code: 'JFK', name: 'John F. Kennedy', city: 'New York', coords: { lat: 40.6413, lng: -73.7781 } },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', coords: { lat: 51.4700, lng: -0.4543 } },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', coords: { lat: 1.3644, lng: 103.9915 } },
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', coords: { lat: -33.9399, lng: 151.1753 } },
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', coords: { lat: 33.9416, lng: -118.4085 } },
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', coords: { lat: 52.3676, lng: 4.9041 } },
  { code: 'ICN', name: 'Incheon Intl', city: 'Seoul', coords: { lat: 37.4602, lng: 126.4407 } },
];

export const GREETINGS = [
  "祝您本次的旅途愉快",
  "Good flight!",
  "誠摯祝您有段放鬆的旅程",
  "Enjoy your focus time",
  "一路順風！",
  "願您享受這段寧靜時光",
  "Have a safe flight"
];

export const DEFAULT_DURATION_MINUTES = 25;
export const MIN_DURATION_MINUTES = 5;
export const MAX_DURATION_MINUTES = 120;
export const STEP_MINUTES = 5;

// Icons - Reduced size to 20x20
export const PLANE_SVG_STRING = `
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.4));">
<path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="#EDEDED" stroke="#0F0F0F" stroke-width="0.5" stroke-linejoin="round"/>
</svg>
`;

export const AIRPORT_ICON_SVG = `
<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="6" cy="6" r="4" fill="#7FA4FF" fill-opacity="0.8" />
<circle cx="6" cy="6" r="6" stroke="#7FA4FF" stroke-opacity="0.4" stroke-width="1" />
</svg>
`;

export const NOISE_ICONS = {
  PLANE: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M13 5l8 7-8 7"/><path d="M13 9v6"/><path d="M13 5L5 9v6l8 4"/></svg>`,
  RAIN: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 13v8"/><path d="M8 13v8"/><path d="M12 15v8"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>`,
  WIND: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>`,
  OCEAN: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c.6.533.9.8 1.2.8.6 0 .9-.8 1.5-.8.6 0 .9.8 1.5.8.6 0 .9-.8 1.5-.8.6 0 .9.8 1.5.8.6 0 .9-.8 1.5-.8.6 0 .9.8 1.5.8.6 0 .9-.8 1.5-.8.6 0 .9.8 1.5.8.6 0 .9-.8 1.5-.8.6 0 .9.8 1.5.8.6 0 .9-.8 1.5-.8"/></svg>`,
};