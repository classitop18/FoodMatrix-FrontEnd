import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export interface CheckboxItem {
    id: string;
    label: string;
}

interface MultiSelectDropdownProps {
    label?: string;
    items: CheckboxItem[];
    selected: string[];
    onChange: (updated: string[]) => void;
}

export function MultiSelectDropdown({
    label = "Select",                       
    items,
    selected,
    onChange,
}: MultiSelectDropdownProps) {
    const allSelected = selected.length === items.length;
    const toggleOne = (id: string) => {
        const updated = selected.includes(id)
            ? selected.filter((s) => s !== id)
            : [...selected, id];

        onChange(updated);
    };

    const toggleAll = () => {
        onChange(allSelected ? [] : items.map((i) => i.id));
    };

    const displayLabel =
        selected.length === 0
            ? label
            : allSelected
                ? `All Selected`
                : `${selected.length} selected`;

    return (
        <Popover>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:border-blue-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            {label}
        </label>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full h-11 bg-white dark:bg-gray-950 justify-between"
                >
                    {displayLabel}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-3 space-y-3">
                {/* Select All */}
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={toggleAll}
                >
                    <Checkbox checked={allSelected} />
                    <span className="font-medium">Select All</span>
                </div>
                <div className="border-t" />
                {/* Items List */}
                <div className="space-y-2 max-h-56 overflow-auto">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => toggleOne(item.id)}
                        >
                            <Checkbox checked={selected.includes(item.id)} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
