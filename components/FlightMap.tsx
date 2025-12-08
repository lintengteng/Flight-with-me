import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Airport } from '../types';
import { TAIPEI_AIRPORT, PLANE_SVG_STRING } from '../constants';

interface FlightMapProps {
  destination: Airport | null;
  isFlying: boolean;
  totalDuration: number;
  elapsedTime: number;
}

const FlightMap: React.FC<FlightMapProps> = ({ destination, isFlying, totalDuration, elapsedTime }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null); // The group that gets transformed (zoomed/panned)
  const planeRef = useRef<SVGPathElement>(null);
  
  const [worldData, setWorldData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Refs for animation loop
  const reqRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef<number>(elapsedTime);

  // Sync elapsed time for the animation loop
  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  // 1. Fetch Topology Data
  useEffect(() => {
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((data: any) => {
        const countries = topojson.feature(data, data.objects.countries);
        setWorldData(countries);
      })
      .catch(err => console.error("Failed to load map data", err));
  }, []);

  // 2. Handle Window Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. D3 Drawing Logic
  useEffect(() => {
    if (!worldData || !svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    // --- Projection Setup ---
    // Start Centered on TAIPEI (TPE)
    const initialScale = Math.min(dimensions.width, dimensions.height) * 1.5; 
    
    const projection = d3.geoMercator()
      .center([TAIPEI_AIRPORT.coords.lng, TAIPEI_AIRPORT.coords.lat])
      .scale(initialScale)
      .translate([dimensions.width / 2, dimensions.height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    // --- Zoom Behavior ---
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8]) // Zoom limits
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    // Attach zoom to the parent SVG
    svg.call(zoom);

    // --- Draw Static Map Elements ---
    g.selectAll("*").remove(); // Clear previous

    // Land
    g.append("g")
      .selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator as any)
      .attr("fill", "#1A1A1A")
      .attr("stroke", "#262626")
      .attr("stroke-width", 0.5);

    // TPE Marker (Origin)
    const tpePos = projection([TAIPEI_AIRPORT.coords.lng, TAIPEI_AIRPORT.coords.lat]);
    if (tpePos) {
      g.append("circle")
        .attr("cx", tpePos[0])
        .attr("cy", tpePos[1])
        .attr("r", 4)
        .attr("fill", "#7FA4FF")
        .attr("fill-opacity", 0.8)
        .attr("stroke", "#7FA4FF")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.3);

      g.append("text")
        .attr("x", tpePos[0] + 10)
        .attr("y", tpePos[1] + 4)
        .text("TPE")
        .attr("fill", "#7FA4FF")
        .attr("font-size", "12px")
        .attr("font-family", "Inter, sans-serif")
        .attr("font-weight", "500")
        .style("pointer-events", "none");
    }

    // --- Draw Flight Elements ---
    if (destination) {
      const destPos = projection([destination.coords.lng, destination.coords.lat]);
      
      // Destination Marker
      if (destPos) {
        g.append("circle")
          .attr("cx", destPos[0])
          .attr("cy", destPos[1])
          .attr("r", 4)
          .attr("fill", "#EDEDED")
          .attr("fill-opacity", 0.6);

        g.append("text")
          .attr("x", destPos[0] + 10)
          .attr("y", destPos[1] + 4)
          .text(destination.code)
          .attr("fill", "#EDEDED")
          .attr("font-size", "12px")
          .attr("font-family", "Inter, sans-serif")
          .attr("font-weight", "300")
          .attr("opacity", 0.7)
          .style("pointer-events", "none");
      }

      // Flight Path (Curved)
      const link = {
        type: "LineString",
        coordinates: [
          [TAIPEI_AIRPORT.coords.lng, TAIPEI_AIRPORT.coords.lat],
          [destination.coords.lng, destination.coords.lat]
        ]
      };

      g.append("path")
        .datum(link)
        .attr("d", pathGenerator as any)
        .attr("fill", "none")
        .attr("stroke", "#EDEDED")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.2)
        .attr("stroke-dasharray", "4,6");

      // Plane Icon - Use the SVG string from constants but parse it
      // For cleaner D3 implementation, we recreate the path logic here
      // matching the NEW simple triangle plane in constants.ts
      const plane = g.append("path")
        .attr("d", "M12 2L2 22L12 18L22 22L12 2Z") // Matches PLANE_SVG_STRING geometry
        .attr("fill", "#EDEDED")
        .attr("stroke", "#0F0F0F")
        .attr("stroke-width", 1.5)
        .style("filter", "drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.4))");
      
      // @ts-ignore
      planeRef.current = plane.node();

      // Setup Interpolator for animation
      const interpolator = d3.geoInterpolate(
        [TAIPEI_AIRPORT.coords.lng, TAIPEI_AIRPORT.coords.lat],
        [destination.coords.lng, destination.coords.lat]
      );

      // --- Animation Loop ---
      const startAnimTime = performance.now();
      const startElapsed = elapsedTimeRef.current;

      const animate = (time: number) => {
        if (!planeRef.current) return;

        let progress = 0;
        
        if (isFlying) {
           const deltaSeconds = (time - startAnimTime) / 1000;
           const preciseElapsed = startElapsed + deltaSeconds;
           progress = Math.min(1, Math.max(0, preciseElapsed / totalDuration));
        } else {
           progress = Math.min(1, Math.max(0, elapsedTimeRef.current / totalDuration));
        }

        // Calculate Position on Projected Path
        const posCoords = interpolator(progress);
        const pPos = projection(posCoords);

        if (pPos) {
          // Calculate Heading
          const nextCoords = interpolator(Math.min(1, progress + 0.01)); // Look ahead slightly
          const nextPos = projection(nextCoords);
          let angle = 0;
          if (nextPos) {
             const dx = nextPos[0] - pPos[0];
             const dy = nextPos[1] - pPos[1];
             // Math.atan2(y, x) gives angle in radians from X-axis (Right).
             // 0 deg = Right.
             // Our plane icon points UP (North).
             // If moving Right (0 deg), we need to rotate plane 90 deg clockwise.
             // So: Angle + 90.
             angle = Math.atan2(dy, dx) * 180 / Math.PI + 90; 
          }

          d3.select(planeRef.current)
            .attr("transform", `translate(${pPos[0]}, ${pPos[1]}) rotate(${angle}) scale(0.6) translate(-12, -12)`);
        }

        if (isFlying && progress < 1) {
          reqRef.current = requestAnimationFrame(animate);
        }
      };

      reqRef.current = requestAnimationFrame(animate);

    } else {
      // @ts-ignore
      planeRef.current = null;
    }

    // Cleanup
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      svg.on('.zoom', null);
    };

  }, [worldData, dimensions, destination, isFlying, totalDuration]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0F0F0F] relative overflow-hidden">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        className="block touch-none cursor-move"
        style={{ width: '100%', height: '100%' }}
      >
        <g ref={gRef}></g>
      </svg>
    </div>
  );
};

export default FlightMap;