# @lopatnov/namespace-microfrontends

[![npm](https://img.shields.io/npm/v/@lopatnov/namespace-microfrontends)](https://www.npmjs.com/package/@lopatnov/namespace-microfrontends)
[![license](https://img.shields.io/npm/l/@lopatnov/namespace-microfrontends)](LICENSE)

Cross-tab communication bus and leader election for `@lopatnov/namespace`. `BroadcastChannel`-based event bus with a `localStorage` heartbeat leader election — zero dependencies.

## Install

```sh
npm install @lopatnov/namespace-microfrontends
```

## Quick start

### Event bus

```ts
import { createBus } from '@lopatnov/namespace-microfrontends';

const bus = createBus('my-app');

// Subscribe in any tab
const unsubscribe = bus.on<{ user: string }>('login', ({ user }) => {
  console.log('User logged in:', user);
});

// Emit from any tab — all tabs receive it
bus.emit('login', { user: 'Alice' });

// Clean up
unsubscribe();
bus.destroy();
```

### Leader election

```ts
import { leaderElection } from '@lopatnov/namespace-microfrontends';

const election = leaderElection('my-app');

if (election.isLeader()) {
  // Only this tab runs background tasks
  startPolling();
}

election.onLeaderChange((isLeader) => {
  if (isLeader) startPolling();
  else stopPolling();
});

// Clean up when navigating away
election.destroy();
```

## API

### `createBus(channelName): Bus`

Creates a `BroadcastChannel`-based event bus. Messages are delivered to **all** tabs and windows sharing the same channel name, including the sender's own local subscribers.

Falls back to a local-only bus if `BroadcastChannel` is not available.

```ts
interface Bus {
  on<T>(event: string, cb: (data: T) => void): () => void;
  emit<T>(event: string, data?: T): void;
  destroy(): void;
}
```

### `leaderElection(name): LeaderElection`

Elect one leader among all tabs using a `localStorage` heartbeat. Leadership transfers automatically when the current leader closes.

```ts
interface LeaderElection {
  isLeader(): boolean;
  onLeaderChange(cb: (isLeader: boolean) => void): () => void;
  destroy(): void;
}
```

### Notes

- `bus.emit()` delivers messages to local subscribers **and** other tabs. There is no separate "local" emit — use a `sender` field in your payload to filter out echoes if needed.
- `leaderElection` stores its state in `localStorage` under `ns-leader:<name>`. The heartbeat interval is 1 second; a tab is considered dead after 2 missed heartbeats.

## License

Apache-2.0 © [lopatnov](https://github.com/lopatnov)
