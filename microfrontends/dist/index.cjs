Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

//#region src/index.ts
/**
* Create a BroadcastChannel-based event bus.
* Messages are delivered to all tabs/windows/workers sharing the same channel name,
* as well as local subscribers in the current context.
*
* Falls back to a local-only bus when BroadcastChannel is not available.
*
* @param channelName - Unique channel identifier (e.g. `'my-app'`).
*/
function createBus(channelName) {
	const localListeners = /* @__PURE__ */ new Map();
	let channel = null;
	if (typeof BroadcastChannel !== "undefined") {
		channel = new BroadcastChannel(channelName);
		channel.addEventListener("message", (e) => {
			const { event, data } = e.data ?? {};
			if (!event) return;
			const listeners = localListeners.get(event);
			if (listeners) for (const cb of [...listeners]) cb(data);
		});
	}
	function on(event, cb) {
		if (!localListeners.has(event)) localListeners.set(event, /* @__PURE__ */ new Set());
		localListeners.get(event).add(cb);
		return () => localListeners.get(event)?.delete(cb);
	}
	function emit(event, data) {
		const msg = {
			event,
			data
		};
		const listeners = localListeners.get(event);
		if (listeners) for (const cb of [...listeners]) cb(data);
		channel?.postMessage(msg);
	}
	function destroy() {
		channel?.close();
		channel = null;
		localListeners.clear();
	}
	return {
		on,
		emit,
		destroy
	};
}
const _HEARTBEAT_INTERVAL = 200;
const _HEARTBEAT_TIMEOUT = 600;
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
function leaderElection(name) {
	const leaderKey = `__ns_leader_${name}`;
	const heartbeatKey = `__ns_hb_${name}`;
	let _isLeader = false;
	const _changeListeners = /* @__PURE__ */ new Set();
	function setLeader(value) {
		if (_isLeader === value) return;
		_isLeader = value;
		for (const cb of [..._changeListeners]) cb(value);
	}
	if (typeof localStorage === "undefined") return {
		isLeader: () => true,
		onLeaderChange: () => () => {},
		destroy: () => {}
	};
	const myId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
	function tryBecomeLeader() {
		const current = localStorage.getItem(leaderKey);
		const lastHb = Number(localStorage.getItem(heartbeatKey) ?? "0");
		const stale = Date.now() - lastHb > _HEARTBEAT_TIMEOUT;
		if (!current || stale) {
			localStorage.setItem(leaderKey, myId);
			localStorage.setItem(heartbeatKey, String(Date.now()));
			setLeader(true);
		}
	}
	let heartbeatTimer = null;
	function startHeartbeat() {
		heartbeatTimer = setInterval(() => {
			if (localStorage.getItem(leaderKey) === myId) localStorage.setItem(heartbeatKey, String(Date.now()));
			else {
				setLeader(false);
				stopHeartbeat();
			}
		}, _HEARTBEAT_INTERVAL);
	}
	function stopHeartbeat() {
		if (heartbeatTimer !== null) {
			clearInterval(heartbeatTimer);
			heartbeatTimer = null;
		}
	}
	function handleStorage(e) {
		if (e.key !== leaderKey && e.key !== heartbeatKey) return;
		if (!_isLeader) tryBecomeLeader();
	}
	tryBecomeLeader();
	if (_isLeader) startHeartbeat();
	if (typeof window !== "undefined") window.addEventListener("storage", handleStorage);
	function onLeaderChange(cb) {
		_changeListeners.add(cb);
		return () => _changeListeners.delete(cb);
	}
	function destroy() {
		stopHeartbeat();
		if (typeof window !== "undefined") window.removeEventListener("storage", handleStorage);
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
		destroy
	};
}

//#endregion
exports.createBus = createBus;
exports.leaderElection = leaderElection;