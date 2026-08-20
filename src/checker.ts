import {
  consecutiveFailures,
  insertCheck,
  listMonitors,
  openIncident,
  resolveIncident,
  startIncident,
  type Monitor,
} from "./db.js";
import { bus, notify } from "./notify.js";

const due = new Map<number, number>();
const inflight = new Set<number>();

export function startChecker(): void {
  tick();
  setInterval(tick, 5000);
}

async function tick(): Promise<void> {
  const now = Date.now();
  for (const monitor of listMonitors()) {
    if (!monitor.enabled) continue;
    if (inflight.has(monitor.id)) continue;
    const next = due.get(monitor.id) ?? 0;
    if (now < next) continue;
    due.set(monitor.id, now + monitor.interval_sec * 1000);
    inflight.add(monitor.id);
    void runCheck(monitor).finally(() => inflight.delete(monitor.id));
  }
}

async function runCheck(monitor: Monitor): Promise<void> {
  const started = Date.now();
  try {
    const result = await probe(monitor);
    const latency = Date.now() - started;
    insertCheck({
      monitor_id: monitor.id,
      ok: result.ok,
      status_code: result.status,
      latency_ms: latency,
      error: result.error,
    });
    await afterCheck(monitor, result.ok, result.error || statusLabel(result.status, latency));
  } catch (err) {
    const latency = Date.now() - started;
    const error = err instanceof Error ? err.message : "Check failed";
    insertCheck({
      monitor_id: monitor.id,
      ok: false,
      status_code: null,
      latency_ms: latency,
      error,
    });
    await afterCheck(monitor, false, error);
  }
}

async function afterCheck(monitor: Monitor, ok: boolean, detail: string): Promise<void> {
  if (ok) {
    const closed = resolveIncident(monitor.id);
    if (closed) await notify("recovered", monitor.name, detail);
  } else if (consecutiveFailures(monitor.id) >= 2) {
    const alreadyOpen = Boolean(openIncident(monitor.id));
    startIncident(monitor.id, `${monitor.name} is down`, detail);
    if (!alreadyOpen) await notify("down", monitor.name, detail);
  }
  bus.emit("update");
}

async function probe(monitor: Monitor): Promise<{ ok: boolean; status: number | null; error: string | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), monitor.timeout_ms);
  try {
    const response = await fetch(monitor.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "StatusPanda/1.0 (+https://railway.com)",
        accept: "*/*",
      },
    });
    const status = response.status;
    if (status !== monitor.expected_status && !(monitor.expected_status === 200 && status >= 200 && status < 400)) {
      return { ok: false, status, error: `HTTP ${status}` };
    }
    if (monitor.type === "keyword") {
      const body = await response.text();
      if (!monitor.keyword || !body.includes(monitor.keyword)) {
        return { ok: false, status, error: "Keyword missing" };
      }
    }
    return { ok: true, status, error: null };
  } catch (err) {
    const message =
      err instanceof Error && err.name === "AbortError" ? "Timed out" : err instanceof Error ? err.message : "Failed";
    return { ok: false, status: null, error: message };
  } finally {
    clearTimeout(timer);
  }
}

function statusLabel(status: number | null, latency: number): string {
  if (status == null) return `${latency}ms`;
  return `HTTP ${status} in ${latency}ms`;
}
