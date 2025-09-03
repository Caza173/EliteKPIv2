import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader } from "@googlemaps/js-api-loader";

interface AddressComponents {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

// Helper function to parse Google Maps address components
function parseAddressComponents(components: any[]): Omit<AddressComponents, 'address'> {
  const result = {
    city: '',
    state: '',
    zipCode: ''
  };

  components.forEach((component: any) => {
    const types = component.types;
    
    if (types.includes('locality')) {
      result.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      result.state = component.short_name;
    } else if (types.includes('postal_code')) {
      result.zipCode = component.long_name;
    }
  });

  return result;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (components: AddressComponents) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter address",
  disabled = false,
  className = "",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const parseTimeout = useRef<NodeJS.Timeout>();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      if (!inputRef.current || isLoaded) {
        return;
      }

      try {
        // Try to get API key from environment variable first, then fall back to server
        let apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          // Get API key from server endpoint as fallback
          try {
            const apiKeyResponse = await fetch('/api/google-maps-key', {
              credentials: 'include'
            });
            
            if (!apiKeyResponse.ok) {
              console.log('Google Maps API key not available, using regular input');
              return;
            }
            
            const response = await apiKeyResponse.json();
            apiKey = response.apiKey;
          } catch (fetchError) {
            console.log('Failed to fetch Google Maps API key, using regular input');
            return;
          }
        }
        
        if (!apiKey) {
          console.log('No Google Maps API key found, using regular input');
          return;
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: "weekly",
          libraries: ["places"],
        });

        await loader.load();
        setIsLoaded(true);

        // Initialize autocomplete with more detailed configuration
        autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["address"],
            componentRestrictions: { country: "us" },
            fields: ["formatted_address", "address_components", "geometry", "place_id"],
          }
        );

        // Listen for place selection
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.formatted_address) {
            onChange(place.formatted_address);
            
            // Parse address components if callback is provided
            if (onAddressSelect && place.address_components) {
              const components = parseAddressComponents(place.address_components);
              onAddressSelect({
                address: place.formatted_address,
                ...components
              });
            }
          }
        });
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        console.log('Falling back to regular input');
      }
    };

    initializeAutocomplete();

    return () => {
      if (autocompleteRef.current && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange, onAddressSelect, isLoaded]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => {
        const newValue = e.target.value;
        
        // Always update the field value immediately to prevent graying
        onChange(newValue);
        
        // If Google Maps isn't loaded, try to auto-parse common address formats
        if (!isLoaded && onAddressSelect) {
          const address = newValue;
          const addressParts = address.split(',').map(part => part.trim());
          
          if (addressParts.length >= 3) {
            // Try to parse "123 Main St, City, State ZIP" format
            const lastPart = addressParts[addressParts.length - 1];
            const stateZipMatch = lastPart.match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
            
            if (stateZipMatch) {
              const state = stateZipMatch[1];
              const zipCode = stateZipMatch[2];
              const city = addressParts[addressParts.length - 2];
              
              onAddressSelect({
                address: address,
                city: city,
                state: state,
                zipCode: zipCode
              });
            }
          }
          
          // Also try to parse when user stops typing (after a delay)
          clearTimeout(parseTimeout.current);
          parseTimeout.current = setTimeout(() => {
            if (addressParts.length >= 2) {
              // Simple fallback: assume last part might contain state info
              const lastPart = addressParts[addressParts.length - 1];
              const secondLastPart = addressParts[addressParts.length - 2];
              
              // Look for state abbreviation patterns
              const stateMatch = lastPart.match(/([A-Z]{2})/);
              const zipMatch = lastPart.match(/(\d{5}(?:-\d{4})?)/);
              
              if (stateMatch || zipMatch) {
                onAddressSelect({
                  address: address,
                  city: secondLastPart || '',
                  state: stateMatch ? stateMatch[1] : '',
                  zipCode: zipMatch ? zipMatch[1] : ''
                });
              }
            }
          }, 1000);
        }
      }}
      onFocus={(e) => {
        // Ensure the input remains interactive and not grayed out
        e.target.style.backgroundColor = '';
        e.target.style.color = '';
      }}
      placeholder={isLoaded ? placeholder : `${placeholder} (Google Maps autocomplete ${isLoaded ? 'ready' : 'loading...'})`}
      disabled={disabled}
      className={className}
    />
  );
}