import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBus, leaderElection } from "../src/index";

// --- createBus ---

describe("createBus — local delivery", () => {
  it("delivers to local subscriber", () => {
    const bus = createBus("test-ch");
    const cb = vi.fn();
    bus.on("hello", cb);
    bus.emit("hello", { x: 1 });
    expect(cb).toHaveBeenCalledWith({ x: 1 });
    bus.destroy();
  });

  it("does not deliver after unsubscribe", () => {
    const bus = createBus("test-ch2");
    const cb = vi.fn();
    const off = bus.on("ping", cb);
    off();
    bus.emit("ping");
    expect(cb).not.toHaveBeenCalled();
    bus.destroy();
  });

  it("multiple listeners on same event", () => {
    const bus = createBus("test-ch3");
    const a = vi.fn();
    const b = vi.fn();
    bus.on("evt", a);
    bus.on("evt", b);
    bus.emit("evt", 42);
    expect(a).toHaveBeenCalledWith(42);
    expect(b).toHaveBeenCalledWith(42);
    bus.destroy();
  });

  it("does not deliver to wrong event", () => {
    const bus = createBus("test-ch4");
    const cb = vi.fn();
    bus.on("foo", cb);
    bus.emit("bar");
    expect(cb).not.toHaveBeenCalled();
    bus.destroy();
  });

  it("does not deliver after destroy", () => {
    const bus = createBus("test-ch5");
    const cb = vi.fn();
    bus.on("test", cb);
    bus.destroy();
    bus.emit("test");
    expect(cb).not.toHaveBeenCalled();
  });

  it("emits undefined data by default", () => {
    const bus = createBus("test-ch6");
    const cb = vi.fn();
    bus.on("empty", cb);
    bus.emit("empty");
    expect(cb).toHaveBeenCalledWith(undefined);
    bus.destroy();
  });
});

// --- leaderElection ---

describe("leaderElection", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("first instance becomes leader", () => {
    const election = leaderElection("app1");
    expect(election.isLeader()).toBe(true);
    election.destroy();
  });

  it("second instance is not leader when first is active", () => {
    const e1 = leaderElection("app2");
    const e2 = leaderElection("app2");
    expect(e1.isLeader()).toBe(true);
    expect(e2.isLeader()).toBe(false);
    e1.destroy();
    e2.destroy();
  });

  it("cleanup removes localStorage entry for leader", () => {
    const election = leaderElection("app3");
    expect(election.isLeader()).toBe(true);
    election.destroy();
    expect(localStorage.getItem("__ns_leader_app3")).toBeNull();
  });

  it("onLeaderChange returns unsubscribe function", () => {
    const election = leaderElection("app4");
    const cb = vi.fn();
    const off = election.onLeaderChange(cb);
    expect(typeof off).toBe("function");
    off();
    election.destroy();
  });

  it("destroy does not throw", () => {
    const election = leaderElection("app5");
    expect(() => election.destroy()).not.toThrow();
  });
});
