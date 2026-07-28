import type { Database } from "@/lib/supabase/database.types";

type ExerciseCategory = Database["public"]["Enums"]["exercise_category"];
type ClothingCategory = Database["public"]["Enums"]["clothing_category"];

export type ClosetItemWithClothing = {
  id: string;
  clothing_item_id: string;
  photo_url: string | null;
  is_favorite: boolean;
  clothing_items: {
    name: string;
    brand: string | null;
    category: ClothingCategory;
    image_url: string | null;
  } | null;
};

const UPPER_BODY_FOCUSES = new Set<ExerciseCategory>([
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "arms",
]);

const LOWER_BODY_FOCUSES = new Set<ExerciseCategory>([
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "legs",
]);

type OutfitPreference = { topPreference: string[]; bottomPreference: string[] };

const UPPER_BODY_DAY: OutfitPreference = {
  topPreference: ["Compression Shirt", "Long Sleeve Shirt", "Tank Top"],
  bottomPreference: ["Sweatpants", "Joggers", "Track Pants"],
};

const LOWER_BODY_DAY: OutfitPreference = {
  topPreference: ["Tank Top", "T-Shirt"],
  bottomPreference: ["Shorts", "Compression Leggings"],
};

const GENERAL_DAY: OutfitPreference = {
  topPreference: ["T-Shirt", "Tank Top"],
  bottomPreference: ["Shorts", "Joggers"],
};

export function getOutfitPreference(muscleFocuses: ExerciseCategory[]): OutfitPreference {
  const hasUpper = muscleFocuses.some((focus) => UPPER_BODY_FOCUSES.has(focus));
  const hasLower = muscleFocuses.some((focus) => LOWER_BODY_FOCUSES.has(focus));

  if (hasUpper && !hasLower) return UPPER_BODY_DAY;
  if (hasLower && !hasUpper) return LOWER_BODY_DAY;
  return GENERAL_DAY;
}

export function pickOutfitItem(
  items: ClosetItemWithClothing[],
  category: ClothingCategory,
  preferenceNames: string[],
): ClosetItemWithClothing | null {
  const inCategory = items.filter((item) => item.clothing_items?.category === category);
  if (inCategory.length === 0) return null;

  for (const name of preferenceNames) {
    const match = inCategory.find(
      (item) => item.clothing_items?.name === name && item.is_favorite,
    );
    if (match) return match;
  }
  for (const name of preferenceNames) {
    const match = inCategory.find((item) => item.clothing_items?.name === name);
    if (match) return match;
  }

  return inCategory.find((item) => item.is_favorite) ?? inCategory[0];
}
