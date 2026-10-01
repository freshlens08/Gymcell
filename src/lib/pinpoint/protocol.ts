// PinPoint BLE GATT protocol.
//
// A PinPoint Hub (clipped to the bag) talks to the phone over BLE and relays
// data from the PinPoint Tags screwed into each club's grip end. Each tag has an
// IMU that captures the swing; the hub forwards a compact 20-byte summary so a
// packet fits in a single notification at the default ATT MTU (23 - 3 bytes).
// See docs/pinpoint/BLE_PROTOCOL.md for the full spec.

export const PINPOINT_SERVICE = "7a1e0001-5049-4e50-8000-00805f9b34fb";
export const SWING_CHAR = "7a1e0002-5049-4e50-8000-00805f9b34fb"; // notify
export const TAG_STATUS_CHAR = "7a1e0003-5049-4e50-8000-00805f9b34fb"; // notify
export const CONTROL_CHAR = "7a1e0004-5049-4e50-8000-00805f9b34fb"; // write

export const BATTERY_SERVICE = "battery_service"; // 0x180F
export const BATTERY_LEVEL_CHAR = "battery_level"; // 0x2A19
export const DEVICE_INFO_SERVICE = "device_information"; // 0x180A
export const FIRMWARE_REV_CHAR = "firmware_revision_string"; // 0x2A26

export const PROTOCOL_VERSION = 1;
export const SWING_PACKET_SIZE = 20;
export const TAG_PACKET_SIZE = 6;

export enum ControlOp {
  StartSession = 0x01,
  EndSession = 0x02,
  Calibrate = 0x03,
  SetActiveClub = 0x04,
  Locate = 0x05, // make a tag beep + flash so a lost club can be found
}

export const SwingFlags = {
  BallStruck: 1 << 0,
  PracticeSwing: 1 << 1,
  LowConfidence: 1 << 2,
} as const;

export const TagFlags = {
  InBag: 1 << 0,
  Moving: 1 << 1,
  LowBattery: 1 << 2,
} as const;

export interface SwingPacket {
  version: number;
  clubId: number;
  seq: number;
  clubSpeedMph: number;
  backswingMs: number;
  downswingMs: number;
  faceAngleDeg: number; // + open, - closed (relative to target line)
  clubPathDeg: number; // + in-to-out, - out-to-in
  attackAngleDeg: number; // + up, - down
  swingPlaneDeg: number; // shaft plane at address, from ground
  impactQuality: number; // 0-100, strike centeredness estimate
  flags: number;
}

export interface TagPacket {
  clubId: number;
  rssi: number; // dBm
  battery: number; // %
  flags: number;
  lastMovedSec: number; // seconds since the tag last moved (0-65535)
}

// Layout (little-endian):
//  0 u8  version        1 u8  clubId       2 u16 seq
//  4 u16 speed*10       6 u16 backswingMs  8 u16 downswingMs
// 10 i16 face*10       12 i16 path*10     14 i16 attack*10
// 16 u16 plane*10      18 u8  quality     19 u8  flags
export function decodeSwing(view: DataView): SwingPacket {
  if (view.byteLength < SWING_PACKET_SIZE) {
    throw new Error(`Swing packet too short: ${view.byteLength} bytes`);
  }
  return {
    version: view.getUint8(0),
    clubId: view.getUint8(1),
    seq: view.getUint16(2, true),
    clubSpeedMph: view.getUint16(4, true) / 10,
    backswingMs: view.getUint16(6, true),
    downswingMs: view.getUint16(8, true),
    faceAngleDeg: view.getInt16(10, true) / 10,
    clubPathDeg: view.getInt16(12, true) / 10,
    attackAngleDeg: view.getInt16(14, true) / 10,
    swingPlaneDeg: view.getUint16(16, true) / 10,
    impactQuality: view.getUint8(18),
    flags: view.getUint8(19),
  };
}

export function encodeSwing(p: SwingPacket): DataView {
  const view = new DataView(new ArrayBuffer(SWING_PACKET_SIZE));
  view.setUint8(0, p.version);
  view.setUint8(1, p.clubId);
  view.setUint16(2, p.seq & 0xffff, true);
  view.setUint16(4, Math.round(p.clubSpeedMph * 10), true);
  view.setUint16(6, Math.round(p.backswingMs), true);
  view.setUint16(8, Math.round(p.downswingMs), true);
  view.setInt16(10, Math.round(p.faceAngleDeg * 10), true);
  view.setInt16(12, Math.round(p.clubPathDeg * 10), true);
  view.setInt16(14, Math.round(p.attackAngleDeg * 10), true);
  view.setUint16(16, Math.round(p.swingPlaneDeg * 10), true);
  view.setUint8(18, Math.max(0, Math.min(100, Math.round(p.impactQuality))));
  view.setUint8(19, p.flags);
  return view;
}

// Layout: 0 u8 clubId, 1 i8 rssi, 2 u8 battery, 3 u8 flags, 4 u16 lastMovedSec
export function decodeTag(view: DataView): TagPacket {
  if (view.byteLength < TAG_PACKET_SIZE) {
    throw new Error(`Tag packet too short: ${view.byteLength} bytes`);
  }
  return {
    clubId: view.getUint8(0),
    rssi: view.getInt8(1),
    battery: view.getUint8(2),
    flags: view.getUint8(3),
    lastMovedSec: view.getUint16(4, true),
  };
}

export function encodeTag(p: TagPacket): DataView {
  const view = new DataView(new ArrayBuffer(TAG_PACKET_SIZE));
  view.setUint8(0, p.clubId);
  view.setInt8(1, Math.max(-128, Math.min(127, Math.round(p.rssi))));
  view.setUint8(2, p.battery);
  view.setUint8(3, p.flags);
  view.setUint16(4, Math.min(0xffff, Math.round(p.lastMovedSec)), true);
  return view;
}

export function encodeControl(op: ControlOp, arg = 0): Uint8Array<ArrayBuffer> {
  return new Uint8Array([op, arg & 0xff]);
}
