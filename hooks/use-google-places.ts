import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

export interface PlaceDetails {
  placeId: string;
  formattedAddress: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface PlaceAutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export const useGooglePlaces = () => {
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteResult[]>([]);

  // Autocomplete mutation
  const autocompleteMutation = useMutation({
    mutationFn: async (input: string) => {
      const response = await fetch(
        `/api/v1/places/autocomplete?input=${encodeURIComponent(input)}&types=address`,
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch suggestions");
      }
      const data = await response.json();
      return data.data as PlaceAutocompleteResult[];
    },
    onSuccess: (data) => {
      setSuggestions(data);
    },
    onError: (error: any) => {
      console.error("Autocomplete error:", error);
      setSuggestions([]);
    },
  });

  // Get place details mutation
  const placeDetailsMutation = useMutation({
    mutationFn: async (placeId: string) => {
      const response = await fetch(`/api/v1/places/details/${placeId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch place details");
      }
      const data = await response.json();
      return data.data as PlaceDetails;
    },
  });

  // Geocode mutation
  const geocodeMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await fetch("/api/v1/places/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to geocode address");
      }
      const data = await response.json();
      return data.data as { latitude: number; longitude: number };
    },
  });

  // Reverse geocode mutation
  const reverseGeocodeMutation = useMutation({
    mutationFn: async ({
      latitude,
      longitude,
    }: {
      latitude: number;
      longitude: number;
    }) => {
      const response = await fetch("/api/v1/places/reverse-geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reverse geocode");
      }
      const data = await response.json();
      return data.data as PlaceDetails;
    },
  });

  const autocomplete = (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }
    autocompleteMutation.mutate(input);
  };

  const getPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
    return placeDetailsMutation.mutateAsync(placeId);
  };

  const geocode = async (address: string) => {
    return geocodeMutation.mutateAsync(address);
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    return reverseGeocodeMutation.mutateAsync({ latitude, longitude });
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return {
    suggestions,
    autocomplete,
    getPlaceDetails,
    geocode,
    reverseGeocode,
    clearSuggestions,
    isLoading: autocompleteMutation.isPending || placeDetailsMutation.isPending,
    isError: autocompleteMutation.isError || placeDetailsMutation.isError,
  };
};
