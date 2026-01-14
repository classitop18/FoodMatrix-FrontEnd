/**
 * Utility functions for smart quantity formatting and conversion
 */

interface FormattedQuantity {
    value: number;
    unit: string;
    originalValue: number;
    originalUnit: string;
}

/**
 * Formats a quantity and unit into a smarter representation.
 * e.g., 1200 g -> 1.2 kg
 * e.g., 400 g -> 0.4 kg (if requested)
 */
export const formatSmartQuantity = (
    value: number | string, // Accept string to be safe
    unit: string,
): FormattedQuantity => {
    const numericValue = Number(value);

    if (!unit || isNaN(numericValue)) {
        return {
            value: isNaN(numericValue) ? 0 : numericValue,
            unit: unit || "",
            originalValue: numericValue,
            originalUnit: unit,
        };
    }

    const normalizedUnit = unit.toLowerCase().trim();

    // Mass: g -> kg
    if (
        normalizedUnit === "g" ||
        normalizedUnit === "grams" ||
        normalizedUnit === "gram"
    ) {
        if (numericValue >= 100) {
            return {
                value: Number((numericValue / 1000).toFixed(3)),
                unit: "kg",
                originalValue: numericValue,
                originalUnit: unit,
            };
        }
    }

    // Volume: ml -> L
    if (
        normalizedUnit === "ml" ||
        normalizedUnit === "milliliters" ||
        normalizedUnit === "milliliter"
    ) {
        if (numericValue >= 100) {
            return {
                value: Number((numericValue / 1000).toFixed(3)),
                unit: "L",
                originalValue: numericValue,
                originalUnit: unit,
            };
        }
    }

    // Default
    return {
        value: Number(numericValue.toFixed(2)),
        unit: unit,
        originalValue: numericValue,
        originalUnit: unit,
    };
};

/**
 * Returns a logical step size for incrementing/decrementing based on the unit.
 */
export const getStepSize = (unit: string): number => {
    const u = unit.toLowerCase().trim();
    if (u === "kg" || u === "l") return 0.1; // 100g steps
    if (u === "g" || u === "ml") return 50;   // 50g steps
    if (u === "lb") return 0.25;
    if (u === "oz") return 1;
    return 1; // Default
};

/**
 * Converts a displayed value back to base unit for storage/logic
 */
export const convertBackToBase = (
    displayValue: number,
    displayUnit: string,
    baseUnit: string
): number => {
    const dU = displayUnit.toLowerCase().trim();
    const bU = baseUnit.toLowerCase().trim();

    // kg -> g
    if (dU === "kg" && (bU === "g" || bU === "grams")) {
        return displayValue * 1000;
    }

    // L -> ml
    if (dU === "l" && (bU === "ml" || bU === "milliliters")) {
        return displayValue * 1000;
    }

    return displayValue;
}
