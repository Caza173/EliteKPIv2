import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, details?: AddressDetails) => void;
  onAddressSelect?: (details: AddressDetails) => void;
  placeholder?: string;
  className?: string;
}

interface AddressDetails {
  fullAddress: string;
  streetNumber: string;
  route: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
  properties?: {
    address?: string;
  };
}

const MapboxAddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter address...",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch Mapbox access token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        // Try environment variable first
        let token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        
        if (!token) {
          // Fallback to API endpoint
          try {
            const tokenResponse = await fetch('/api/mapbox-token', {
              credentials: 'include'
            });
            if (tokenResponse.ok) {
              const data = await tokenResponse.json();
              token = data.token;
            }
          } catch (error) {
            console.log('Mapbox access token not available from API, using fallback input');
          }
        }

        if (token && token !== "YOUR_MAPBOX_ACCESS_TOKEN_HERE") {
          setAccessToken(token);
        } else {
          console.log('No Mapbox access token found, using basic input');
        }
      } catch (error) {
        console.error('Error fetching Mapbox access token:', error);
      }
    };

    fetchToken();
  }, []);

  // Debounced search function
  const searchAddresses = async (query: string) => {
    if (!accessToken || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${accessToken}&` +
        `country=us&` +
        `types=address,poi&` +
        `limit=5&` +
        `autocomplete=true`
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced search
    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);
  };

  // Parse address details from Mapbox feature
  const parseAddressDetails = (feature: MapboxFeature): AddressDetails => {
    const context = feature.context || [];
    let city = '';
    let state = '';
    let zipCode = '';

    // Extract components from context
    for (const item of context) {
      if (item.id.startsWith('place.')) {
        city = item.text;
      } else if (item.id.startsWith('region.')) {
        state = item.short_code?.replace('US-', '') || item.text;
      } else if (item.id.startsWith('postcode.')) {
        zipCode = item.text;
      }
    }

    // Extract street number and route from place_name
    const addressParts = feature.place_name.split(',');
    const streetAddress = addressParts[0] || '';
    const streetParts = streetAddress.trim().split(' ');
    const streetNumber = streetParts[0] || '';
    const route = streetParts.slice(1).join(' ') || '';

    return {
      fullAddress: feature.place_name,
      streetNumber,
      route,
      city,
      state,
      zipCode,
      latitude: feature.center[1],
      longitude: feature.center[0]
    };
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (feature: MapboxFeature) => {
    const details = parseAddressDetails(feature);
    onChange(feature.place_name, details);
    onAddressSelect?.(details);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle blur event
  const handleBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Handle focus event
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle fallback parsing for basic addresses
  const handleFallbackParsing = () => {
    if (!accessToken && value) {
      // Basic address parsing fallback
      const parts = value.split(',').map(part => part.trim());
      if (parts.length >= 3) {
        const streetAddress = parts[0];
        const cityState = parts[1];
        const zipCode = parts[2];
        
        const cityStateParts = cityState.split(' ');
        const state = cityStateParts.pop() || '';
        const city = cityStateParts.join(' ') || '';
        
        const streetParts = streetAddress.split(' ');
        const streetNumber = streetParts[0] || '';
        const route = streetParts.slice(1).join(' ') || '';
        
        const details: AddressDetails = {
          fullAddress: value,
          streetNumber,
          route,
          city,
          state,
          zipCode
        };
        
        onAddressSelect?.(details);
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleFallbackParsing();
          }
        }}
        placeholder={accessToken ? placeholder : `${placeholder} (Mapbox ${accessToken ? 'ready' : 'loading...'})`}
        className={className}
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="text-sm font-medium text-gray-900">
                {suggestion.place_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapboxAddressAutocomplete;
