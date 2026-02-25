import { i as on, t as app } from "./app.js";

//#region ../microfrontends/src/index.ts
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
//#region src/pages/mfe-demo.html
var mfe_demo_default = "<div class=\"py-4\">\r\n  <h1><i class=\"bi bi-broadcast me-2 text-success\"></i>Microfrontends Demo</h1>\r\n  <p class=\"lead\">Cross-tab event bus and leader election — live in your browser.</p>\r\n\r\n  <div class=\"alert alert-info d-flex align-items-center gap-2\">\r\n    <i class=\"bi bi-info-circle-fill fs-5\"></i>\r\n    <span>Open this page in <strong>multiple browser tabs</strong> to see real-time cross-tab sync.</span>\r\n  </div>\r\n\r\n  <div class=\"row g-4 mt-1\">\r\n\r\n    <!-- Leader Election -->\r\n    <div class=\"col-md-5\">\r\n      <div class=\"card h-100\">\r\n        <div class=\"card-header fw-semibold\">\r\n          <i class=\"bi bi-trophy me-2 text-warning\"></i>Leader Election\r\n        </div>\r\n        <div class=\"card-body d-flex flex-column align-items-center justify-content-center py-4\">\r\n          <div id=\"leader-icon\" class=\"display-3 mb-2\">⏳</div>\r\n          <div id=\"leader-status\" class=\"fs-5 fw-bold mb-1\">Checking...</div>\r\n          <small class=\"text-muted\">leaderElection('ns-demo')</small>\r\n        </div>\r\n      </div>\r\n    </div>\r\n\r\n    <!-- Event Bus -->\r\n    <div class=\"col-md-7\">\r\n      <div class=\"card h-100\">\r\n        <div class=\"card-header fw-semibold\">\r\n          <i class=\"bi bi-chat-dots me-2 text-primary\"></i>Event Bus\r\n        </div>\r\n        <div class=\"card-body d-flex flex-column\">\r\n          <div class=\"input-group mb-3\">\r\n            <input\r\n              type=\"text\"\r\n              id=\"mfe-message-input\"\r\n              class=\"form-control\"\r\n              placeholder=\"Type a message and press Enter or click Broadcast…\"\r\n              autocomplete=\"off\"\r\n            />\r\n            <button class=\"btn btn-primary\" id=\"mfe-send-btn\" type=\"button\">\r\n              <i class=\"bi bi-send me-1\"></i>Broadcast\r\n            </button>\r\n          </div>\r\n          <div\r\n            id=\"mfe-log\"\r\n            class=\"border rounded p-2 flex-grow-1 overflow-y-auto\"\r\n            style=\"min-height:150px;max-height:250px\"\r\n          >\r\n            <p class=\"text-muted small mb-0\" id=\"mfe-log-placeholder\">Messages will appear here…</p>\r\n          </div>\r\n          <small class=\"text-muted mt-2\">createBus('ns-demo')</small>\r\n        </div>\r\n      </div>\r\n    </div>\r\n\r\n  </div>\r\n\r\n  <div class=\"mt-4\">\r\n    <small class=\"text-muted\">\r\n      <i class=\"bi bi-code-slash me-1\"></i>\r\n      Powered by <a href=\"/microfrontends\" data-nav>@lopatnov/namespace-microfrontends</a>.\r\n      Source: <code>createBus</code> + <code>leaderElection</code>.\r\n    </small>\r\n  </div>\r\n</div>\r\n";

//#endregion
//#region src/pages/mfe-demo.ts
function mfeDemo(container) {
	container.innerHTML = mfe_demo_default;
	const tabId = Math.random().toString(36).slice(2, 8);
	const bus = createBus("ns-demo");
	const election = leaderElection("ns-demo");
	function updateLeader(isLeader) {
		$("#leader-icon").text(isLeader ? "👑" : "⏳");
		$("#leader-status").text(isLeader ? "This tab is the leader" : "Not the leader — standby").removeClass("text-success text-muted").addClass(isLeader ? "text-success" : "text-muted");
	}
	updateLeader(election.isLeader());
	election.onLeaderChange(updateLeader);
	function addLog(text, fromSelf) {
		$("#mfe-log-placeholder").remove();
		const time = (/* @__PURE__ */ new Date()).toLocaleTimeString();
		const badge = fromSelf ? "<span class=\"badge bg-primary me-1\">you</span>" : "<span class=\"badge bg-secondary me-1\">other tab</span>";
		const $log = $("#mfe-log");
		$log.append(`<div class="small py-1 border-bottom">\
<span class="text-muted me-1">${time}</span>${badge}${$("<span>").text(text).html()}</div>`);
		$log.scrollTop($log[0].scrollHeight);
	}
	bus.on("chat", ({ text, sender }) => {
		addLog(text, sender === tabId);
	});
	function send() {
		const $input = $("#mfe-message-input");
		const msg = $input.val().trim();
		if (!msg) return;
		bus.emit("chat", {
			text: msg,
			sender: tabId
		});
		$input.val("").trigger("focus");
	}
	$("#mfe-send-btn").on("click", send);
	$("#mfe-message-input").on("keydown", (e) => {
		if (e.key === "Enter") send();
	});
	const cleanupNav = on(app, "router:before", () => {
		bus.destroy();
		election.destroy();
		cleanupNav();
	});
}

//#endregion
export { mfeDemo as default };