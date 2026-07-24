"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { Camera, Plus, Search } from "lucide-react";
import {
  addCustomItem,
  addFromCatalog,
  type AddCustomItemState,
} from "@/app/dashboard/closet/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/lib/supabase/database.types";

type ClothingCategory = Database["public"]["Enums"]["clothing_category"];

type ClothingItem = { id: string; name: string; category: ClothingCategory };

const CATEGORY_OPTIONS: { value: ClothingCategory; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "outerwear", label: "Outerwear" },
  { value: "footwear", label: "Footwear" },
  { value: "accessory", label: "Accessory" },
];

const initialState: AddCustomItemState = { error: null };

export function ClothingPicker({
  catalog,
  closetClothingItemIds,
}: {
  catalog: ClothingItem[];
  closetClothingItemIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [state, formAction, isSubmitting] = useActionState(addCustomItem, initialState);
  const [handledState, setHandledState] = useState(state);

  const available = useMemo(
    () => catalog.filter((item) => !closetClothingItemIds.includes(item.id)),
    [catalog, closetClothingItemIds],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return available;
    const q = query.toLowerCase();
    return available.filter((item) => item.name.toLowerCase().includes(q));
  }, [available, query]);

  function handleSelect(clothingItemId: string) {
    startTransition(async () => {
      await addFromCatalog(clothingItemId);
      setOpen(false);
      setQuery("");
    });
  }

  if (state !== handledState) {
    setHandledState(state);
    if (state.success) {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="self-start" />}>
        <Plus />
        Add to closet
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] gap-4">
        <DialogHeader>
          <DialogTitle>Add to closet</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search">
          <TabsList className="w-full">
            <TabsTrigger value="search" className="flex-1">
              Search
            </TabsTrigger>
            <TabsTrigger value="photo" className="flex-1">
              Take a photo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search clothing…"
                className="pl-9"
              />
            </div>

            <div className="-mx-1 flex max-h-72 flex-col gap-1 overflow-y-auto px-1">
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No items found.
                </p>
              )}
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSelect(item.id)}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
                >
                  <span>{item.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="photo">
            <form action={formAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="closet-photo">Photo</Label>
                <label
                  htmlFor="closet-photo"
                  className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-sm text-muted-foreground hover:bg-accent"
                >
                  <Camera className="size-6" />
                  Tap to take a photo or choose one
                </label>
                <input
                  id="closet-photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="closet-item-name">Name</Label>
                <Input id="closet-item-name" name="name" placeholder="e.g. Nike Dri-FIT Tee" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="closet-item-category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger id="closet-item-category" className="w-full">
                    <SelectValue placeholder="Select a category">
                      {(value: ClothingCategory | null) =>
                        CATEGORY_OPTIONS.find((option) => option.value === value)?.label ??
                        "Select a category"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {state.error && (
                <p className="text-sm text-destructive" role="alert">
                  {state.error}
                </p>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding…" : "Add to closet"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
