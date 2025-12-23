import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

/* =======================
   Types
======================= */

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
  location?: string;
}

export interface PlaceAutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

/* =======================
   Hook
======================= */

export const useGooglePlaces = () => {
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteResult[]>([]);

  /* ---------- Autocomplete ---------- */
  const autocompleteMutation = useMutation({
    mutationFn: async (input: string) => {
      const { data } = await apiClient.get("/places/autocomplete", {
        params: {
          input,
          types: "address",
        },
      });

      return data.data as PlaceAutocompleteResult[];
    },
    onSuccess: (data) => {
      setSuggestions(data);
    },
    onError: (error) => {
      console.error("Autocomplete error:", error);
      setSuggestions([]);
    },
  });

  /* ---------- Place Details ---------- */
  const placeDetailsMutation = useMutation({
    mutationFn: async (placeId: string) => {
      const { data } = await apiClient.get(`/places/details/${placeId}`);

      return data.data as PlaceDetails;
    },
  });

  /* ---------- Geocode ---------- */
  const geocodeMutation = useMutation({
    mutationFn: async (address: string) => {
      const { data } = await apiClient.post("/places/geocode", { address });

      return data.data as PlaceDetails;
    },
  });

  /* ---------- Reverse Geocode ---------- */
  const reverseGeocodeMutation = useMutation({
    mutationFn: async ({
      latitude,
      longitude,
    }: {
      latitude: number;
      longitude: number;
    }) => {
      const { data } = await apiClient.post("/places/reverse-geocode", {
        latitude,
        longitude,
      });

      return data.data as PlaceDetails;
    },
  });

  /* =======================
     Public API
  ======================= */

  const autocomplete = (input: string) => {
    if (input.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    autocompleteMutation.mutate(input);
  };

  const getPlaceDetails = (placeId: string) => {
    return placeDetailsMutation.mutateAsync(placeId);
  };

  const geocode = (address: string) => {
    return geocodeMutation.mutateAsync(address);
  };

  const reverseGeocode = (latitude: number, longitude: number) => {
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

    isLoading:
      autocompleteMutation.isPending ||
      placeDetailsMutation.isPending ||
      geocodeMutation.isPending ||
      reverseGeocodeMutation.isPending,

    isError:
      autocompleteMutation.isError ||
      placeDetailsMutation.isError ||
      geocodeMutation.isError ||
      reverseGeocodeMutation.isError,
  };
};
