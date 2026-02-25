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
const _VISIBILITY_DELAY = 500;
function parseHeartbeat(raw) {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed === "number") return {
			ts: parsed,
			visible: false
		};
		return parsed;
	} catch {
		return null;
	}
}
function isVisible() {
	return typeof document === "undefined" || document.visibilityState !== "hidden";
}
/**
* Elect a leader among all tabs/windows sharing the same name.
* Uses localStorage + storage events for cross-tab coordination.
*
* The first visible tab becomes leader. When the leader tab loses focus,
* a visible tab will take over after a short debounce delay (_VISIBILITY_DELAY).
* This prevents rapid leader-hopping when quickly switching between tabs.
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
		const hb = parseHeartbeat(localStorage.getItem(heartbeatKey));
		const stale = !hb || Date.now() - hb.ts > _HEARTBEAT_TIMEOUT;
		const visibleTakeover = !stale && hb && !hb.visible && isVisible();
		if (!current || stale || visibleTakeover) {
			localStorage.setItem(leaderKey, myId);
			localStorage.setItem(heartbeatKey, JSON.stringify({
				ts: Date.now(),
				visible: isVisible()
			}));
			setLeader(true);
		}
	}
	let heartbeatTimer = null;
	function startHeartbeat() {
		heartbeatTimer = setInterval(() => {
			if (localStorage.getItem(leaderKey) === myId) localStorage.setItem(heartbeatKey, JSON.stringify({
				ts: Date.now(),
				visible: isVisible()
			}));
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
		if (_isLeader) {
			if (e.key === leaderKey && e.newValue !== myId) {
				setLeader(false);
				stopHeartbeat();
			}
		} else tryBecomeLeader();
	}
	let visibilityTimer = null;
	function handleVisibilityChange() {
		if (visibilityTimer !== null) {
			clearTimeout(visibilityTimer);
			visibilityTimer = null;
		}
		if (isVisible() && !_isLeader) visibilityTimer = setTimeout(() => {
			visibilityTimer = null;
			if (!_isLeader) tryBecomeLeader();
		}, _VISIBILITY_DELAY);
	}
	tryBecomeLeader();
	if (_isLeader) startHeartbeat();
	if (typeof window !== "undefined") window.addEventListener("storage", handleStorage);
	if (typeof document !== "undefined") document.addEventListener("visibilitychange", handleVisibilityChange);
	function onLeaderChange(cb) {
		_changeListeners.add(cb);
		return () => _changeListeners.delete(cb);
	}
	function destroy() {
		stopHeartbeat();
		if (visibilityTimer !== null) {
			clearTimeout(visibilityTimer);
			visibilityTimer = null;
		}
		if (typeof window !== "undefined") window.removeEventListener("storage", handleStorage);
		if (typeof document !== "undefined") document.removeEventListener("visibilitychange", handleVisibilityChange);
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