"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  address: string;
  propertyTitle?: string;
  onMapLoaded?: () => void;
  fullScreen?: boolean;
  showInfoWindow?: boolean;
  showZoomControl?: boolean;
}

export default function GoogleMap({
  address,
  propertyTitle = "Locatie",
  onMapLoaded,
  fullScreen = false,
  showInfoWindow = true,
  showZoomControl = true
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !mapRef.current) return;

    let isMounted = true;
    let zoomTimeout: ReturnType<typeof setTimeout> | null = null;
    const isDev = process.env.NODE_ENV !== 'production';

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Debug: Check if API key is loaded
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (isDev) {
          console.log('🔍 Google Maps Debug Info:', {
            apiKeyPresent: !!apiKey,
            apiKeyLength: apiKey?.length || 0,
            apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND'
          });
        }
        
        if (!apiKey) {
          const errorMsg = 'Google Maps API key niet gevonden. Herstart je development server na het toevoegen van NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local';
          if (isDev) {
            console.error('❌', errorMsg);
          }
          if (isMounted) {
            setError(errorMsg);
          }
          setIsLoading(false);
          return;
        }

        // Initialize Google Maps
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        let google;
        try {
          if (isDev) {
            console.log('🔄 Loading Google Maps API...');
          }
          google = await loader.load();
          if (isDev) {
            console.log('✅ Google Maps API loaded successfully');
          }
        } catch (loaderError: any) {
          if (isDev) {
            console.error('❌ Google Maps Loader error:', loaderError);
            console.error('Error details:', {
              message: loaderError.message,
              name: loaderError.name,
              stack: loaderError.stack,
              toString: loaderError.toString()
            });
          }
          
          // Check for specific error types
          const errorMessage = String(loaderError.message || loaderError.toString() || '').toLowerCase();
          const errorName = String(loaderError.name || '').toLowerCase();
          
          let userFriendlyError = '';
          
          if (errorMessage.includes('invalidkey') || errorMessage.includes('referernotallowed') || errorName.includes('invalidkey')) {
            userFriendlyError = 'API key is ongeldig of heeft verkeerde restricties.\n\nOplossing:\n1. Ga naar Google Cloud Console > APIs & Services > Credentials\n2. Klik op je API key\n3. Voeg toe aan HTTP referrers: localhost:3000/*\n4. Zorg dat Maps JavaScript API en Geocoding API geactiveerd zijn';
          } else if (errorMessage.includes('apinotactivated') || errorName.includes('apinotactivated')) {
            userFriendlyError = 'Maps JavaScript API is niet geactiveerd.\n\nOplossing:\n1. Ga naar Google Cloud Console > APIs & Services > Library\n2. Zoek en activeer: Maps JavaScript API\n3. Zoek en activeer: Geocoding API';
          } else if (errorMessage.includes('billing') || errorMessage.includes('billingnotenabled') || errorName.includes('billing')) {
            userFriendlyError = 'Billing is niet ingeschakeld.\n\nOplossing:\n1. Ga naar Google Cloud Console > Billing\n2. Voeg een billing account toe (vereist sinds 2018)\n3. Je wordt alleen gefactureerd boven de gratis quota';
          } else if (errorMessage.includes('quota') || errorMessage.includes('overquerylimit') || errorName.includes('quota')) {
            userFriendlyError = 'API quota overschreden.\n\nOplossing:\n1. Wacht even en probeer later opnieuw\n2. Check je quota in Google Cloud Console\n3. Overweeg een billing account voor hogere quota';
          } else if (errorMessage.includes('request_denied') || errorMessage.includes('denied')) {
            userFriendlyError = 'API key geweigerd.\n\nMogelijke oorzaken:\n- API restricties zijn te streng\n- Maps JavaScript API niet geactiveerd\n- Geocoding API niet geactiveerd\n- Billing niet ingeschakeld\n\nTest je API key: http://localhost:3000/api/test-google-maps';
          } else {
            userFriendlyError = `Google Maps fout: ${loaderError.message || 'Onbekende fout'}\n\nTest je API key: http://localhost:3000/api/test-google-maps\nCheck browser console (F12) voor meer details.`;
          }
          
          if (isMounted) {
            setError(userFriendlyError);
          }
          setIsLoading(false);
          return;
        }
        
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
          zoomControl: showZoomControl,
          zoomControlOptions: {
            position: (google.maps as any).ControlPosition.RIGHT_BOTTOM
          },
          scrollwheel: true,
          disableDefaultUI: true,
          gestureHandling: 'cooperative'
        });

        // Geocode the address
        const geocoder = new google.maps.Geocoder();
        
        // Try multiple address formats for better success rate
        const addressVariations = [
          `${address}, Netherlands`,
          `${address}`,
        ];
        
        const tryGeocode = (addressIndex: number = 0): void => {
          if (addressIndex >= addressVariations.length) {
            if (isDev) {
              console.error('All geocoding attempts failed');
            }
            if (isMounted) {
              setError('Locatie kon niet worden gevonden');
            }
            setIsLoading(false);
            return;
          }
          
          const currentAddress = addressVariations[addressIndex];
          if (isDev) {
            console.log(`Trying address ${addressIndex + 1}:`, currentAddress);
          }
          
          geocoder.geocode({ address: currentAddress }, (results: any, status: any) => {
            if (!isMounted) return;
            
            if (isDev) {
              console.log('Geocoding result:', { status, results, address: currentAddress });
            }

            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              if (isDev) {
                console.log('Success! Location found:', location.toString());
              }
              
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

              // Bouw de InfoWindow-inhoud via DOM-nodes zodat adres/titel nooit als HTML wordt geparsed
              let infoWindow: any = null;
              if (showInfoWindow) {
                const container = document.createElement('div');
                container.style.cssText = 'padding: 12px; font-family: Inter, sans-serif; max-width: 200px;';
                const heading = document.createElement('h3');
                heading.style.cssText = 'margin: 0 0 8px 0; color: #1F3C88; font-size: 16px; font-weight: 600;';
                heading.textContent = propertyTitle;
                const addressLine = document.createElement('p');
                addressLine.style.cssText = 'margin: 0; color: #666; font-size: 14px; line-height: 1.4;';
                addressLine.textContent = address;
                container.appendChild(heading);
                container.appendChild(addressLine);

                infoWindow = new google.maps.InfoWindow({
                  content: container,
                  disableAutoPan: false
                });
              }

              if (infoWindow) {
                // Show info window on marker click
                marker.addListener('click', () => {
                  infoWindow.open(map, marker);
                });
              }

              // Smooth zoom to neighborhood level (not too close)
              const zoomToLocation = () => {
                // Smooth transition to location at neighborhood level
                map.panTo(location);
                
                // Gradual zoom to neighborhood level (14 is perfect for seeing the area)
                const targetZoom = 14;
                const currentZoom = map.getZoom() || 8;
                const zoomDelay = fullScreen ? 180 : 140;
                
                if (currentZoom !== targetZoom) {
                  const zoomStep = targetZoom > currentZoom ? 1 : -1;
                  let step = currentZoom;
                  
                  const animateZoom = () => {
                    if (!isMounted) return;
                    step += zoomStep;
                    map.setZoom(step);
                    
                    if (step === targetZoom) {
                      if (infoWindow) {
                        // Show info window after zoom complete
                        setTimeout(() => {
                          infoWindow.open(map, marker);
                        }, 800);
                      }
                      return;
                    }
                    
                    zoomTimeout = setTimeout(animateZoom, zoomDelay);
                  };
                  
                  zoomTimeout = setTimeout(animateZoom, zoomDelay);
                }
              };

              // Start zoom animation after brief delay
              setTimeout(zoomToLocation, fullScreen ? 900 : 500);
              
              setIsLoading(false);
              onMapLoaded?.();
              
            } else {
              if (isDev) {
                console.error(`Geocoding failed for address ${addressIndex + 1}:`, status);
              }
              // Try next address variation
              tryGeocode(addressIndex + 1);
            }
          });
        };
        
        // Start geocoding with first address variation
        tryGeocode();

      } catch (error: any) {
        if (isDev) {
          console.error('Map initialization error:', error);
        }
        
        // More specific error messages
        if (error.message?.includes('API key')) {
          if (isMounted) {
            setError('Google Maps API key probleem. Check je .env.local en Google Cloud Console.');
          }
        } else if (error.message?.includes('billing') || error.message?.includes('Billing')) {
          if (isMounted) {
            setError('Billing moet ingeschakeld zijn in Google Cloud Console.');
          }
        } else if (error.message?.includes('quota') || error.message?.includes('Quota')) {
          if (isMounted) {
            setError('API quota overschreden. Check je gebruik in Google Cloud Console.');
          }
        } else {
          if (isMounted) {
            setError(`Kaart kon niet worden geladen: ${error.message || 'Onbekende fout'}`);
          }
        }
        
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (zoomTimeout) {
        clearTimeout(zoomTimeout);
        zoomTimeout = null;
      }
    };
  }, [address, propertyTitle, onMapLoaded]);

  if (error) {
    return (
      <div className={`w-full ${fullScreen ? 'h-screen' : 'h-64'} ${fullScreen ? 'bg-gray-100' : 'bg-gray-50'} ${fullScreen ? '' : 'rounded-lg'} flex items-center justify-center ${fullScreen ? '' : 'border'}`}>
        <div className="text-center text-gray-600">
          <p className="text-sm whitespace-pre-line">{error}</p>
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