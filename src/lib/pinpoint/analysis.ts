import { CLUBS, clubById, estimateCarryYds } from "./clubs";
import { SwingFlags, type SwingPacket } from "./protocol";

export interface Swing extends SwingPacket {
  id: string;
  at: number; // epoch ms
  tempoRatio: number;
  carryYds: number;
  shape: ShotShape;
  score: number;
}

export type ShotShape =
  | "Straight"
  | "Draw"
  | "Fade"
  | "Hook"
  | "Slice"
  | "Push"
  | "Pull";

// Ball flight laws: start direction is mostly face angle, curve is face-to-path.
export function shotShape(faceDeg: number, pathDeg: number): ShotShape {
  const faceToPath = faceDeg - pathDeg;
  if (Math.abs(faceToPath) <= 1.5) {
    if (faceDeg > 3) return "Push";
    if (faceDeg < -3) return "Pull";
    return "Straight";
  }
  if (faceToPath > 0) return faceToPath > 5 ? "Slice" : "Fade";
  return faceToPath < -5 ? "Hook" : "Draw";
}

// Tour players sit close to 3:1 backswing:downswing.
export const IDEAL_TEMPO = 3;

// 0-100 composite of tempo, face control, and strike.
export function swingScore(p: SwingPacket): number {
  const tempo = p.backswingMs / Math.max(1, p.downswingMs);
  const tempoPts = Math.max(0, 1 - Math.abs(tempo - IDEAL_TEMPO) / 1.5) * 30;
  const facePts = Math.max(0, 1 - Math.abs(p.faceAngleDeg - p.clubPathDeg) / 8) * 30;
  const strikePts = (p.impactQuality / 100) * 40;
  return Math.round(tempoPts + facePts + strikePts);
}

export function toSwing(p: SwingPacket, at = Date.now()): Swing {
  const club = clubById(p.clubId) ?? CLUBS[0];
  return {
    ...p,
    id: `${at}-${p.seq}`,
    at,
    tempoRatio: Math.round((p.backswingMs / Math.max(1, p.downswingMs)) * 10) / 10,
    carryYds:
      p.flags & SwingFlags.PracticeSwing ? 0 : estimateCarryYds(club, p.clubSpeedMph, p.impactQuality),
    shape: shotShape(p.faceAngleDeg, p.clubPathDeg),
    score: swingScore(p),
  };
}

export interface Tip {
  title: string;
  body: string;
  tone: "good" | "warn";
}

export function coachingTips(s: Swing): Tip[] {
  const tips: Tip[] = [];
  if (s.tempoRatio < 2.5) {
    tips.push({
      title: "Quick transition",
      body: `Your tempo is ${s.tempoRatio}:1. Let the backswing finish before starting down, aiming for about 3:1.`,
      tone: "warn",
    });
  } else if (s.tempoRatio > 3.6) {
    tips.push({
      title: "Slow backswing",
      body: `Your tempo is ${s.tempoRatio}:1. Keep the takeaway moving so you don't decelerate at the top.`,
      tone: "warn",
    });
  } else {
    tips.push({ title: "Smooth tempo", body: `${s.tempoRatio}:1 is right in the tour window.`, tone: "good" });
  }

  const f2p = s.faceAngleDeg - s.clubPathDeg;
  if (f2p > 4) {
    tips.push({
      title: "Face open to path",
      body: "The face is open to the path, which adds slice spin. Try a stronger grip or rotating the forearms through impact.",
      tone: "warn",
    });
  } else if (f2p < -4) {
    tips.push({
      title: "Face closed to path",
      body: "The face is closed to the path, which curves the ball left. Hold the face longer through the ball.",
      tone: "warn",
    });
  }

  if (s.clubPathDeg < -4) {
    tips.push({
      title: "Over the top",
      body: "Your path is out-to-in. Feel the trail elbow drop into your side as you start down.",
      tone: "warn",
    });
  }

  const club = clubById(s.clubId);
  if (club && club.category === "iron" && s.attackAngleDeg > 0) {
    tips.push({
      title: "Hitting up on irons",
      body: "Irons want a descending blow. Shift pressure to your lead side before impact.",
      tone: "warn",
    });
  }
  if (club?.category === "wood" && club.id === 1 && s.attackAngleDeg < -2) {
    tips.push({
      title: "Hitting down on driver",
      body: "Tee it higher and set the ball off your lead heel so you catch it on the upswing.",
      tone: "warn",
    });
  }

  if (s.impactQuality >= 85) {
    tips.push({ title: "Flushed it", body: "That was a centered strike.", tone: "good" });
  } else if (s.impactQuality < 60) {
    tips.push({
      title: "Off-center strike",
      body: "Contact was well off the sweet spot. Check your ball position and keep your posture through the swing.",
      tone: "warn",
    });
  }
  return tips;
}

export function average(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}
