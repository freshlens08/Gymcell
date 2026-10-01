export type ClubCategory = "wood" | "hybrid" | "iron" | "wedge" | "putter";

export interface Club {
  id: number; // matches the clubId a PinPoint Tag reports
  name: string;
  short: string;
  category: ClubCategory;
  loftDeg: number;
  // Typical amateur club speed range, used by the simulator and for context.
  typicalSpeedMph: [number, number];
}

export const CLUBS: Club[] = [
  { id: 1, name: "Driver", short: "Dr", category: "wood", loftDeg: 10.5, typicalSpeedMph: [88, 105] },
  { id: 2, name: "3 Wood", short: "3W", category: "wood", loftDeg: 15, typicalSpeedMph: [84, 98] },
  { id: 3, name: "4 Hybrid", short: "4H", category: "hybrid", loftDeg: 22, typicalSpeedMph: [80, 92] },
  { id: 5, name: "5 Iron", short: "5i", category: "iron", loftDeg: 25, typicalSpeedMph: [78, 88] },
  { id: 6, name: "6 Iron", short: "6i", category: "iron", loftDeg: 28, typicalSpeedMph: [76, 86] },
  { id: 7, name: "7 Iron", short: "7i", category: "iron", loftDeg: 32, typicalSpeedMph: [74, 84] },
  { id: 8, name: "8 Iron", short: "8i", category: "iron", loftDeg: 36, typicalSpeedMph: [72, 82] },
  { id: 9, name: "9 Iron", short: "9i", category: "iron", loftDeg: 41, typicalSpeedMph: [70, 80] },
  { id: 10, name: "Pitching Wedge", short: "PW", category: "wedge", loftDeg: 46, typicalSpeedMph: [68, 78] },
  { id: 11, name: "Sand Wedge", short: "SW", category: "wedge", loftDeg: 56, typicalSpeedMph: [60, 72] },
  { id: 12, name: "Putter", short: "Pt", category: "putter", loftDeg: 3, typicalSpeedMph: [4, 10] },
];

export function clubById(id: number): Club | undefined {
  return CLUBS.find((c) => c.id === id);
}

// Rough carry estimate from club speed and loft. It's good enough to put a
// number on screen, not a launch monitor.
export function estimateCarryYds(club: Club, speedMph: number, quality: number): number {
  if (club.category === "putter") return 0;
  const efficiency = 2.6 - club.loftDeg * 0.018; // yards per mph
  const strike = 0.82 + (quality / 100) * 0.18;
  return Math.max(0, Math.round(speedMph * efficiency * strike));
}
