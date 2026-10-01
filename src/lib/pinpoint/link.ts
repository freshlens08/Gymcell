import {
  BATTERY_LEVEL_CHAR,
  BATTERY_SERVICE,
  CONTROL_CHAR,
  ControlOp,
  DEVICE_INFO_SERVICE,
  FIRMWARE_REV_CHAR,
  PINPOINT_SERVICE,
  SWING_CHAR,
  TAG_STATUS_CHAR,
  decodeSwing,
  decodeTag,
  encodeControl,
  type SwingPacket,
  type TagPacket,
} from "./protocol";

export type LinkStatus = "disconnected" | "connecting" | "connected";

export interface LinkEvents {
  status: (status: LinkStatus) => void;
  swing: (packet: SwingPacket) => void;
  tag: (packet: TagPacket) => void;
  battery: (percent: number) => void;
  error: (message: string) => void;
}

// Both the real BLE hub and the demo simulator implement this, so the UI never
// knows (or cares) which one it's talking to.
export interface PinPointLink {
  readonly kind: "bluetooth" | "demo";
  readonly deviceName: string;
  readonly firmware: string;
  connect(): Promise<void>;
  disconnect(): void;
  send(op: ControlOp, arg?: number): Promise<void>;
  on<K extends keyof LinkEvents>(event: K, fn: LinkEvents[K]): () => void;
}

export class Emitter {
  // Handlers are stored loosely typed; on() and emit() keep the public API typed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers = new Map<keyof LinkEvents, Set<(...args: any[]) => void>>();

  on<K extends keyof LinkEvents>(event: K, fn: LinkEvents[K]): () => void {
    let set = this.handlers.get(event);
    if (!set) this.handlers.set(event, (set = new Set()));
    set.add(fn);
    return () => set.delete(fn);
  }

  protected emit<K extends keyof LinkEvents>(event: K, ...args: Parameters<LinkEvents[K]>) {
    this.handlers.get(event)?.forEach((fn) => fn(...args));
  }
}

export function bluetoothSupport(): "supported" | "unsupported" | "insecure" | "blocked" {
  if (typeof window === "undefined") return "unsupported";
  if (!window.isSecureContext) return "insecure";
  if (!navigator.bluetooth) return "unsupported";
  // Embedded pages (iframes) can have Bluetooth switched off by the host.
  const policy = (document as Document & { featurePolicy?: { allowsFeature(f: string): boolean } }).featurePolicy;
  if (policy && !policy.allowsFeature("bluetooth")) return "blocked";
  return "supported";
}

export class BluetoothLink extends Emitter implements PinPointLink {
  readonly kind = "bluetooth" as const;
  deviceName = "PinPoint Hub";
  firmware = "unknown";

  private device?: BluetoothDevice;
  private control?: BluetoothRemoteGATTCharacteristic;

  async connect(): Promise<void> {
    const bt = navigator.bluetooth;
    if (!bt) throw new Error("Web Bluetooth isn't available in this browser.");

    this.emit("status", "connecting");
    try {
      // Must run inside a user gesture: this opens the browser's device picker.
      this.device = await bt.requestDevice({
        filters: [{ services: [PINPOINT_SERVICE] }, { namePrefix: "PinPoint" }],
        optionalServices: [PINPOINT_SERVICE, BATTERY_SERVICE, DEVICE_INFO_SERVICE],
      });
      this.deviceName = this.device.name ?? this.deviceName;
      this.device.addEventListener("gattserverdisconnected", this.onDisconnected);

      const server = await this.device.gatt!.connect();
      const service = await server.getPrimaryService(PINPOINT_SERVICE);

      const swing = await service.getCharacteristic(SWING_CHAR);
      swing.addEventListener("characteristicvaluechanged", (e) => {
        const value = (e.target as BluetoothRemoteGATTCharacteristic).value;
        if (!value) return;
        try {
          this.emit("swing", decodeSwing(value));
        } catch (err) {
          this.emit("error", (err as Error).message);
        }
      });
      await swing.startNotifications();

      const tags = await service.getCharacteristic(TAG_STATUS_CHAR);
      tags.addEventListener("characteristicvaluechanged", (e) => {
        const value = (e.target as BluetoothRemoteGATTCharacteristic).value;
        if (!value) return;
        try {
          this.emit("tag", decodeTag(value));
        } catch (err) {
          this.emit("error", (err as Error).message);
        }
      });
      await tags.startNotifications();

      this.control = await service.getCharacteristic(CONTROL_CHAR);

      await this.readOptional(server);
      this.emit("status", "connected");
    } catch (err) {
      this.emit("status", "disconnected");
      throw err;
    }
  }

  // Battery and device info are nice-to-haves; a hub without them still works.
  private async readOptional(server: BluetoothRemoteGATTServer) {
    try {
      const battery = await server.getPrimaryService(BATTERY_SERVICE);
      const level = await battery.getCharacteristic(BATTERY_LEVEL_CHAR);
      this.emit("battery", (await level.readValue()).getUint8(0));
      level.addEventListener("characteristicvaluechanged", (e) => {
        const v = (e.target as BluetoothRemoteGATTCharacteristic).value;
        if (v) this.emit("battery", v.getUint8(0));
      });
      await level.startNotifications();
    } catch {
      // No battery service.
    }
    try {
      const info = await server.getPrimaryService(DEVICE_INFO_SERVICE);
      const rev = await info.getCharacteristic(FIRMWARE_REV_CHAR);
      this.firmware = new TextDecoder().decode(await rev.readValue());
    } catch {
      // No device info service.
    }
  }

  private onDisconnected = () => {
    this.control = undefined;
    this.emit("status", "disconnected");
  };

  disconnect(): void {
    this.device?.gatt?.disconnect();
  }

  async send(op: ControlOp, arg = 0): Promise<void> {
    if (!this.control) throw new Error("Not connected");
    await this.control.writeValueWithResponse(encodeControl(op, arg));
  }
}
