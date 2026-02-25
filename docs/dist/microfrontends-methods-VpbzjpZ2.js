//#region src/data/microfrontends-methods.ts
const microfrontendsMethods = [{
	slug: "createBus",
	title: "createBus",
	methods: [{
		name: "createBus",
		signature: "createBus(channelName: string): Bus",
		description: "Create a cross-tab event bus backed by BroadcastChannel. Messages are delivered to all subscribers in the current tab AND to all other tabs/windows/workers sharing the same channel name. Local delivery is synchronous. Falls back to a local-only bus when BroadcastChannel is not available. Call `bus.destroy()` to close the channel.",
		example: `import { createBus } from '@lopatnov/namespace-microfrontends';

const bus = createBus('my-app');

// Subscribe (returns cleanup function)
const off = bus.on('user:login', (user) => {
  app.use('user', user);
  navigate(router, '/dashboard');
});

// Emit to all tabs and local subscribers
bus.emit('user:login', { name: 'Alice', role: 'Admin' });

// Cross-tab navigation sync
bus.on('nav:goto', (path) => navigate(router, path as string));
bus.emit('nav:goto', '/settings');

// Cleanup
off();          // remove one listener
bus.destroy();  // close channel + remove all listeners`
	}]
}, {
	slug: "leaderElection",
	title: "leaderElection",
	methods: [{
		name: "leaderElection",
		signature: "leaderElection(name: string): LeaderElection",
		description: "Elect a leader among all tabs/windows sharing the same name. Uses localStorage heartbeat for cross-tab coordination — the first instance that starts wins. If the leader tab is closed, a remaining tab takes over within ~600 ms. Falls back to always-leader when localStorage is unavailable. Call `election.destroy()` to release leadership and clean up.",
		example: `import { leaderElection } from '@lopatnov/namespace-microfrontends';

const election = leaderElection('my-app');

// Check leader status
if (election.isLeader()) {
  // Only one tab runs these background tasks
  startPeriodicSync();
  registerPushNotifications();
}

// React to leadership changes
const off = election.onLeaderChange((isLeader) => {
  if (isLeader) {
    console.log('This tab is now the leader');
    startPeriodicSync();
  } else {
    console.log('Lost leadership');
    stopPeriodicSync();
  }
});

// Cleanup (releases leadership to another tab)
off();
election.destroy();`
	}]
}];

//#endregion
export { microfrontendsMethods as t };