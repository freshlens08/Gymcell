import { Shirt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClothingPicker } from "@/components/closet/clothing-picker";
import { ClosetItemCard } from "@/components/closet/closet-item-card";
import { SplitSettings } from "@/components/closet/split-settings";
import { TodaysOutfitCard } from "@/components/closet/todays-outfit-card";
import { getOutfitPreference, pickOutfitItem, type ClosetItemWithClothing } from "@/lib/outfit-rules";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatFocusLabel(value: string) {
  return value.replace("_", " ").replace(/^./, (char) => char.toUpperCase());
}

function formatFocusList(values: string[]) {
  if (values.length === 0) return null;
  return values.map(formatFocusLabel).join(", ");
}

export default async function ClosetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: closetItems }, { data: catalog }, { data: splits }] = await Promise.all([
    supabase
      .from("closet_items")
      .select("id, photo_url, is_favorite, clothing_item_id, clothing_items(name, brand, category)")
      .eq("user_id", user!.id)
      .order("added_at", { ascending: false }),
    supabase.from("clothing_items").select("id, name, brand, category").order("name"),
    supabase
      .from("training_splits")
      .select("day_of_week, muscle_focus")
      .eq("user_id", user!.id),
  ]);

  const items = (closetItems ?? []) as ClosetItemWithClothing[];
  const todayDayOfWeek = new Date().getDay();
  const todaysFocuses =
    splits?.find((split) => split.day_of_week === todayDayOfWeek)?.muscle_focus ?? [];
  const preference = getOutfitPreference(todaysFocuses);
  const suggestedTop = pickOutfitItem(items, "top", preference.topPreference);
  const suggestedBottom = pickOutfitItem(items, "bottom", preference.bottomPreference);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gym Closet</h1>
          <p className="text-muted-foreground">Your gear, organized.</p>
        </div>
        <ClothingPicker
          catalog={catalog ?? []}
          closetClothingItemIds={items.map((item) => item.clothing_item_id)}
        />
      </div>

      <TodaysOutfitCard
        dayLabel={DAY_LABELS[todayDayOfWeek]}
        focusLabel={formatFocusList(todaysFocuses)}
        top={suggestedTop}
        bottom={suggestedBottom}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Split</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set what you train each day so we can suggest the right outfit.
          </p>
        </CardHeader>
        <CardContent>
          <SplitSettings splits={splits ?? []} />
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Shirt className="size-6 text-primary" />
            </div>
            <p className="font-medium">Your closet is empty</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Search the catalog or take a photo of your own gear to start building your closet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <ClosetItemCard
              key={item.id}
              id={item.id}
              name={item.clothing_items?.name ?? "Item"}
              brand={item.clothing_items?.brand ?? null}
              photoUrl={item.photo_url}
              isFavorite={item.is_favorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
