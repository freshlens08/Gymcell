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
  photoUrl,
  isFavorite,
}: {
  id: string;
  name: string;
  photoUrl: string | null;
  isFavorite: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative flex aspect-square items-center justify-center bg-muted">
        {photoUrl ? (
          <Image src={photoUrl} alt={name} fill className="object-cover" />
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
        <p className="truncate text-sm">{name}</p>
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
