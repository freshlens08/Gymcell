"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { toSwing, type Swing } from "@/lib/pinpoint/analysis";
import { clubById } from "@/lib/pinpoint/clubs";
import { BluetoothLink, type LinkStatus, type PinPointLink } from "@/lib/pinpoint/link";
import { ControlOp, type TagPacket } from "@/lib/pinpoint/protocol";
import { DemoLink } from "@/lib/pinpoint/simulator";

export interface TagState extends TagPacket {
  seenAt: number;
}

interface PinPointState {
  status: LinkStatus;
  kind: PinPointLink["kind"] | null;
  deviceName: string;
  firmware: string;
  battery: number | null;
  tags: Record<number, TagState>;
  swings: Swing[];
  activeClub: number;
  sessionActive: boolean;
  locatingClub: number | null;
  connect(kind: PinPointLink["kind"]): Promise<void>;
  disconnect(): void;
  toggleSession(): Promise<void>;
  setActiveClub(id: number): Promise<void>;
  locate(id: number | null): Promise<void>;
  simulateSwing(): void;
  clearHistory(): void;
}

const Ctx = createContext<PinPointState | null>(null);
const STORAGE_KEY = "pinpoint.swings.v1";
const MAX_SWINGS = 500;

function loadSwings(): Swing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Swing[]) : [];
  } catch {
    return [];
  }
}

export function PinPointProvider({ children }: { children: React.ReactNode }) {
  const linkRef = useRef<PinPointLink | null>(null);
  const [status, setStatus] = useState<LinkStatus>("disconnected");
  const [kind, setKind] = useState<PinPointLink["kind"] | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [firmware, setFirmware] = useState("");
  const [battery, setBattery] = useState<number | null>(null);
  const [tags, setTags] = useState<Record<number, TagState>>({});
  const [swings, setSwings] = useState<Swing[]>([]);
  const [activeClub, setActiveClubState] = useState(7);
  const [sessionActive, setSessionActive] = useState(false);
  const [locatingClub, setLocatingClub] = useState<number | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    // Hydrate from storage after mount to keep server and client markup identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSwings(loadSwings());
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(swings.slice(0, MAX_SWINGS)));
    } catch {
      // Storage full or blocked; history just won't persist.
    }
  }, [swings]);

  useEffect(() => () => linkRef.current?.disconnect(), []);

  const connect = useCallback(async (k: PinPointLink["kind"]) => {
    linkRef.current?.disconnect();
    const link: PinPointLink = k === "demo" ? new DemoLink() : new BluetoothLink();
    linkRef.current = link;
    setKind(k);

    link.on("status", (s) => {
      if (linkRef.current !== link) return;
      setStatus(s);
      if (s === "connected") {
        setDeviceName(link.deviceName);
        setFirmware(link.firmware);
        toast.success(`Connected to ${link.deviceName}`);
      }
      if (s === "disconnected") {
        setSessionActive(false);
        setLocatingClub(null);
      }
    });
    link.on("battery", setBattery);
    link.on("tag", (t) => setTags((prev) => ({ ...prev, [t.clubId]: { ...t, seenAt: Date.now() } })));
    link.on("swing", (p) => {
      const swing = toSwing(p);
      setSwings((prev) => [swing, ...prev]);
      setActiveClubState(p.clubId);
    });
    link.on("error", (m) => toast.error(m));

    try {
      await link.connect();
    } catch (err) {
      const e = err as Error;
      // Closing the picker isn't an error worth shouting about.
      if (e.name !== "NotFoundError") toast.error(e.message || "Couldn't connect");
      if (linkRef.current === link) {
        linkRef.current = null;
        setKind(null);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    linkRef.current?.disconnect();
    linkRef.current = null;
    setKind(null);
    setBattery(null);
    setTags({});
  }, []);

  const send = useCallback(async (op: ControlOp, arg?: number) => {
    try {
      await linkRef.current?.send(op, arg);
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    }
  }, []);

  const toggleSession = useCallback(async () => {
    const next = !sessionActive;
    await send(next ? ControlOp.StartSession : ControlOp.EndSession);
    setSessionActive(next);
  }, [sessionActive, send]);

  const setActiveClub = useCallback(
    async (id: number) => {
      setActiveClubState(id);
      await send(ControlOp.SetActiveClub, id).catch(() => {});
    },
    [send],
  );

  const locate = useCallback(
    async (id: number | null) => {
      setLocatingClub(id);
      if (id !== null) {
        await send(ControlOp.Locate, id).catch(() => {});
        toast(`Ringing your ${clubById(id)?.name ?? "club"} tag`);
      }
    },
    [send],
  );

  const simulateSwing = useCallback(() => {
    const link = linkRef.current;
    if (link instanceof DemoLink) link.simulateSwing();
  }, []);

  const clearHistory = useCallback(() => setSwings([]), []);

  return (
    <Ctx.Provider
      value={{
        status,
        kind,
        deviceName,
        firmware,
        battery,
        tags,
        swings,
        activeClub,
        sessionActive,
        locatingClub,
        connect,
        disconnect,
        toggleSession,
        setActiveClub,
        locate,
        simulateSwing,
        clearHistory,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePinPoint() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePinPoint must be used inside <PinPointProvider>");
  return ctx;
}
