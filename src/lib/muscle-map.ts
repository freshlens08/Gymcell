export type BodyView = "front" | "back";

export type MuscleRegion = {
  id: string;
  label: string;
  view: BodyView;
  exerciseName: string;
};

export const MUSCLE_REGIONS: MuscleRegion[] = [
  { id: "chest", label: "Chest", view: "front", exerciseName: "Barbell Bench Press" },
  { id: "shoulders", label: "Shoulders", view: "front", exerciseName: "Overhead Press" },
  { id: "biceps", label: "Biceps", view: "front", exerciseName: "Barbell Curl" },
  { id: "quads", label: "Quads", view: "front", exerciseName: "Barbell Back Squat" },
  { id: "back", label: "Back", view: "back", exerciseName: "Barbell Deadlift" },
  { id: "triceps", label: "Triceps", view: "back", exerciseName: "Close-Grip Bench Press" },
  { id: "hamstrings", label: "Hamstrings", view: "back", exerciseName: "Romanian Deadlift" },
  { id: "calves", label: "Calves", view: "back", exerciseName: "Standing Calf Raise" },
];
