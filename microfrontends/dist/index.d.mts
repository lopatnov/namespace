//#region src/index.d.ts
type BusListener<T = unknown> = (data: T) => void;
interface Bus {
  /** Subscribe to an event. Returns an unsubscribe function. */
  on<T = unknown>(event: string, cb: BusListener<T>): () => void;
  /** Emit an event to all subscribers (including other tabs). */
  emit<T = unknown>(event: string, data?: T): void;
  /** Close the underlying BroadcastChannel. */
  destroy(): void;
}
interface LeaderElection {
  /** Returns true if this instance is the current leader. */
  isLeader(): boolean;
  /** Subscribe to leader changes. Returns an unsubscribe function. */
  onLeaderChange(cb: (isLeader: boolean) => void): () => void;
  /** Release leadership and clean up timers/listeners. */
  destroy(): void;
}
/**
 * Create a BroadcastChannel-based event bus.
 * Messages are delivered to all tabs/windows/workers sharing the same channel name,
 * as well as local subscribers in the current context.
 *
 * Falls back to a local-only bus when BroadcastChannel is not available.
 *
 * @param channelName - Unique channel identifier (e.g. `'my-app'`).
 */
declare function createBus(channelName: string): Bus;
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
declare function leaderElection(name: string): LeaderElection;
//#endregion
export { Bus, BusListener, LeaderElection, createBus, leaderElection };