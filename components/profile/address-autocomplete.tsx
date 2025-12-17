import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { PlaceDetails, useGooglePlaces } from "@/hooks/use-google-places";

interface AddressAutocompleteProps {
  onAddressSelect: (address: PlaceDetails) => void;
  initialValue?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  initialValue = "",
  disabled = false,
  label = "Address",
  placeholder = "Start typing your address...",
  className,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    suggestions,
    autocomplete,
    getPlaceDetails,
    isLoading,
    clearSuggestions,
  } = useGooglePlaces();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(true);
    setSelectedIndex(-1);

    if (value.length >= 3) {
      autocomplete(value);
    } else {
      clearSuggestions();
    }
  };

  const handleSuggestionClick = async (
    placeId: string,
    description: string,
  ) => {
    setInputValue(description);
    setShowSuggestions(false);
    clearSuggestions();

    try {
      const details = await getPlaceDetails(placeId);
      onAddressSelect(details);
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selected = suggestions[selectedIndex];
          handleSuggestionClick(selected.placeId, selected.description);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        clearSuggestions();
        break;
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative space-y-1.5", className)}>
      <Label
        htmlFor="address-autocomplete"
        className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200"
      >
       <MapPin className="w-4 h-4 text-[var(--primary)]" />
        {label}
      </Label>

      <div className="relative">
        <Input
          ref={inputRef}
          id="address-autocomplete"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          className="h-12 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900
            focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all pr-10"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 
          rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.placeId}
              type="button"
              onClick={() =>
                handleSuggestionClick(
                  suggestion.placeId,
                  suggestion.description,
                )
              }
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors",
                "border-b border-gray-200 dark:border-gray-800 last:border-b-0",
                selectedIndex === index && "bg-orange-50 dark:bg-orange-950/30",
              )}
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {suggestion.mainText}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {suggestion.secondaryText}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions &&
        !isLoading &&
        inputValue.length >= 3 &&
        suggestions.length === 0 && (
          <div
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 
          rounded-xl shadow-lg p-4"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              No addresses found. Try a different search.
            </p>
          </div>
        )}
    </div>
  );
};
