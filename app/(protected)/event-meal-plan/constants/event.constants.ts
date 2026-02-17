import {
    Cake,
    Heart,
    Sparkles,
    Users,
    Home,
    Trophy,
    UtensilsCrossed,
    CircleDot,
    PartyPopper,
    Wallet,
    ChefHat,
    ShoppingCart,
    ClipboardCheck,
    Coffee,
    Sun,
    Moon,
    Cookie,
    Wine,
    Sandwich,
    Flame,
    Flag,
    Gift,
    TreePine,
    Gamepad2,
    Baby,
    Star,
} from "lucide-react";
import {
    OccasionOption,
    StepConfig,
    EventFormData,
    MealTypeOption,
    MealType,
} from "../types/event.types";

// Occasion options with icons and colors (US-focused events)
export const OCCASION_OPTIONS: OccasionOption[] = [
    {
        value: "birthday",
        label: "Birthday Party",
        icon: Cake,
        color: "text-pink-500",
        bgGradient: "from-pink-50 to-pink-100",
    },
    {
        value: "anniversary",
        label: "Anniversary",
        icon: Heart,
        color: "text-red-500",
        bgGradient: "from-red-50 to-red-100",
    },
    {
        value: "thanksgiving",
        label: "Thanksgiving",
        icon: UtensilsCrossed,
        color: "text-orange-500",
        bgGradient: "from-orange-50 to-orange-100",
    },
    {
        value: "super_bowl",
        label: "Super Bowl Party",
        icon: Trophy,
        color: "text-blue-600",
        bgGradient: "from-blue-50 to-blue-100",
    },
    {
        value: "fourth_of_july",
        label: "4th of July",
        icon: Flag,
        color: "text-red-600",
        bgGradient: "from-red-50 to-blue-100",
    },
    {
        value: "christmas",
        label: "Christmas",
        icon: TreePine,
        color: "text-green-600",
        bgGradient: "from-green-50 to-red-50",
    },
    {
        value: "bbq",
        label: "BBQ / Cookout",
        icon: Flame,
        color: "text-orange-600",
        bgGradient: "from-orange-50 to-red-50",
    },
    {
        value: "gathering",
        label: "Family Gathering",
        icon: Users,
        color: "text-blue-500",
        bgGradient: "from-blue-50 to-blue-100",
    },
    {
        value: "dinner_party",
        label: "Dinner Party",
        icon: Wine,
        color: "text-purple-500",
        bgGradient: "from-purple-50 to-purple-100",
    },
    {
        value: "potluck",
        label: "Potluck",
        icon: ChefHat,
        color: "text-teal-500",
        bgGradient: "from-teal-50 to-teal-100",
    },
    {
        value: "game_night",
        label: "Game Night",
        icon: Gamepad2,
        color: "text-indigo-500",
        bgGradient: "from-indigo-50 to-indigo-100",
    },
    {
        value: "baby_shower",
        label: "Baby Shower",
        icon: Baby,
        color: "text-pink-400",
        bgGradient: "from-pink-50 to-yellow-50",
    },
    {
        value: "housewarming",
        label: "Housewarming",
        icon: Home,
        color: "text-emerald-500",
        bgGradient: "from-emerald-50 to-emerald-100",
    },
    {
        value: "celebration",
        label: "Celebration",
        icon: Sparkles,
        color: "text-yellow-500",
        bgGradient: "from-yellow-50 to-yellow-100",
    },
    {
        value: "other",
        label: "Other",
        icon: CircleDot,
        color: "text-gray-500",
        bgGradient: "from-gray-50 to-gray-100",
    },
];

// Meal type options
export const MEAL_TYPE_OPTIONS: MealTypeOption[] = [
    {
        value: "breakfast",
        label: "Breakfast",
        icon: Coffee,
        color: "text-amber-500",
        description: "Start the day right",
    },
    {
        value: "lunch",
        label: "Lunch",
        icon: Sandwich,
        color: "text-emerald-500",
        description: "Midday meal",
    },
    {
        value: "dinner",
        label: "Dinner",
        icon: Moon,
        color: "text-[var(--primary)]",
        description: "Evening main course",
    }
];

// Form wizard steps
export const FORM_STEPS: StepConfig[] = [
    {
        id: 1,
        title: "Event Details",
        description: "Name, occasion & schedule",
        icon: PartyPopper,
    },
    {
        id: 2,
        title: "Budget",
        description: "Plan your spending",
        icon: Wallet,
    },
    {
        id: 3,
        title: "Guests",
        description: "Who's coming?",
        icon: Users,
    },
    {
        id: 4,
        title: "Menu Planning",
        description: "Choose meal types",
        icon: ChefHat,
    },
    {
        id: 5,
        title: "Review & Create",
        description: "Finalize your event",
        icon: ClipboardCheck,
    },
];

// Initial form data
export const INITIAL_FORM_DATA: EventFormData = {
    name: "",
    description: "",
    occasionType: "",
    eventDate: undefined,
    eventTime: "",
    budgetType: "separate",
    budgetAmount: "",
    selectedMemberIds: [],
    adultGuests: 0,
    kidGuests: 0,
    guestNotes: "",
    selectedMealTypes: [],
    selectedRecipes: [],
    budgetAllocations: {},
};

// Serving multipliers for calculating total servings
export const SERVING_MULTIPLIERS = {
    member: 1,
    adult: 1,
    kid: 0.5,
} as const;

// Helper function to calculate total servings
export function calculateTotalServings(
    memberCount: number,
    adultGuests: number,
    kidGuests: number
): number {
    return (
        memberCount * SERVING_MULTIPLIERS.member +
        adultGuests * SERVING_MULTIPLIERS.adult +
        kidGuests * SERVING_MULTIPLIERS.kid
    );
}

// Get occasion option by value
export function getOccasionOption(value: string): OccasionOption | undefined {
    return OCCASION_OPTIONS.find((option) => option.value === value);
}

// Get meal type option by value
export function getMealTypeOption(value: MealType): MealTypeOption | undefined {
    return MEAL_TYPE_OPTIONS.find((option) => option.value === value);
}

// Format date for display
export function formatEventDate(date: Date | undefined): string {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// Format time for display
export function formatEventTime(time: string): string {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Currency formatter (USD)
export function formatCurrency(
    amount: number,
    currency: string = "USD"
): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount);
}
