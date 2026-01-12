export const cuisineOptions = [
  // European Cuisines
  { value: "italian", label: "Italian", icon: "🍝", region: "Europe" },
  { value: "french", label: "French", icon: "🥐", region: "Europe" },
  { value: "spanish", label: "Spanish", icon: "🥘", region: "Europe" },
  { value: "greek", label: "Greek", icon: "🇬🇷", region: "Europe" },
  {
    value: "mediterranean",
    label: "Mediterranean",
    icon: "🫒",
    region: "Europe",
  },
  { value: "german", label: "German", icon: "🥨", region: "Europe" },
  { value: "british", label: "British", icon: "☕", region: "Europe" },
  { value: "portuguese", label: "Portuguese", icon: "🐟", region: "Europe" },
  {
    value: "turkish",
    label: "Turkish",
    icon: "🥙",
    region: "Europe/Middle East",
  },

  // Asian Cuisines
  { value: "indian", label: "Indian", icon: "🍛", region: "Asia" },
  { value: "chinese", label: "Chinese", icon: "🥢", region: "Asia" },
  { value: "japanese", label: "Japanese", icon: "🍱", region: "Asia" },
  { value: "thai", label: "Thai", icon: "🌶️", region: "Asia" },
  { value: "korean", label: "Korean", icon: "🍜", region: "Asia" },
  { value: "vietnamese", label: "Vietnamese", icon: "🥖", region: "Asia" },
  { value: "malaysian", label: "Malaysian", icon: "🍲", region: "Asia" },
  { value: "indonesian", label: "Indonesian", icon: "🌴", region: "Asia" },
  { value: "filipino", label: "Filipino", icon: "🍚", region: "Asia" },
  { value: "pakistani", label: "Pakistani", icon: "🫓", region: "Asia" },
  { value: "bangladeshi", label: "Bangladeshi", icon: "🍤", region: "Asia" },
  { value: "sri-lankan", label: "Sri Lankan", icon: "🥥", region: "Asia" },
  { value: "nepali", label: "Nepali", icon: "🏔️", region: "Asia" },
  { value: "burmese", label: "Burmese", icon: "🍜", region: "Asia" },

  // Middle Eastern Cuisines
  {
    value: "middle-eastern",
    label: "Middle Eastern",
    icon: "🧆",
    region: "Middle East",
  },
  { value: "lebanese", label: "Lebanese", icon: "🥙", region: "Middle East" },
  {
    value: "persian",
    label: "Persian (Iranian)",
    icon: "🍚",
    region: "Middle East",
  },
  {
    value: "moroccan",
    label: "Moroccan",
    icon: "🫖",
    region: "Middle East/Africa",
  },
  {
    value: "egyptian",
    label: "Egyptian",
    icon: "🫘",
    region: "Middle East/Africa",
  },
  { value: "israeli", label: "Israeli", icon: "🧆", region: "Middle East" },

  // American Cuisines
  { value: "american", label: "American", icon: "🍔", region: "Americas" },
  { value: "mexican", label: "Mexican", icon: "🌮", region: "Americas" },
  { value: "tex-mex", label: "Tex-Mex", icon: "🌯", region: "Americas" },
  { value: "caribbean", label: "Caribbean", icon: "🏝️", region: "Americas" },
  { value: "brazilian", label: "Brazilian", icon: "🥩", region: "Americas" },
  { value: "peruvian", label: "Peruvian", icon: "🌽", region: "Americas" },
  {
    value: "argentinian",
    label: "Argentinian",
    icon: "🥩",
    region: "Americas",
  },
  { value: "cuban", label: "Cuban", icon: "🇨🇺", region: "Americas" },
  { value: "jamaican", label: "Jamaican", icon: "🌴", region: "Americas" },
  { value: "cajun", label: "Cajun/Creole", icon: "🦞", region: "Americas" },
  { value: "canadian", label: "Canadian", icon: "🍁", region: "Americas" },

  // African Cuisines
  { value: "african", label: "African", icon: "🌍", region: "Africa" },
  { value: "ethiopian", label: "Ethiopian", icon: "🫓", region: "Africa" },
  { value: "nigerian", label: "Nigerian", icon: "🍲", region: "Africa" },
  {
    value: "south-african",
    label: "South African",
    icon: "🥩",
    region: "Africa",
  },
];

export const healthLevelOptions = [
  { value: "healthy", label: "Healthy", icon: "🥗" },
  { value: "moderate", label: "Moderate", icon: "⚖️" },
  { value: "comfort", label: "Comfort", icon: "🍪" },
];

export interface RecipeEntry {
  cuisine?: string;
  members?: string[];
  recipeCount?: string;
  customRecipe?: string;
  pantryOption?: string;
}

export type RecipePayload = Record<string, RecipeEntry>;

export interface Recipe {
  id: string;
  name: string;
  image?: string | null;
  price?: number;
  cuisine?: string;
  prepTime?: number;
  servings?: number;
  description?: string;
  ingredients?: any[];
  instructions?: string[];
  nutrition?: any;
  nutritions?: any;
  calories?: number;
  nutritionalHighlights?: string[];
  cookingTips?: string[];
  webSourceInspirations?: string[];
  costAnalysis?: {
    totalCost: number;
    costPerServing: number;
    budgetEfficiency: number;
  };
  complementaryItems?: any[];
  isAIGenerated?: boolean;
  pantryItemsUsedCount?: number;
  canGenerateRecipe?: boolean;
  totalTimeMinutes?: number;
  isCustomSearch?: boolean;
}

// Recipe Database Mock
export const recipeDatabase: Recipe[] = [
  {
    id: "med-bowl",
    name: "Mediterranean Bowl",
    price: 18,
    cuisine: "mediterranean",
    prepTime: 25,
    servings: 4,
  },
  {
    id: "dal-soup",
    name: "Indian Dal Soup",
    price: 14,
    cuisine: "indian",
    prepTime: 30,
    servings: 4,
  },
  {
    id: "mex-salad",
    name: "Mexican Salad",
    price: 16,
    cuisine: "mexican",
    prepTime: 15,
    servings: 4,
  },
  {
    id: "butter-chicken",
    name: "Butter Chicken",
    price: 32,
    cuisine: "indian",
    prepTime: 45,
    servings: 4,
  },
  {
    id: "lamb-kofta",
    name: "Lamb Kofta",
    price: 35,
    cuisine: "mediterranean",
    prepTime: 40,
    servings: 4,
  },
  {
    id: "enchiladas",
    name: "Enchiladas",
    price: 30,
    cuisine: "mexican",
    prepTime: 35,
    servings: 4,
  },
];

export interface SlotProcessingState {
  [slotKey: string]: {
    isCustomRecipeLoading: boolean;
    isRecipeLoading: boolean;
  };
}
