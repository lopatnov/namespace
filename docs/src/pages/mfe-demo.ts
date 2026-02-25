import { createBus, leaderElection } from "../../../microfrontends/src/index.ts";
import { on } from "../../../namespace/src/index.ts";
import { app } from "../ns.ts";
import template from "./mfe-demo.html";

export default function mfeDemo(container: Element) {
  container.innerHTML = template;

  const tabId = Math.random().toString(36).slice(2, 8);
  const bus = createBus("ns-demo");
  const election = leaderElection("ns-demo");

  // --- Leader election ---

  function updateLeader(isLeader: boolean) {
    $("#leader-icon").text(isLeader ? "👑" : "⏳");
    $("#leader-status")
      .text(isLeader ? "This tab is the leader" : "Not the leader — standby")
      .removeClass("text-success text-muted")
      .addClass(isLeader ? "text-success" : "text-muted");
  }

  updateLeader(election.isLeader());
  election.onLeaderChange(updateLeader);

  // --- Event bus ---

  interface ChatMessage {
    text: string;
    sender: string;
  }

  function addLog(text: string, fromSelf: boolean) {
    $("#mfe-log-placeholder").remove();
    const time = new Date().toLocaleTimeString();
    const badge = fromSelf
      ? '<span class="badge bg-primary me-1">you</span>'
      : '<span class="badge bg-secondary me-1">other tab</span>';
    const $log = $("#mfe-log");
    $log.append(
      `<div class="small py-1 border-bottom">\
<span class="text-muted me-1">${time}</span>${badge}${$("<span>").text(text).html()}</div>`,
    );
    $log.scrollTop($log[0].scrollHeight);
  }

  bus.on("chat", ({ text, sender }: ChatMessage) => {
    addLog(text, sender === tabId);
  });

  function send() {
    const $input = $("#mfe-message-input");
    const msg = ($input.val() as string).trim();
    if (!msg) return;
    bus.emit("chat", { text: msg, sender: tabId } satisfies ChatMessage);
    $input.val("").trigger("focus");
  }

  $("#mfe-send-btn").on("click", send);
  $("#mfe-message-input").on("keydown", (e) => {
    if (e.key === "Enter") send();
  });

  // --- Cleanup when navigating away ---

  const cleanupNav = on(app, "router:before", () => {
    bus.destroy();
    election.destroy();
    cleanupNav();
  });
}
