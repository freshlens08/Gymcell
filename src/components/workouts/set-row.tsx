"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { deleteSet, updateSet } from "@/app/dashboard/workouts/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Set = {
  id: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
};

export function SetRow({ set, workoutId }: { set: Set; workoutId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(field: "weight" | "reps", raw: string) {
    const value = raw === "" ? null : Number(raw);
    if (value !== null && Number.isNaN(value)) return;

    startTransition(() => {
      updateSet(set.id, workoutId, { [field]: value });
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="w-5 text-sm text-muted-foreground">{set.set_number}</span>
      <Input
        type="number"
        inputMode="decimal"
        defaultValue={set.weight ?? ""}
        onBlur={(event) => handleChange("weight", event.target.value)}
        placeholder="Weight"
        className="w-24"
        disabled={isPending}
      />
      <Input
        type="number"
        inputMode="numeric"
        defaultValue={set.reps ?? ""}
        onBlur={(event) => handleChange("reps", event.target.value)}
        placeholder="Reps"
        className="w-20"
        disabled={isPending}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={() => startTransition(() => deleteSet(set.id, workoutId))}
      >
        <X />
      </Button>
    </div>
  );
}
