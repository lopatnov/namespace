import { extend, inject, on, provide, scope, toJSON } from "@lopatnov/namespace";

//#region src/index.ts
/**
* Subscribe to namespace changes and persist specified keys to storage.
* Returns a cleanup function that stops persisting.
*
* @example
* const stop = persist(app.ns, {
*   keys: ['user', 'settings'],
*   storage: localStorage,
*   debounce: 300,
* });
* // Later: stop();
*/
function persist(ns, options) {
	const { keys, storage, debounce: delay = 0, prefix = "ns:" } = options;
	const timers = /* @__PURE__ */ new Map();
	function findRootKey(changedKey) {
		return keys.find((k) => changedKey === k || changedKey.startsWith(`${k}.`));
	}
	function save(changedKey) {
		const rootKey = findRootKey(changedKey);
		if (!rootKey) return;
		const storageKey = `${prefix}${rootKey}`;
		const doSave = () => {
			const value = inject(ns, rootKey);
			if (value === void 0) storage.removeItem(storageKey);
			else {
				let serialized;
				try {
					serialized = JSON.stringify(toJSON(value));
				} catch {
					serialized = JSON.stringify(value);
				}
				storage.setItem(storageKey, serialized);
			}
		};
		if (delay > 0) {
			const existing = timers.get(rootKey);
			if (existing !== void 0) clearTimeout(existing);
			timers.set(rootKey, setTimeout(doSave, delay));
		} else doSave();
	}
	const unsubChange = on(ns, "change", (key) => save(key));
	const unsubDelete = on(ns, "delete", (key) => save(key));
	return () => {
		unsubChange();
		unsubDelete();
		for (const t of timers.values()) clearTimeout(t);
		timers.clear();
	};
}
/**
* Restore namespace keys from storage.
* Returns a Promise that resolves when all keys have been loaded.
*
* @example
* await restore(app.ns, {
*   keys: ['user', 'settings'],
*   storage: localStorage,
* });
*/
async function restore(ns, options) {
	const { keys, storage, prefix = "ns:" } = options;
	for (const key of keys) {
		const raw = await storage.getItem(`${prefix}${key}`);
		if (raw === null) continue;
		try {
			const parsed = JSON.parse(raw);
			if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) extend(scope(ns, key), parsed);
			else provide(ns, key, parsed);
		} catch {}
	}
}
/**
* Create an IndexedDB-backed StorageAdapter.
* Falls back to an in-memory Map if IndexedDB is unavailable (e.g. Node.js).
*
* @example
* const idb = createIndexedDB('my-app');
* persist(app.ns, { keys: ['user'], storage: idb });
* await restore(app.ns, { keys: ['user'], storage: idb });
*/
function createIndexedDB(dbName, storeName = "ns-storage") {
	let db = null;
	const memFallback = /* @__PURE__ */ new Map();
	const dbReady = typeof indexedDB === "undefined" ? Promise.resolve(null) : new Promise((resolve) => {
		const req = indexedDB.open(dbName, 1);
		req.onupgradeneeded = () => {
			req.result.createObjectStore(storeName);
		};
		req.onsuccess = () => {
			db = req.result;
			resolve(db);
		};
		req.onerror = () => resolve(null);
	});
	function txStore(mode) {
		return db.transaction(storeName, mode).objectStore(storeName);
	}
	return {
		async getItem(key) {
			await dbReady;
			if (!db) return memFallback.get(key) ?? null;
			return new Promise((resolve) => {
				const req = txStore("readonly").get(key);
				req.onsuccess = () => resolve(req.result ?? null);
				req.onerror = () => resolve(null);
			});
		},
		async setItem(key, value) {
			await dbReady;
			if (!db) {
				memFallback.set(key, value);
				return;
			}
			return new Promise((resolve) => {
				const req = txStore("readwrite").put(value, key);
				req.onsuccess = () => resolve();
				req.onerror = () => resolve();
			});
		},
		async removeItem(key) {
			await dbReady;
			if (!db) {
				memFallback.delete(key);
				return;
			}
			return new Promise((resolve) => {
				const req = txStore("readwrite").delete(key);
				req.onsuccess = () => resolve();
				req.onerror = () => resolve();
			});
		}
	};
}

//#endregion
export { createIndexedDB, persist, restore };