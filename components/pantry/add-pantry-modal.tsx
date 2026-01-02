"use client";

import React, { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandList,
} from "@/components/ui/command";

import {
  X,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  ChevronDown,
  Check,
  Loader2,
  Edit,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";

// Import from services
import {
  useIngredients,
  useIngredientSearch,
} from "@/services/ingredients/ingredients.query";
import {
  useAddPantryMutation,
  useUpdatePantryMutation,
} from "@/services/pantry/pantry.mutation";
import { toast } from "@/hooks/use-toast";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// CommandLoading component inline
const CommandLoading = ({ children }: any) => (
  <div className="py-6 text-center text-sm">{children}</div>
);

// Import useIngredientCategories
import { useIngredientCategories } from "@/services/ingredients/ingredients.query";

const UNITS = [
  "cup",
  "tbsp",
  "tsp",
  "oz",
  "lb",
  "gram",
  "kg",
  "ml",
  "liter",
  "piece",
  "clove",
  "slice",
  "dozen",
  "can",
  "bunch",
  "jar",
  "pinch",
  "sprig",
];

const LOCATIONS = [
  "refrigerator",
  "freezer",
  "pantry",
  "cabinet",
  "countertop",
];

// ---------------- SEARCHABLE CATEGORY SELECT (Creates New) -------------------
function SearchableCategorySelect({ value, onChange, categories }: any) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11 rounded-lg !border border-[#BCBCBC] bg-white hover:border-[#7661d3] hover:bg-white text-left font-normal px-3 transition-all"
        >
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value || "Select or create category..."}
          </span>
          <ChevronDown size={16} className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
        <Command>
          <CommandInput
            placeholder="Search category..."
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories.map((cat: string) => (
                <CommandItem
                  key={cat}
                  value={cat}
                  onSelect={(currentValue) => {
                    onChange(cat);
                    setOpen(false);
                  }}
                  className="flex items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === cat ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {cat}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Create New Option */}
            {search &&
              !categories.some(
                (c: string) => c.toLowerCase() === search.toLowerCase(),
              ) && (
                <CommandGroup heading="Create New">
                  <CommandItem
                    onSelect={() => {
                      const newCat =
                        search.charAt(0).toUpperCase() +
                        search.slice(1).toLowerCase();
                      onChange(newCat);
                      setOpen(false);
                    }}
                    className="bg-purple-50 text-purple-700 font-semibold cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{search}"
                  </CommandItem>
                </CommandGroup>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ---------------- SEARCHABLE INGREDIENT SELECT -------------------
function SearchableIngredientSelect({ value, onChange, category }: any) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const { data: categoryIngredients = [], isLoading: loadingCategory } =
    useIngredients(category);

  const { data: searchResults = [], isLoading: loadingSearch } =
    useIngredientSearch(debouncedSearch);

  let finalList: any[] = [];
  if (debouncedSearch) {
    finalList = searchResults;
  } else if (category) {
    finalList = categoryIngredients;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-11 rounded-lg border border-[#BCBCBC] bg-white hover:border-[#7661d3] hover:bg-white text-left font-normal px-3 transition-all"
        >
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value?.name || "Search ingredients..."}
          </span>
          <ChevronDown size={16} className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white border border-[#BCBCBC] rounded-lg z-50">
        <div className="max-h-60">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search ingredients..."
              onValueChange={setSearch}
              className=""
            />

            <CommandList>
              {loadingCategory || loadingSearch ? (
                <CommandLoading>Loading...</CommandLoading>
              ) : null}

              {/* Show "Create New" option if searching and we have a search term */}
              {!loadingSearch && debouncedSearch && (
                <CommandGroup heading="Create New">
                  <CommandItem
                    onSelect={() => {
                      onChange({ name: search, isNew: true });
                      setOpen(false);
                    }}
                    className="bg-purple-50 text-purple-700 font-semibold cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{search}"
                  </CommandItem>
                </CommandGroup>
              )}

              <CommandEmpty>No ingredients found.</CommandEmpty>

              <CommandGroup heading="Existing Ingredients">
                {finalList.map((item: any) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                    className="flex items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.id === item.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      {item.defaultMeasurementUnit && (
                        <span className="text-xs text-gray-500">
                          Default: {item.defaultMeasurementUnit}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------- MAIN COMPONENT -------------------
export default function AddToPantry({ setIsAddModalOpen, itemToEdit }: any) {
  const { activeAccountId } = useSelector((state: RootState) => state.account);
  const isEditMode = !!itemToEdit;

  // Dynamic Categories
  const { data: fetchedCategories = [] } = useIngredientCategories();
  const DISPLAY_CATEGORIES =
    fetchedCategories.length > 0
      ? fetchedCategories
      : ["Produce", "Pantry", "Dairy", "Protein", "Seafood", "Meat", "Bakery"];

  const [category, setCategory] = useState("");
  const [ingredient, setIngredient] = useState<any>(null);
  const [formData, setFormData] = useState({
    quantity: "",
    unit: "lb",
    location: "refrigerator",
    expirationDate: "",
    costPaid: "",
  });
  const [errors, setErrors] = useState<any>({});

  const addPantryMutation = useAddPantryMutation();
  const updatePantryMutation = useUpdatePantryMutation();

  // Populate form when editing
  useEffect(() => {
    if (itemToEdit) {
      const normalizedCategory = itemToEdit.category
        ? itemToEdit.category.charAt(0).toUpperCase() +
          itemToEdit.category.slice(1).toLowerCase()
        : "";

      setCategory(normalizedCategory);
      setIngredient({
        id: itemToEdit.ingredientId,
        name: itemToEdit.ingredientName,
        category: normalizedCategory,
      });
      setFormData({
        quantity: itemToEdit.quantity?.toString() || "",
        unit: itemToEdit.unit || "lb",
        location: itemToEdit.location || "refrigerator",
        expirationDate: itemToEdit.expirationDate || "",
        costPaid: itemToEdit.costPaid?.toString() || "",
      });
    }
  }, [itemToEdit]);

  // Auto-set unit when ingredient is selected
  useEffect(() => {
    if (ingredient?.defaultMeasurementUnit && !isEditMode) {
      setFormData((prev) => ({
        ...prev,
        unit: ingredient.defaultMeasurementUnit,
      }));
    }
  }, [ingredient, isEditMode]);

  const handleSubmit = async () => {
    const newErrors: any = {};
    if (!category) newErrors.category = "Category is required";
    if (!ingredient) newErrors.ingredient = "Ingredient is required";
    if (!formData.quantity) newErrors.quantity = "Required";
    else if (parseFloat(formData.quantity) <= 0) newErrors.quantity = "> 0";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Fix errors",
        variant: "destructive",
      });
      return;
    }
    setErrors({});

    const payload: any = {
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      location: formData.location,
      expirationDate: formData.expirationDate || null,
      costPaid: formData.costPaid ? parseFloat(formData.costPaid) : undefined,
    };
    if (ingredient.isNew) {
      payload.ingredientName = ingredient.name;
      payload.category = category;
    } else {
      payload.ingredientId = ingredient.id;
    }

    try {
      if (isEditMode) {
        await updatePantryMutation.mutateAsync({
          id: itemToEdit.id,
          data: { ...payload, accountId: activeAccountId },
        });
        toast({ title: "Updated!", description: "Item updated." });
      } else {
        await addPantryMutation.mutateAsync({
          ...payload,
          accountId: activeAccountId,
        });
        toast({ title: "Added!", description: "Item added." });
      }
      setIsAddModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed",
        variant: "destructive",
      });
    }
  };

  const isLoading =
    addPantryMutation.isPending || updatePantryMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* MATCH ACCOUNT Modal Header Style */}
        <div className="bg-gradient-to-r from-[#7661d3] to-[#3d326d] text-white p-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                {isEditMode ? <Edit size={20} /> : <Package size={20} />}
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  {isEditMode ? "Edit Item" : "Add to Pantry"}
                </h2>
                <p className="text-xs text-white/90 font-medium opacity-90">
                  Manage your inventory
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* CATEGORY FIRST (Dynamic & Creatable) */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
              Category *
            </label>

            <SearchableCategorySelect
              value={category}
              categories={DISPLAY_CATEGORIES}
              onChange={(cat: string) => {
                setCategory(cat);
                setErrors({ ...errors, category: "" });
              }}
            />
            {errors.category && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">
                {errors.category}
              </p>
            )}
          </div>

          {/* INGREDIENT SEARCH */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
              Ingredient *
            </label>

            <SearchableIngredientSelect
              category={category}
              value={ingredient}
              onChange={(ing: any) => {
                setIngredient(ing);
                setErrors({ ...errors, ingredient: "" });

                // Auto-fill category if match found (and not creating new)
                if (ing.category && !category) {
                  setCategory(ing.category);
                  setErrors((prev: any) => ({ ...prev, category: "" }));
                }
              }}
            />
            {errors.ingredient && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">
                {errors.ingredient}
              </p>
            )}

            {/* Helper Text */}
            {ingredient?.isNew ? (
              <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-2.5 rounded-lg border border-purple-200 font-medium">
                ✨ Creating new ingredient: <strong>{ingredient.name}</strong>
              </div>
            ) : category ? (
              <div className="mt-2 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <div className="mt-0.5 rounded-full bg-gray-400 w-1.5 h-1.5 shrink-0" />
                <p className="leading-tight">
                  Showing {category} ingredients. Search or create new.
                </p>
              </div>
            ) : (
              <div className="mt-2 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                <div className="mt-0.5 rounded-full bg-amber-400 w-1.5 h-1.5 shrink-0" />
                <p className="leading-tight">
                  Please select a category first to see relevant ingredients.
                </p>
              </div>
            )}
          </div>

          {/* SELECTED INGREDIENT CARD */}
          {ingredient && (
            <div className="bg-gradient-to-br from-[#F3F0FD] to-[#f8f9ff] p-4 border border-[#7661d3]/20 rounded-xl flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-lg font-bold text-[#7661d3] shadow-sm">
                  {ingredient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#3d326d] text-sm leading-tight">
                      {ingredient.name}
                    </p>
                    {ingredient.isNew && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {ingredient.category || category || "No category"}
                  </p>
                </div>
              </div>
              {!isEditMode && (
                <button
                  onClick={() => setIngredient(null)}
                  className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {/* QUANTITY + UNIT */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Quantity *
              </label>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => {
                  setFormData({ ...formData, quantity: e.target.value });
                  setErrors({ ...errors, quantity: "" });
                }}
                className={`h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none ${
                  errors.quantity ? "border-red-500 focus:ring-red-500/20" : ""
                }`}
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.quantity}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Unit *
              </label>
              <Select
                value={formData.unit}
                onValueChange={(v) => setFormData({ ...formData, unit: v })}
              >
                <SelectTrigger className="h-11 rounded-lg !border !border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-xl">
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* STORAGE LOCATION */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
              Storage Location *
            </label>
            <div className="relative">
              <Select
                value={formData.location}
                onValueChange={(v) => setFormData({ ...formData, location: v })}
              >
                <SelectTrigger className="h-11 rounded-lg !border !border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-sm font-medium shadow-none ps-8">
                  <SelectValue />
                </SelectTrigger>
                <MapPin
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-xl">
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* OPTIONAL FIELDS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Expiration
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expirationDate: e.target.value })
                  }
                  className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none ps-8"
                />
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Cost
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.costPaid}
                  onChange={(e) =>
                    setFormData({ ...formData, costPaid: e.target.value })
                  }
                  className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none ps-8"
                />
                <DollarSign
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
          <Button
            variant="ghost"
            onClick={() => setIsAddModalOpen(false)}
            className="rounded-lg font-medium text-black h-10 bg-gray-200"
          >
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-[#7661d3] to-[#3d326d] font-medium hover:opacity-90 text-white rounded-lg shadow-purple-900/20 h-10 px-8 transition-all active:scale-95"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Accessing Pantry...
              </div>
            ) : (
              <>{isEditMode ? "Save Changes" : "Add Item"}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
