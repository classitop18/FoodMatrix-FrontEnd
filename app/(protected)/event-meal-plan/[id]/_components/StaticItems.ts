import { MealType } from "@/services/event/event.types";

export const STATIC_ITEMS: Partial<Record<MealType, string[]>> = {
    snacks: [
        "Samosa",
        "Paneer Tikka",
        "Vegetable Pakora",
        "Aloo Tikki",
        "Hara Bhara Kabab",
        "Spring Rolls",
        "Dhokla",
        "Khandvi",
        "Chaat Widget",
        "French Fries",
        "Nachos with Salsa",
        "Mini Pizzas",
        "Cheese Balls",
        "Mushroom Tikka",
        "Masala Chai",
        "Coffee",
        "Cookies",
        "Biscuits",
        "Sandwich (Veg)",
        "Cake Rusk",
        "Cream Roll",
        "Puff Pastry"
    ],
    beverages: [
        "Masala Chai",
        "Filter Coffee",
        "Fresh Lime Soda",
        "Lassi (Sweet/Salted)",
        "Butter Milk (Chaas)",
        "Fruit Punch",
        "Mojito (Virgin)",
        "Soft Drinks",
        "Mineral Water",
        "Thandai",
        "Badam Milk",
        "Iced Tea",
        "Cold Coffee"
    ],
    dessert: [
        "Gulab Jamun",
        "Rasgulla",
        "Ice Cream (Vanilla)",
        "Ice Cream (Chocolate)",
        "Jalebi",
        "Rabri",
        "Kheer",
        "Gajar Ka Halwa",
        "Moong Dal Halwa",
        "Rasmalai",
        "Brownie with Ice Cream",
        "Fruit Salad"
    ],
    breakfast: [
        "Poha",
        "Upma",
        "Aloo Paratha",
        "Idli Sambar",
        "Dosa",
        "Puri Bhaji",
        "Chole Bhature",
        "Sandwich",
        "Oats",
        "Cornflakes"
    ],
    lunch: [
        "Dal Makhani",
        "Paneer Butter Masala",
        "Roti/Naan",
        "Jeera Rice",
        "Salad",
        "Raita",
        "Mix Veg",
        "Chole"
    ],
    dinner: [
        "Dal Tadka",
        "Shahi Paneer",
        "Malai Kofta",
        "Butter Naan",
        "Pulao",
        "Soup",
        "Salad",
        "Papad"
    ]
};
