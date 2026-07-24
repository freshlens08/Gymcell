import Image from "next/image";
import { Shirt, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClosetItemWithClothing } from "@/lib/outfit-rules";

function OutfitSlot({ item, fallbackLabel }: { item: ClosetItemWithClothing | null; fallbackLabel: string }) {
  if (!item) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-6 text-center">
        <Shirt className="size-5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">No {fallbackLabel} in closet yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-lg border border-border py-4 text-center">
      <div className="relative flex size-14 items-center justify-center rounded-md bg-muted">
        {item.photo_url ? (
          <Image src={item.photo_url} alt={item.clothing_items?.name ?? ""} fill className="rounded-md object-cover" />
        ) : (
          <Shirt className="size-6 text-muted-foreground" />
        )}
      </div>
      <p className="text-sm font-medium">{item.clothing_items?.name}</p>
    </div>
  );
}

export function TodaysOutfitCard({
  dayLabel,
  focusLabel,
  top,
  bottom,
}: {
  dayLabel: string;
  focusLabel: string | null;
  top: ClosetItemWithClothing | null;
  bottom: ClosetItemWithClothing | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" />
          Today&apos;s Outfit
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {dayLabel}
          {focusLabel ? ` — ${focusLabel} day` : " — Rest day"}
        </p>
      </CardHeader>
      <CardContent className="flex gap-3">
        <OutfitSlot item={top} fallbackLabel="tops" />
        <OutfitSlot item={bottom} fallbackLabel="bottoms" />
      </CardContent>
    </Card>
  );
}
