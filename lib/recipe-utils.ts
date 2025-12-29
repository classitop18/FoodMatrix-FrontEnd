export const getComplementaryItems = (cuisine: string, mealType: string) => {
    const items: Array<{ name: string; quantity: string; unit: string; cost: number; optional?: boolean }> = [];

    switch (cuisine.toLowerCase()) {
        case 'indian':
            items.push(
                { name: 'Basmati Rice', quantity: '1', unit: 'cup', cost: 2.50 },
                { name: 'Whole Wheat Naan', quantity: '2', unit: 'pieces', cost: 3.00, optional: true },
                { name: 'Plain Naan', quantity: '2', unit: 'pieces', cost: 2.50, optional: true }
            );
            break;
        case 'mediterranean':
            items.push(
                { name: 'Pita Bread', quantity: '4', unit: 'pieces', cost: 2.00 },
                { name: 'Brown Rice', quantity: '1', unit: 'cup', cost: 1.50, optional: true }
            );
            break;
        case 'mexican':
            items.push(
                { name: 'Cilantro Rice', quantity: '1', unit: 'cup', cost: 2.00 },
                { name: 'Corn Tortillas', quantity: '6', unit: 'pieces', cost: 2.50, optional: true }
            );
            break;
        case 'italian':
            items.push(
                { name: 'Garlic Bread', quantity: '4', unit: 'slices', cost: 3.00 },
                { name: 'Parmesan Cheese', quantity: '50', unit: 'g', cost: 4.00, optional: true }
            );
            break;
        default:
            items.push(
                { name: 'White Rice', quantity: '1', unit: 'cup', cost: 1.50 },
                { name: 'Dinner Rolls', quantity: '2', unit: 'pieces', cost: 2.00, optional: true }
            );
    }

    return items;
};

export const getCuisineColor = (cuisine: string) => {
    const colors: Record<string, string> = {
        indian: "bg-gradient-to-r from-orange-500 to-red-500",
        mediterranean: "bg-gradient-to-r from-blue-500 to-cyan-500",
        mexican: "bg-gradient-to-r from-green-500 to-lime-500",
        italian: "bg-gradient-to-r from-red-500 to-pink-500",
        asian: "bg-gradient-to-r from-purple-500 to-indigo-500",
    };
    return colors[cuisine] || "bg-gradient-to-r from-gray-500 to-slate-500";
};
