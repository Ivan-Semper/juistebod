"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  address: string;
  propertyTitle: string;
  onMapLoaded?: () => void;
  fullScreen?: boolean;
}

export default function GoogleMap({ address, propertyTitle, onMapLoaded, fullScreen = false }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !mapRef.current) return;

    let isMounted = true;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Debug: Check if API key is loaded
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
        
        if (!apiKey) {
          setError('Google Maps API key niet gevonden. Check je .env.local file.');
          setIsLoading(false);
          return;
        }

        // Initialize Google Maps
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();
        
        if (!isMounted) return;

        // Create minimalistic map
        const map = new google.maps.Map(mapRef.current!, {
          center: { lat: 52.0907, lng: 5.1214 }, // Netherlands center
          zoom: 8,
          styles: [
            // Minimalistic styling - clean and simple
            {
              featureType: 'all',
              elementType: 'labels',
              stylers: [{ visibility: 'simplified' }]
            },
            {
              featureType: 'administrative',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry.fill',
              stylers: [{ color: '#E3F2FD' }] // Light blue water
            },
            {
              featureType: 'landscape',
              elementType: 'geometry.fill',
              stylers: [{ color: '#FAF9F6' }] // Off-white background
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#E0E0E0', weight: 0.5 }] // Light gray roads
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#BDBDBD', weight: 1 }] // Slightly darker highways
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: (google.maps as any).ControlPosition.RIGHT_BOTTOM
          },
          scrollwheel: true,
          disableDefaultUI: true,
          gestureHandling: 'cooperative'
        });

        mapInstanceRef.current = map;

        // Geocode the address
        const geocoder = new google.maps.Geocoder();
        
        // Try multiple address formats for better success rate
        const addressVariations = [
          `${address}, Netherlands`,
          `${address}`,
          `Koningin-Julianalaan 20, Leersum, Netherlands`,
          `Leersum, Netherlands`
        ];
        
        const tryGeocode = (addressIndex: number = 0): void => {
          if (addressIndex >= addressVariations.length) {
            console.error('All geocoding attempts failed');
            setError('Locatie kon niet worden gevonden');
            setIsLoading(false);
            return;
          }
          
          const currentAddress = addressVariations[addressIndex];
          console.log(`Trying address ${addressIndex + 1}:`, currentAddress);
          
          geocoder.geocode({ address: currentAddress }, (results: any, status: any) => {
            if (!isMounted) return;
            
            console.log('Geocoding result:', { status, results, address: currentAddress });

            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              console.log('Success! Location found:', location.toString());
              
              // Create simple, elegant marker
              const marker = new google.maps.Marker({
                position: location,
                map: map,
                title: propertyTitle,
                icon: {
                  path: (google.maps as any).SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#1F3C88',
                  fillOpacity: 1,
                  strokeColor: '#FAF9F6',
                  strokeWeight: 2
                },
                animation: (google.maps as any).Animation.DROP
              });

              // Simple info window
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div style="padding: 12px; font-family: Inter, sans-serif; max-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; color: #1F3C88; font-size: 16px; font-weight: 600;">
                      ${propertyTitle}
                    </h3>
                    <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.4;">
                      ${address}
                    </p>
                  </div>
                `,
                disableAutoPan: false
              });

              // Show info window on marker click
              marker.addListener('click', () => {
                infoWindow.open(map, marker);
              });

              // Smooth zoom to neighborhood level (not too close)
              const zoomToLocation = () => {
                // Smooth transition to location at neighborhood level
                map.panTo(location);
                
                // Gradual zoom to neighborhood level (14 is perfect for seeing the area)
                const targetZoom = 14;
                const currentZoom = map.getZoom() || 8;
                
                if (currentZoom !== targetZoom) {
                  const zoomStep = targetZoom > currentZoom ? 1 : -1;
                  let step = currentZoom;
                  
                  const zoomInterval = setInterval(() => {
                    step += zoomStep;
                    map.setZoom(step);
                    
                    if (step === targetZoom) {
                      clearInterval(zoomInterval);
                      // Show info window after zoom complete
                      setTimeout(() => {
                        infoWindow.open(map, marker);
                      }, 800);
                    }
                  }, 200); // Smooth zoom steps
                }
              };

              // Start zoom animation after brief delay
              setTimeout(zoomToLocation, 500);
              
              setIsLoading(false);
              onMapLoaded?.();
              
            } else {
              console.error(`Geocoding failed for address ${addressIndex + 1}:`, status);
              // Try next address variation
              tryGeocode(addressIndex + 1);
            }
          });
        };
        
        // Start geocoding with first address variation
        tryGeocode();

      } catch (error) {
        console.error('Map initialization error:', error);
        setError('Kaart kon niet worden geladen');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
    };
  }, [address, propertyTitle, onMapLoaded]);

  if (error) {
    return (
      <div className={`w-full ${fullScreen ? 'h-screen' : 'h-64'} ${fullScreen ? 'bg-gray-100' : 'bg-gray-50'} ${fullScreen ? '' : 'rounded-lg'} flex items-center justify-center ${fullScreen ? '' : 'border'}`}>
        <div className="text-center text-gray-600">
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 opacity-75">Adres: {address}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${fullScreen ? 'h-screen' : 'h-64'} ${fullScreen ? 'bg-gray-100' : 'bg-gray-50'} ${fullScreen ? '' : 'rounded-lg'} overflow-hidden ${fullScreen ? '' : 'border'}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="inline-flex items-center text-gray-600">
              <div 
                className="animate-spin h-5 w-5 border-2 border-gray-300 rounded-full mr-3"
                style={{ borderTopColor: '#1F3C88' }}
              ></div>
              <span className="text-sm">Locatie zoeken...</span>
            </div>
          </div>
        </div>
      )}
      
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ 
          opacity: isLoading ? 0.3 : 1,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
    </div>
  );
} 