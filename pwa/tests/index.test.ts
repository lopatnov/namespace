import { describe, expect, it, vi } from "vitest";
import { activateUpdate, isOnline, onOffline, onOnline, onUpdateAvailable } from "../src/index";

// --- isOnline ---

describe("isOnline", () => {
  it("returns true when navigator.onLine is true", () => {
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    expect(isOnline()).toBe(true);
  });

  it("returns false when navigator.onLine is false", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    expect(isOnline()).toBe(false);
  });
});

// --- onOffline / onOnline ---

describe("onOffline", () => {
  it("calls callback on offline event", () => {
    const cb = vi.fn();
    const stop = onOffline(cb);
    window.dispatchEvent(new Event("offline"));
    expect(cb).toHaveBeenCalledTimes(1);
    stop();
  });

  it("cleanup removes listener", () => {
    const cb = vi.fn();
    const stop = onOffline(cb);
    stop();
    window.dispatchEvent(new Event("offline"));
    expect(cb).not.toHaveBeenCalled();
  });
});

describe("onOnline", () => {
  it("calls callback on online event", () => {
    const cb = vi.fn();
    const stop = onOnline(cb);
    window.dispatchEvent(new Event("online"));
    expect(cb).toHaveBeenCalledTimes(1);
    stop();
  });

  it("cleanup removes listener", () => {
    const cb = vi.fn();
    const stop = onOnline(cb);
    stop();
    window.dispatchEvent(new Event("online"));
    expect(cb).not.toHaveBeenCalled();
  });
});

// --- onUpdateAvailable ---

describe("onUpdateAvailable", () => {
  function makeReg(installingState: string) {
    const stateListeners: Array<() => void> = [];
    const installing = {
      state: installingState,
      addEventListener: vi.fn((_: string, cb: () => void) => stateListeners.push(cb)),
    };
    const updateListeners: Array<() => void> = [];
    const reg = {
      installing,
      addEventListener: vi.fn((_: string, cb: () => void) => updateListeners.push(cb)),
      removeEventListener: vi.fn(),
      fireUpdate: () => {
        for (const cb of updateListeners) cb();
      },
      fireStateChange: () => {
        for (const cb of stateListeners) cb();
      },
    };
    return reg;
  }

  it("calls cb when new SW reaches installed state with controller present", () => {
    const reg = makeReg("installing") as unknown as ServiceWorkerRegistration & {
      fireUpdate: () => void;
      fireStateChange: () => void;
    };

    Object.defineProperty(navigator, "serviceWorker", {
      value: { controller: {}, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      configurable: true,
    });

    const cb = vi.fn();
    onUpdateAvailable(reg, cb);

    reg.fireUpdate();
    (reg.installing as unknown as { state: string }).state = "installed";
    reg.fireStateChange();

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("cleanup removes updatefound listener", () => {
    const reg = makeReg("installing") as unknown as ServiceWorkerRegistration & {
      fireUpdate: () => void;
    };
    const cb = vi.fn();
    const stop = onUpdateAvailable(reg, cb);
    stop();
    expect(reg.removeEventListener).toHaveBeenCalledWith("updatefound", expect.any(Function));
  });
});

// --- activateUpdate ---

describe("activateUpdate", () => {
  it("posts SKIP_WAITING to waiting SW", () => {
    const postMessage = vi.fn();
    const reg = {
      waiting: { postMessage, state: "installed" },
    } as unknown as ServiceWorkerRegistration;

    // Stub serviceWorker.addEventListener
    const swListeners: Array<() => void> = [];
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        controller: {},
        addEventListener: vi.fn((_: string, cb: () => void) => swListeners.push(cb)),
        removeEventListener: vi.fn(),
      },
      configurable: true,
    });

    activateUpdate(reg);
    expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
  });

  it("does nothing if no waiting SW", () => {
    const reg = { waiting: null } as unknown as ServiceWorkerRegistration;
    expect(() => activateUpdate(reg)).not.toThrow();
  });
});
