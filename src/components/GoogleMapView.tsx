import React, { useEffect, useRef, useState } from 'react';
import {
  Compass,
  MapPin,
  ShieldAlert,
  Navigation,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { RideStatus, Language, GoogleMapsConfig } from '../types';
import { translations } from '../translations';

declare global {
  interface Window {
    google?: any;
  }
}
declare const google: any;

// Dark styled theme for Google Maps matching Raj Cab aesthetic
const DARK_MAP_STYLE: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#09090b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#09090b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a1a1aa' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#fbbf24' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#27272a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#18181b' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3f3f46' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#27272a' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#fef08a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1f1f23' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#040405' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#52525b' }] }
];

interface GoogleMapViewProps {
  language: Language;
  rideStatus: RideStatus;
  pickup: string;
  drop: string;
  mapsConfig: GoogleMapsConfig;
  onOpenSettings: () => void;
  setShowSosModal: (v: boolean) => void;
  tripProgress: number;
  currentKmRemaining: string;
  currentMinsRemaining: number;
  // Vector map parameters for simulation fallback
  carPos: { x: number; y: number; rot: number };
  pX: number;
  pY: number;
  dX: number;
  dY: number;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  language,
  rideStatus,
  pickup,
  drop,
  mapsConfig,
  onOpenSettings,
  setShowSosModal,
  tripProgress,
  currentKmRemaining,
  currentMinsRemaining,
  carPos,
  pX,
  pY,
  dX,
  dY
}) => {
  const t = translations[language];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [googleMapsReady, setGoogleMapsReady] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const googleMapInstanceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropMarkerRef = useRef<any>(null);

  // Dynamic Google Maps Script Loader
  useEffect(() => {
    if (!mapsConfig.apiKey || !mapsConfig.useLiveMap) {
      setGoogleMapsReady(false);
      return;
    }

    // Check if script already exists or window.google.maps is available
    if (window.google?.maps) {
      setGoogleMapsReady(true);
      setLoadError(null);
      return;
    }

    const scriptId = 'google-maps-sdk-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        mapsConfig.apiKey
      )}&libraries=places,geometry&v=weekly`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setGoogleMapsReady(true);
        setLoadError(null);
      };

      script.onerror = () => {
        setLoadError('Google Maps API failed to load. Please verify your API key or network.');
        setGoogleMapsReady(false);
      };

      document.head.appendChild(script);
    } else {
      setGoogleMapsReady(true);
    }
  }, [mapsConfig.apiKey, mapsConfig.useLiveMap]);

  // Initialize and update real Google Map
  useEffect(() => {
    if (!googleMapsReady || !mapContainerRef.current || !window.google?.maps) return;

    try {
      // Coordinates for Jaipur, Rajasthan (Civil Lines to Airport route)
      const civilLinesCoords = { lat: 26.908, lng: 75.7885 };
      const airportCoords = { lat: 26.8289, lng: 75.8056 };

      if (!googleMapInstanceRef.current) {
        // Create Map with required attribution & dark styling
        const map = new google.maps.Map(mapContainerRef.current, {
          center: civilLinesCoords,
          zoom: 13,
          styles: DARK_MAP_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
          // Internal usage attribution ID mandated for Google Maps Code Assist
          ...({ internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'] } as Record<string, unknown>)
        });

        googleMapInstanceRef.current = map;

        // Create Directions Renderer with amber/gold polyline
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#f59e0b',
            strokeWeight: 5,
            strokeOpacity: 0.9
          }
        });
        directionsRendererRef.current = directionsRenderer;
      }

      const map = googleMapInstanceRef.current;

      // Pickup Marker
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = new google.maps.Marker({
          position: civilLinesCoords,
          map,
          title: `Pickup: ${pickup}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#f59e0b',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5
          }
        });
      } else {
        pickupMarkerRef.current.setTitle(`Pickup: ${pickup}`);
      }

      // Drop Marker (if not idle)
      if (rideStatus !== 'idle') {
        if (!dropMarkerRef.current) {
          dropMarkerRef.current = new google.maps.Marker({
            position: airportCoords,
            map,
            title: `Destination: ${drop}`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#10b981',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2.5
            }
          });
        } else {
          dropMarkerRef.current.setMap(map);
          dropMarkerRef.current.setTitle(`Destination: ${drop}`);
        }
      } else if (dropMarkerRef.current) {
        dropMarkerRef.current.setMap(null);
      }

      // Calculate Driver interpolated position between pickup and destination
      const progressRatio = Math.max(0, Math.min(100, tripProgress)) / 100;
      const driverLat = civilLinesCoords.lat + (airportCoords.lat - civilLinesCoords.lat) * progressRatio;
      const driverLng = civilLinesCoords.lng + (airportCoords.lng - civilLinesCoords.lng) * progressRatio;

      if (rideStatus !== 'idle') {
        if (!driverMarkerRef.current) {
          driverMarkerRef.current = new google.maps.Marker({
            position: { lat: driverLat, lng: driverLng },
            map,
            title: 'Raj Cab Driver: Ramesh Patel (White Dzire)',
            icon: {
              path: 'M 0,-10 L 8,10 L 0,6 L -8,10 Z',
              scale: 2,
              fillColor: '#fbbf24',
              fillOpacity: 1,
              strokeColor: '#000000',
              strokeWeight: 1.5,
              rotation: carPos.rot || 45
            }
          });
        } else {
          driverMarkerRef.current.setMap(map);
          driverMarkerRef.current.setPosition({ lat: driverLat, lng: driverLng });
        }
      } else if (driverMarkerRef.current) {
        driverMarkerRef.current.setMap(null);
      }

      // Compute and draw real route using DirectionsService if available
      if (rideStatus !== 'idle' && directionsRendererRef.current) {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route(
          {
            origin: civilLinesCoords,
            destination: airportCoords,
            travelMode: google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result && directionsRendererRef.current) {
              directionsRendererRef.current.setDirections(result);
            }
          }
        );
      } else if (directionsRendererRef.current) {
        directionsRendererRef.current.set('directions', null);
      }
    } catch (err) {
      console.warn('Google Maps rendering fallback notice:', err);
    }
  }, [googleMapsReady, rideStatus, pickup, drop, tripProgress, carPos.rot]);

  const shouldUseLiveMap = Boolean(mapsConfig.apiKey && mapsConfig.useLiveMap && googleMapsReady && !loadError);

  return (
    <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
      {/* 1. REAL GOOGLE MAP CONTAINER */}
      {shouldUseLiveMap ? (
        <div id="google-map-container" ref={mapContainerRef} className="w-full h-full" />
      ) : (
        /* 2. FALLBACK: INTERACTIVE DARK VECTOR MAP SIMULATION */
        <svg
          viewBox="0 0 700 400"
          className="w-full h-full object-cover select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="0.8" strokeOpacity="0.6" />
            </pattern>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Landmass background & road grids */}
          <rect width="700" height="400" fill="#09090b" />
          <rect width="700" height="400" fill="url(#city-grid)" />

          {/* Contour lines */}
          <path
            d="M -20 180 Q 200 130 380 220 T 720 140"
            fill="none"
            stroke="#18181b"
            strokeWidth="38"
            strokeLinecap="round"
          />

          {/* City Arterial Roads */}
          <path d="M 50 380 L 650 30" stroke="#27272a" strokeWidth="12" strokeLinecap="round" />
          <path d="M 120 40 L 620 380" stroke="#27272a" strokeWidth="8" strokeLinecap="round" />
          <path d="M 20 200 L 680 200" stroke="#27272a" strokeWidth="6" />
          <path d="M 350 20 L 350 380" stroke="#27272a" strokeWidth="6" />

          {/* Secondary road curves */}
          <path d="M 100 280 Q 240 320 360 260 T 600 240" stroke="#1f1f23" strokeWidth="4" fill="none" />

          {/* Road labels */}
          <text x="70" y="365" fill="#52525b" fontSize="10" fontWeight="bold" letterSpacing="1">
            MI ROAD
          </text>
          <text x="500" y="70" fill="#52525b" fontSize="10" fontWeight="bold" letterSpacing="1">
            TONK ROAD
          </text>
          <text x="260" y="190" fill="#52525b" fontSize="10" fontWeight="bold" letterSpacing="1">
            STATUE CIRCLE / C-SCHEME
          </text>

          {/* Route path if searching or active */}
          {rideStatus !== 'idle' && (
            <>
              {/* Route shadow line */}
              <path
                d={`M ${pX} ${pY} Q 360 260 ${dX} ${dY}`}
                stroke="#000000"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              {/* Active illuminated path */}
              <path
                d={`M ${pX} ${pY} Q 360 260 ${dX} ${dY}`}
                stroke="url(#routeGrad)"
                strokeWidth="5"
                strokeDasharray="8 4"
                fill="none"
                strokeLinecap="round"
                className="animate-pulse"
              />
            </>
          )}

          {/* Pickup Pin */}
          <g transform={`translate(${pX}, ${pY})`}>
            <circle r="18" fill="#f59e0b" opacity="0.25" className="animate-ping" />
            <circle r="9" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
            <text x="14" y="4" fill="#fbbf24" fontSize="11" fontWeight="bold">
              Pickup (Civil Lines)
            </text>
          </g>

          {/* Destination Pin */}
          {rideStatus !== 'idle' && (
            <g transform={`translate(${dX}, ${dY})`}>
              <circle r="12" fill="#10b981" opacity="0.3" />
              <circle r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <text x="14" y="4" fill="#34d399" fontSize="11" fontWeight="bold">
                Drop ({drop.split(',')[0]})
              </text>
            </g>
          )}

          {/* Animated Driver Taxi Pin */}
          {rideStatus !== 'idle' && (
            <g
              transform={`translate(${carPos.x}, ${carPos.y}) rotate(${carPos.rot})`}
              filter="url(#glow)"
            >
              <ellipse rx="18" ry="12" fill="#000" opacity="0.4" />
              <rect x="-14" y="-8" width="28" height="16" rx="4" fill="#fbbf24" stroke="#000" strokeWidth="1.5" />
              <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#18181b" />
              <circle cx="9" cy="-7" r="1.5" fill="#fef08a" />
              <circle cx="9" cy="7" r="1.5" fill="#fef08a" />
            </g>
          )}

          {/* Radar ripple if searching */}
          {rideStatus === 'searching' && (
            <g transform="translate(350, 200)">
              <circle r="30" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.8" className="animate-ping" />
              <circle r="70" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" className="animate-ping" />
              <circle r="120" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.2" className="animate-ping" />
            </g>
          )}
        </svg>
      )}

      {/* Map Control Overlay Header */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-auto">
        <button
          onClick={onOpenSettings}
          className="bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 hover:border-amber-500/50 text-[11px] text-zinc-300 flex items-center gap-1.5 shadow-md transition-colors"
          title="Configure Google Maps API Key"
        >
          {shouldUseLiveMap ? (
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Compass className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="font-semibold">
            {shouldUseLiveMap ? 'Google Maps (Live)' : 'Vector GPS Simulation'}
          </span>
          <span className="px-1.5 py-0.2 bg-zinc-800 text-[9px] rounded text-zinc-400 font-mono">
            {shouldUseLiveMap ? 'GMP' : 'OFFLINE'}
          </span>
        </button>

        {rideStatus === 'in_transit' && (
          <div className="bg-emerald-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/40 text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 shadow-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              {t.tripInProgress} ({currentKmRemaining} km left)
            </span>
          </div>
        )}
      </div>

      {/* Emergency SOS Button in Top-Right of Map */}
      <button
        onClick={() => setShowSosModal(true)}
        className="absolute top-3 right-3 px-2.5 py-1 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-red-600/40 transition-all active:scale-95 border border-red-400/30 pointer-events-auto"
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>{t.sosButton}</span>
      </button>

      {/* Autocomplete / Places hint badge if live map is active */}
      {shouldUseLiveMap && (
        <div className="absolute bottom-2 left-3 text-[10px] text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800 pointer-events-none">
          Google Maps Platform • Live Polyline & Geocoding
        </div>
      )}
    </div>
  );
};
