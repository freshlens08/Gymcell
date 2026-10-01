# PinPoint BLE Protocol (v1)

This is the contract between PinPoint hardware and the PinPoint app. The app-side
implementation lives in `src/lib/pinpoint/protocol.ts`; firmware must match it.

## System overview

```
 ┌──────────────┐  2.4 GHz / BLE   ┌──────────────┐   BLE GATT    ┌──────────────┐
 │ PinPoint Tag │ ───────────────▶ │ PinPoint Hub │ ────────────▶ │  PinPoint    │
 │ (1 per club) │   adverts + IMU  │ (on the bag) │  notifications│  app (phone) │
 └──────────────┘                  └──────────────┘ ◀──────────── └──────────────┘
                                                      control writes
```

- **Tag**: screws into the grip end of each club. It has a 6-axis IMU (accelerometer + gyro,
  ≥1 kHz during a swing), a BLE radio, a buzzer and an LED. It detects a swing on the device
  and computes the summary metrics below, so only 20 bytes go over the air per swing.
- **Hub**: clips to the bag. It listens to every tag's advertisements (for in-bag and RSSI
  status), relays swing summaries, and is the single GATT peripheral the phone connects to.
  This keeps the phone to one connection, which matters because Web Bluetooth needs a user
  gesture for each device.

The hub advertises with the local name prefix `PinPoint` and the PinPoint service UUID.

## Services

| Service | UUID |
|---|---|
| PinPoint | `7a1e0001-5049-4e50-8000-00805f9b34fb` |
| Battery (SIG) | `0x180F` → Battery Level `0x2A19` (read + notify, hub battery %) |
| Device Information (SIG) | `0x180A` → Firmware Revision `0x2A26` (UTF-8 string) |

### PinPoint characteristics

| Name | UUID | Props | Size |
|---|---|---|---|
| Swing | `7a1e0002-5049-4e50-8000-00805f9b34fb` | notify | 20 B |
| Tag Status | `7a1e0003-5049-4e50-8000-00805f9b34fb` | notify | 6 B |
| Control Point | `7a1e0004-5049-4e50-8000-00805f9b34fb` | write w/ response | 2 B |

All multi-byte fields are **little-endian**.

## Swing packet (20 bytes)

Sized to fit one notification at the default ATT MTU (23 − 3).

| Offset | Type | Field | Scale / meaning |
|---|---|---|---|
| 0 | u8 | version | `1` |
| 1 | u8 | clubId | see club IDs |
| 2 | u16 | seq | rolling swing counter, used to drop duplicates |
| 4 | u16 | clubSpeed | mph × 10 (peak club head speed) |
| 6 | u16 | backswingMs | takeaway → top |
| 8 | u16 | downswingMs | top → impact |
| 10 | i16 | faceAngle | deg × 10; + open, − closed, relative to target line |
| 12 | i16 | clubPath | deg × 10; + in-to-out, − out-to-in |
| 14 | i16 | attackAngle | deg × 10; + ascending, − descending |
| 16 | u16 | swingPlane | deg × 10 from ground, at address |
| 18 | u8 | impactQuality | 0–100 strike-centeredness estimate |
| 19 | u8 | flags | bit0 ball struck · bit1 practice swing · bit2 low confidence |

## Tag Status packet (6 bytes)

The hub sends one packet per tag about every 2–3 s, and immediately whenever a tag's state changes.

| Offset | Type | Field | Meaning |
|---|---|---|---|
| 0 | u8 | clubId | |
| 1 | i8 | rssi | dBm as heard by the hub |
| 2 | u8 | battery | tag battery % |
| 3 | u8 | flags | bit0 in bag · bit1 moving · bit2 low battery |
| 4 | u16 | lastMovedSec | seconds since the tag last moved (saturates at 65535) |

A tag counts as **in bag** when its RSSI at the hub stays above about −70 dBm and it is
stationary. When a tag drops out of the bag and the golfer walks away, the app raises a
"not in your bag" alert. **Find my club** converts RSSI to an approximate distance with a
log-distance model (−59 dBm at 1 m, path-loss exponent 2.2).

## Control Point (2 bytes: opcode, arg)

| Op | Name | Arg |
|---|---|---|
| `0x01` | Start session | — |
| `0x02` | End session | — |
| `0x03` | Calibrate | — (hold the club at address for 2 s) |
| `0x04` | Set active club | clubId |
| `0x05` | Locate | clubId: the tag beeps and flashes until it moves or 60 s pass |

## Club IDs

| ID | Club | ID | Club |
|---|---|---|---|
| 1 | Driver | 8 | 8 Iron |
| 2 | 3 Wood | 9 | 9 Iron |
| 3 | 4 Hybrid | 10 | Pitching Wedge |
| 5 | 5 Iron | 11 | Sand Wedge |
| 6 | 6 Iron | 12 | Putter |
| 7 | 7 Iron | | |

ID 4 is reserved for a 5 wood or 3 hybrid.

## Versioning

Bump `version` when the packet layout changes. The app checks the length before it parses,
so firmware can add trailing bytes without breaking older apps.
