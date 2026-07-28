"use client";

import { useTransition } from "react";
import Image from "next/image";
import { Heart, Shirt, Trash2 } from "lucide-react";
import { removeFromCloset, toggleFavorite } from "@/app/dashboard/closet/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClosetItemCard({
  id,
  name,
  brand,
  photoUrl,
  catalogImageUrl,
  isFavorite,
}: {
  id: string;
  name: string;
  brand: string | null;
  photoUrl: string | null;
  catalogImageUrl: string | null;
  isFavorite: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const displayImage = photoUrl ?? catalogImageUrl;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative flex aspect-square items-center justify-center bg-muted">
        {displayImage ? (
          <Image src={displayImage} alt={name} fill className="object-cover" />
        ) : (
          <Shirt className="size-10 text-muted-foreground" />
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() => startTransition(() => toggleFavorite(id, !isFavorite))}
          className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur"
        >
          <Heart className={cn("size-4", isFavorite && "fill-primary text-primary")} />
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="min-w-0">
          {brand && <p className="truncate text-xs font-medium text-primary">{brand}</p>}
          <p className="truncate text-sm">{name}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() => startTransition(() => removeFromCloset(id))}
          className="shrink-0 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
