"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/supabase/require-user";
import type { Database } from "@/lib/supabase/database.types";

type ClothingCategory = Database["public"]["Enums"]["clothing_category"];
type ExerciseCategory = Database["public"]["Enums"]["exercise_category"];

export type AddCustomItemState = { error: string | null; success?: boolean };

export async function addFromCatalog(clothingItemId: string) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("closet_items")
    .insert({ user_id: userId, clothing_item_id: clothingItemId })
    .select()
    .single();

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/closet");
}

export async function addCustomItem(
  _prevState: AddCustomItemState,
  formData: FormData,
): Promise<AddCustomItemState> {
  const { supabase, userId } = await requireUserId();

  const name = (formData.get("name") as string)?.trim();
  const category = formData.get("category") as ClothingCategory;
  const photo = formData.get("photo") as File | null;

  if (!name || !category) {
    return { error: "Name and category are required" };
  }

  let photoUrl: string | null = null;

  if (photo && photo.size > 0) {
    const extension = photo.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("closet-photos")
      .upload(path, photo, { contentType: photo.type });

    if (uploadError) return { error: uploadError.message };

    photoUrl = supabase.storage.from("closet-photos").getPublicUrl(path).data.publicUrl;
  }

  const { data: clothingItem, error: clothingError } = await supabase
    .from("clothing_items")
    .insert({ name, category, created_by: userId, is_custom: true })
    .select("id")
    .single();

  if (clothingError || !clothingItem) {
    return { error: clothingError?.message ?? "Failed to create clothing item" };
  }

  const { error: closetError } = await supabase
    .from("closet_items")
    .insert({ user_id: userId, clothing_item_id: clothingItem.id, photo_url: photoUrl });

  if (closetError) return { error: closetError.message };

  revalidatePath("/dashboard/closet");
  return { error: null, success: true };
}

export async function toggleFavorite(closetItemId: string, isFavorite: boolean) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("closet_items")
    .update({ is_favorite: isFavorite })
    .eq("id", closetItemId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/closet");
}

export async function removeFromCloset(closetItemId: string) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("closet_items").delete().eq("id", closetItemId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/closet");
}

export async function upsertTrainingSplit(
  dayOfWeek: number,
  muscleFocuses: ExerciseCategory[],
) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("training_splits")
    .upsert(
      { user_id: userId, day_of_week: dayOfWeek, muscle_focus: muscleFocuses },
      { onConflict: "user_id,day_of_week" },
    );

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/closet");
}
