"use client";

import { useMemo, useState, useTransition } from "react";
import Model, { type IMuscleStats } from "react-body-highlighter";
import { RotateCw, Search } from "lucide-react";
import { logQuickLift, setMuscleExercisePreference } from "@/app/dashboard/actions";
import { type MuscleRegionState } from "@/lib/muscle-map";
import { TIER_COLORS, TIER_LABELS, TIER_ORDER, tierRank } from "@/lib/strength-tiers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/supabase/database.types";

type ExerciseCategory = Database["public"]["Enums"]["exercise_category"];
type CatalogExercise = { id: string; name: string; category: ExerciseCategory };

const BODY_COLOR = "color-mix(in oklch, var(--muted), var(--background) 20%)";
const HIGHLIGHTED_COLORS = TIER_ORDER.map((tier) => TIER_COLORS[tier]);

export function BodyDiagram({
  states,
  catalog,
}: {
  states: MuscleRegionState[];
  catalog: CatalogExercise[];
}) {
  const [flipped, setFlipped] = useState(false);
  const [activeState, setActiveState] = useState<MuscleRegionState | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isPending, startTransition] = useTransition();

  const libraryData = useMemo(
    () =>
      states
        .filter((s) => s.tier !== null && s.exerciseName)
        .map((s) => ({
          name: s.exerciseName!,
          muscles: [s.region.id],
          frequency: tierRank(s.tier!),
        })),
    [states],
  );

  function handleMuscleClick(stat: IMuscleStats) {
    const state = states.find((s) => s.region.id === stat.muscle);
    if (!state) return;
    setActiveState(state);
    setSelectedExercise(
      state.exerciseId && state.exerciseName
        ? { id: state.exerciseId, name: state.exerciseName }
        : null,
    );
    setQuery("");
    setWeight("");
    setReps("");
  }

  function closeDialog() {
    setActiveState(null);
    setSelectedExercise(null);
  }

  function handlePickExercise(exercise: CatalogExercise) {
    if (!activeState) return;
    setSelectedExercise({ id: exercise.id, name: exercise.name });
    startTransition(() => {
      setMuscleExercisePreference(activeState.region.id, exercise.id);
    });
  }

  function handleSaveWeight() {
    if (!selectedExercise || !weight) return;
    startTransition(async () => {
      await logQuickLift(selectedExercise.id, Number(weight), reps ? Number(reps) : 1);
      closeDialog();
    });
  }

  const filteredCatalog = useMemo(() => {
    if (!activeState) return [];
    const inCategory = catalog.filter(
      (item) => item.category === activeState.region.exerciseCategory,
    );
    if (!query.trim()) return inCategory;
    const q = query.toLowerCase();
    return inCategory.filter((item) => item.name.toLowerCase().includes(q));
  }, [activeState, catalog, query]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {flipped ? "Back" : "Front"} — tap a muscle to log
        </p>
        <Button type="button" variant="outline" size="icon-sm" onClick={() => setFlipped((f) => !f)}>
          <RotateCw className="size-4" />
        </Button>
      </div>

      <div style={{ perspective: "1200px" }} className="h-80 w-56">
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.6s ease",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Model
              type="anterior"
              data={libraryData}
              bodyColor={BODY_COLOR}
              highlightedColors={HIGHLIGHTED_COLORS}
              onClick={handleMuscleClick}
              svgStyle={{ width: "auto", height: "100%" }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Model
              type="posterior"
              data={libraryData}
              bodyColor={BODY_COLOR}
              highlightedColors={HIGHLIGHTED_COLORS}
              onClick={handleMuscleClick}
              svgStyle={{ width: "auto", height: "100%" }}
            />
          </div>
        </div>
      </div>

      <Dialog open={activeState !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[80vh] gap-4">
          {selectedExercise ? (
            <>
              <DialogHeader>
                <DialogTitle>{activeState?.region.label}</DialogTitle>
                <DialogDescription>
                  {selectedExercise.name}
                  {activeState?.tier && (
                    <>
                      {" "}
                      — current:{" "}
                      <span style={{ color: TIER_COLORS[activeState.tier] }}>
                        {TIER_LABELS[activeState.tier]}
                      </span>{" "}
                      ({activeState.weight} lbs)
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-end gap-3">
                <div className="flex flex-1 flex-col gap-2">
                  <Label htmlFor="quick-log-weight">Weight (lbs)</Label>
                  <Input
                    id="quick-log-weight"
                    type="number"
                    inputMode="decimal"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex w-24 flex-col gap-2">
                  <Label htmlFor="quick-log-reps">Reps</Label>
                  <Input
                    id="quick-log-reps"
                    type="number"
                    inputMode="numeric"
                    placeholder="1"
                    value={reps}
                    onChange={(event) => setReps(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  onClick={() => setSelectedExercise(null)}
                >
                  Change exercise
                </button>
              </div>

              <Button type="button" disabled={!weight || isPending} onClick={handleSaveWeight}>
                {isPending ? "Saving…" : "Save"}
              </Button>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Choose a {activeState?.region.label} exercise</DialogTitle>
                <DialogDescription>
                  Pick what you want to track for this muscle.
                </DialogDescription>
              </DialogHeader>

              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search exercises…"
                  className="pl-9"
                  autoFocus
                />
              </div>

              <div className="-mx-1 flex max-h-72 flex-col gap-1 overflow-y-auto px-1">
                {filteredCatalog.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No exercises found.
                  </p>
                )}
                {filteredCatalog.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => handlePickExercise(exercise)}
                    className="rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    {exercise.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
