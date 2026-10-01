import { CLUBS, clubById } from "./clubs";
import { Emitter, type PinPointLink } from "./link";
import {
  ControlOp,
  PROTOCOL_VERSION,
  SwingFlags,
  TagFlags,
  decodeSwing,
  decodeTag,
  encodeSwing,
  encodeTag,
} from "./protocol";

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

// A fake hub for demos and for developing without hardware. It encodes real
// packets and decodes them again, so it exercises the same protocol code as a
// real device.
export class DemoLink extends Emitter implements PinPointLink {
  readonly kind = "demo" as const;
  readonly deviceName = "PinPoint Hub (Demo)";
  readonly firmware = "1.4.2-demo";

  private timers: ReturnType<typeof setInterval>[] = [];
  private seq = 0;
  private activeClub = 7;
  private battery = 86;
  private sessionActive = false;
  // The sand wedge was left by the last green so "Find my club" has something to find.
  private lostClub = 11;
  private locating = false;
  private lostRssi?: number;

  async connect(): Promise<void> {
    this.emit("status", "connecting");
    await new Promise((r) => setTimeout(r, 900));
    this.emit("status", "connected");
    this.emit("battery", this.battery);
    this.broadcastTags();
    this.timers.push(setInterval(() => this.broadcastTags(), 2500));
    this.timers.push(
      setInterval(() => {
        if (this.sessionActive) this.swing();
      }, 6500),
    );
    this.timers.push(
      setInterval(() => {
        this.battery = Math.max(5, this.battery - 1);
        this.emit("battery", this.battery);
      }, 60_000),
    );
  }

  disconnect(): void {
    this.timers.forEach(clearInterval);
    this.timers = [];
    this.sessionActive = false;
    this.emit("status", "disconnected");
  }

  async send(op: ControlOp, arg = 0): Promise<void> {
    switch (op) {
      case ControlOp.StartSession:
        this.sessionActive = true;
        setTimeout(() => this.sessionActive && this.swing(), 1500);
        break;
      case ControlOp.EndSession:
        this.sessionActive = false;
        break;
      case ControlOp.SetActiveClub:
        if (clubById(arg)) this.activeClub = arg;
        break;
      case ControlOp.Locate:
        // Walking toward the beeping club makes the signal climb.
        if (arg === this.lostClub) this.locating = true;
        break;
      case ControlOp.Calibrate:
        break;
    }
  }

  // Lets the UI trigger a swing on demand.
  simulateSwing() {
    this.swing();
  }

  private broadcastTags() {
    for (const club of CLUBS) {
      const lost = club.id === this.lostClub;
      let rssi = lost ? rand(-92, -86) : rand(-58, -44);
      if (lost && this.locating) {
        this.lostRssi = Math.min(-40, (this.lostRssi ?? -88) + rand(2, 6));
        rssi = this.lostRssi;
        if (rssi >= -45) {
          this.locating = false;
          this.lostClub = -1;
        }
      }
      const battery = club.id === 3 ? 14 : 60 + ((club.id * 37) % 40);
      let flags = lost ? 0 : TagFlags.InBag;
      if (battery < 20) flags |= TagFlags.LowBattery;
      if (club.id === this.activeClub && this.sessionActive) flags = TagFlags.Moving;
      const packet = encodeTag({
        clubId: club.id,
        rssi,
        battery,
        flags,
        lastMovedSec: lost ? 1860 : club.id === this.activeClub ? 4 : 600 + club.id * 45,
      });
      this.emit("tag", decodeTag(packet));
    }
  }

  private swing() {
    const club = clubById(this.activeClub) ?? CLUBS[0];
    const [lo, hi] = club.typicalSpeedMph;
    const putter = club.category === "putter";
    // A typical amateur: slightly out-to-in, face a touch open.
    const path = putter ? gauss() * 1.2 : -2.2 + gauss() * 3.5;
    const face = putter ? gauss() * 1.5 : path + 1.8 + gauss() * 3.2;
    const downswing = putter ? rand(380, 460) : rand(240, 300);
    const tempo = putter ? rand(1.8, 2.2) : 3 + gauss() * 0.7;
    const packet = encodeSwing({
      version: PROTOCOL_VERSION,
      clubId: club.id,
      seq: ++this.seq,
      clubSpeedMph: rand(lo, hi),
      backswingMs: downswing * tempo,
      downswingMs: downswing,
      faceAngleDeg: face,
      clubPathDeg: path,
      attackAngleDeg:
        club.category === "wood" && club.id === 1 ? 1 + gauss() * 3 : putter ? 1 + gauss() : -4 + gauss() * 2.5,
      swingPlaneDeg: 90 - club.loftDeg * 0.2 - (club.category === "wood" ? 38 : 30) + gauss() * 3,
      impactQuality: Math.max(20, Math.min(100, 78 + gauss() * 22)),
      flags: SwingFlags.BallStruck,
    });
    this.emit("swing", decodeSwing(packet));
  }
}
