// ============================================================
// @lopatnov/namespace-microfrontends
// Cross-app/cross-tab communication bus + leader election.
// ES2024, zero dependencies, works in jsdom (tests).
// ============================================================

// --- Types ---

export type BusListener<T = unknown> = (data: T) => void;

export interface Bus {
  /** Subscribe to an event. Returns an unsubscribe function. */
  on<T = unknown>(event: string, cb: BusListener<T>): () => void;
  /** Emit an event to all subscribers (including other tabs). */
  emit<T = unknown>(event: string, data?: T): void;
  /** Close the underlying BroadcastChannel. */
  destroy(): void;
}

export interface LeaderElection {
  /** Returns true if this instance is the current leader. */
  isLeader(): boolean;
  /** Subscribe to leader changes. Returns an unsubscribe function. */
  onLeaderChange(cb: (isLeader: boolean) => void): () => void;
  /** Release leadership and clean up timers/listeners. */
  destroy(): void;
}

// --- Internal helpers ---

interface BusMessage {
  event: string;
  data: unknown;
}

// --- createBus ---

/**
 * Create a BroadcastChannel-based event bus.
 * Messages are delivered to all tabs/windows/workers sharing the same channel name,
 * as well as local subscribers in the current context.
 *
 * Falls back to a local-only bus when BroadcastChannel is not available.
 *
 * @param channelName - Unique channel identifier (e.g. `'my-app'`).
 */
export function createBus(channelName: string): Bus {
  const localListeners = new Map<string, Set<BusListener>>();

  let channel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel(channelName);
    channel.addEventListener("message", (e: MessageEvent<BusMessage>) => {
      const { event, data } = e.data ?? {};
      if (!event) return;
      const listeners = localListeners.get(event);
      if (listeners) for (const cb of [...listeners]) cb(data);
    });
  }

  function on<T = unknown>(event: string, cb: BusListener<T>): () => void {
    if (!localListeners.has(event)) localListeners.set(event, new Set());
    localListeners.get(event)!.add(cb as BusListener);
    return () => localListeners.get(event)?.delete(cb as BusListener);
  }

  function emit<T = unknown>(event: string, data?: T): void {
    const msg: BusMessage = { event, data };
    // Notify local listeners directly
    const listeners = localListeners.get(event);
    if (listeners) for (const cb of [...listeners]) cb(data);
    // Broadcast to other contexts
    channel?.postMessage(msg);
  }

  function destroy(): void {
    channel?.close();
    channel = null;
    localListeners.clear();
  }

  return { on, emit, destroy };
}

// --- leaderElection ---

const _HEARTBEAT_INTERVAL = 200; // ms
const _HEARTBEAT_TIMEOUT = 600; // ms — if no heartbeat seen, take over

/**
 * Elect a leader among all tabs/windows sharing the same name.
 * Uses localStorage + storage events for cross-tab coordination.
 *
 * The first instance that starts becomes leader. If the leader tab is closed
 * or calls `destroy()`, a remaining tab takes over within ~600 ms.
 *
 * Falls back to always-leader when localStorage is unavailable.
 *
 * @param name - Unique election name (e.g. `'my-app'`).
 */
export function leaderElection(name: string): LeaderElection {
  const leaderKey = `__ns_leader_${name}`;
  const heartbeatKey = `__ns_hb_${name}`;

  let _isLeader = false;
  const _changeListeners = new Set<(isLeader: boolean) => void>();

  function setLeader(value: boolean): void {
    if (_isLeader === value) return;
    _isLeader = value;
    for (const cb of [..._changeListeners]) cb(value);
  }

  // Fallback: no localStorage
  if (typeof localStorage === "undefined") {
    return {
      isLeader: () => true,
      onLeaderChange: () => () => {},
      destroy: () => {},
    };
  }

  const myId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Try to become leader
  function tryBecomeLeader(): void {
    const current = localStorage.getItem(leaderKey);
    const lastHb = Number(localStorage.getItem(heartbeatKey) ?? "0");
    const stale = Date.now() - lastHb > _HEARTBEAT_TIMEOUT;

    if (!current || stale) {
      localStorage.setItem(leaderKey, myId);
      localStorage.setItem(heartbeatKey, String(Date.now()));
      setLeader(true);
    }
  }

  // Send heartbeat while leader
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  function startHeartbeat(): void {
    heartbeatTimer = setInterval(() => {
      if (localStorage.getItem(leaderKey) === myId) {
        localStorage.setItem(heartbeatKey, String(Date.now()));
      } else {
        // Someone else took over
        setLeader(false);
        stopHeartbeat();
      }
    }, _HEARTBEAT_INTERVAL);
  }

  function stopHeartbeat(): void {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  // Watch for leader vacancy from other tabs
  function handleStorage(e: StorageEvent): void {
    if (e.key !== leaderKey && e.key !== heartbeatKey) return;
    if (!_isLeader) tryBecomeLeader();
  }

  tryBecomeLeader();
  if (_isLeader) startHeartbeat();

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  function onLeaderChange(cb: (isLeader: boolean) => void): () => void {
    _changeListeners.add(cb);
    return () => _changeListeners.delete(cb);
  }

  function destroy(): void {
    stopHeartbeat();
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
    if (_isLeader) {
      localStorage.removeItem(leaderKey);
      localStorage.removeItem(heartbeatKey);
    }
    _changeListeners.clear();
    setLeader(false);
  }

  return {
    isLeader: () => _isLeader,
    onLeaderChange,
    destroy,
  };
}
