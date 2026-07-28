"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/app/onboarding/actions";
import { SPLIT_TEMPLATES, type SplitTemplateId } from "@/lib/split-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SplitSettings } from "@/components/closet/split-settings";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";

type ExperienceLevel = Database["public"]["Enums"]["experience_level"];
type WorkoutLocation = Database["public"]["Enums"]["workout_location"];
type ExerciseCategory = Database["public"]["Enums"]["exercise_category"];

const STEP_TITLES = ["Tell us about you", "Your current strength", "Your weekly split"];
const STEP_DESCRIPTIONS = [
  "This helps us personalize your training and goals.",
  "Optional — enter your current best if you know it.",
  "Pick a template to get started, or set it up later in your Closet.",
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LOCATION_OPTIONS: { value: WorkoutLocation; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "gym", label: "Gym" },
  { value: "both", label: "Both" },
];

function ToggleChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button type="button" variant={selected ? "default" : "outline"} onClick={onClick}>
      {children}
    </Button>
  );
}

export function OnboardingFlow({
  initialSplits,
}: {
  initialSplits: { day_of_week: number; muscle_focus: ExerciseCategory[] }[];
}) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [useCustomSplit, setUseCustomSplit] = useState(false);

  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [workoutLocation, setWorkoutLocation] = useState<WorkoutLocation | null>(null);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<number | null>(null);

  const [benchLbs, setBenchLbs] = useState("");
  const [benchReps, setBenchReps] = useState("");
  const [squatLbs, setSquatLbs] = useState("");
  const [squatReps, setSquatReps] = useState("");
  const [deadliftLbs, setDeadliftLbs] = useState("");
  const [deadliftReps, setDeadliftReps] = useState("");

  const [splitTemplateId, setSplitTemplateId] = useState<SplitTemplateId | null>(null);

  function handleFinish() {
    const heightInches =
      feet || inches ? Number(feet || 0) * 12 + Number(inches || 0) : null;

    startTransition(() => {
      completeOnboarding({
        heightInches,
        currentWeightLbs: currentWeight ? Number(currentWeight) : null,
        goalWeightLbs: goalWeight ? Number(goalWeight) : null,
        experienceLevel,
        workoutLocation,
        workoutsPerWeek,
        prs: {
          benchLbs: benchLbs ? Number(benchLbs) : null,
          benchReps: benchReps ? Number(benchReps) : null,
          squatLbs: squatLbs ? Number(squatLbs) : null,
          squatReps: squatReps ? Number(squatReps) : null,
          deadliftLbs: deadliftLbs ? Number(deadliftLbs) : null,
          deadliftReps: deadliftReps ? Number(deadliftReps) : null,
        },
        splitTemplateId,
      });
    });
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 flex items-center gap-2">
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            className={cn("h-1 flex-1 rounded-full", s <= step ? "bg-primary" : "bg-muted")}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{STEP_TITLES[step]}</CardTitle>
          <CardDescription>{STEP_DESCRIPTIONS[step]}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {step === 0 && (
            <>
              <div className="flex flex-col gap-2">
                <Label>Height</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Feet"
                    value={feet}
                    onChange={(event) => setFeet(event.target.value)}
                    className="w-24"
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Inches"
                    value={inches}
                    onChange={(event) => setInches(event.target.value)}
                    className="w-24"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="current-weight">Current weight (lbs)</Label>
                  <Input
                    id="current-weight"
                    type="number"
                    inputMode="decimal"
                    value={currentWeight}
                    onChange={(event) => setCurrentWeight(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="goal-weight">Goal weight (lbs)</Label>
                  <Input
                    id="goal-weight"
                    type="number"
                    inputMode="decimal"
                    value={goalWeight}
                    onChange={(event) => setGoalWeight(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Experience level</Label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <ToggleChip
                      key={option.value}
                      selected={experienceLevel === option.value}
                      onClick={() => setExperienceLevel(option.value)}
                    >
                      {option.label}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Where do you train?</Label>
                <div className="flex flex-wrap gap-2">
                  {LOCATION_OPTIONS.map((option) => (
                    <ToggleChip
                      key={option.value}
                      selected={workoutLocation === option.value}
                      onClick={() => setWorkoutLocation(option.value)}
                    >
                      {option.label}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Workouts per week</Label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <ToggleChip
                      key={n}
                      selected={workoutsPerWeek === n}
                      onClick={() => setWorkoutsPerWeek(n)}
                    >
                      {n}
                    </ToggleChip>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              {[
                { label: "Bench Press", weight: benchLbs, setWeight: setBenchLbs, reps: benchReps, setReps: setBenchReps },
                { label: "Squat", weight: squatLbs, setWeight: setSquatLbs, reps: squatReps, setReps: setSquatReps },
                { label: "Deadlift", weight: deadliftLbs, setWeight: setDeadliftLbs, reps: deadliftReps, setReps: setDeadliftReps },
              ].map((lift) => (
                <div key={lift.label} className="flex items-end gap-3">
                  <div className="flex flex-1 flex-col gap-2">
                    <Label>{lift.label} — weight (lbs)</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={lift.weight}
                      onChange={(event) => lift.setWeight(event.target.value)}
                    />
                  </div>
                  <div className="flex w-24 flex-col gap-2">
                    <Label>Reps</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="1"
                      value={lift.reps}
                      onChange={(event) => lift.setReps(event.target.value)}
                    />
                  </div>
                </div>
              ))}
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {SPLIT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      setUseCustomSplit(false);
                      setSplitTemplateId((current) =>
                        current === template.id ? null : template.id,
                      );
                    }}
                    className={cn(
                      "rounded-lg border px-4 py-3 text-left transition-colors",
                      !useCustomSplit && splitTemplateId === template.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    <p className="font-medium">{template.label}</p>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSplitTemplateId(null);
                    setUseCustomSplit((current) => !current);
                  }}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left transition-colors",
                    useCustomSplit
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent",
                  )}
                >
                  <p className="font-medium">Build your own</p>
                  <p className="text-sm text-muted-foreground">
                    Pick exactly what you train each day
                  </p>
                </button>
              </div>

              {useCustomSplit && (
                <div className="rounded-lg border border-border p-4">
                  <SplitSettings splits={initialSplits} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </Button>
        {step < 2 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button type="button" disabled={isPending} onClick={handleFinish}>
            {isPending ? "Saving…" : "Finish"}
          </Button>
        )}
      </div>
    </div>
  );
}
