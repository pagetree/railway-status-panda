import {
  getMonitor,
  getSetting,
  lastCheckedAt,
  latestCheck,
  listIncidents,
  listMonitors,
  recentChecks,
  uptimeRatio,
  type Monitor,
} from "./db.js";
import { escapeHtml, formatAgo, formatTime, layout, pct, ticks, wordmark } from "./ui.js";

export type Overall = "calm" | "watch" | "down";

const TICK_COUNT = 90;

export function overallStatus(): Overall {
  const monitors = listMonitors().filter((m) => m.enabled);
  if (!monitors.length) return "watch";
  const states = monitors.map((m) => latestCheck(m.id));
  if (states.some((c) => c && !c.ok)) return "down";
  if (states.some((c) => !c)) return "watch";
  return "calm";
}

const headlines: Record<Overall, { title: string; lede: string; banner: "up" | "watch" | "down" }> = {
  calm: {
    title: "All systems operational",
    lede: "All products are fully operational.",
    banner: "up",
  },
  watch: {
    title: "Collecting status",
    lede: "Checks are running. This dashboard will fill in as the first results arrive.",
    banner: "watch",
  },
  down: {
    title: "Service disruption",
    lede: "At least one product is unavailable. Details are listed below.",
    banner: "down",
  },
};

function brandName(): string {
  return process.env.APP_NAME?.trim() || "StatusPanda";
}

export function statusPage(): string {
  const overall = overallStatus();
  const copy = headlines[overall];
  const monitors = listMonitors();
  const incidents = listIncidents(8);
  const brand = brandName();
  const title = getSetting("page_title", brand);
  const subtitle = getSetting("page_subtitle") || copy.lede;
  const last = lastCheckedAt();

  const body = `
    <header class="topbar">
      <div class="topbar-inner">
        ${wordmark(brand)}
        <span class="crumb">Status dashboard</span>
        <div class="nav-links">
          <a class="btn ghost" href="/login">Admin</a>
        </div>
      </div>
    </header>
    <main class="wrap">
      <section class="banner ${copy.banner}" id="overall-banner">
        ${statusIcon(copy.banner)}
        <div>
          <h1 id="overall-title">${escapeHtml(title === brand ? copy.title : title)}</h1>
          <p class="lede" id="overall-lede">${escapeHtml(subtitle)}</p>
          <div class="meta" id="overall-meta"><span class="live"></span>${escapeHtml(formatAgo(last))}</div>
        </div>
      </section>
      ${monitors.length ? monitorList(monitors) : emptyPublic()}
      ${incidentList(incidents)}
      <footer class="footer">
        <span>StatusPanda Uptime</span>
        <span>Powered by Railway</span>
      </footer>
    </main>
    <script>
      const src = new EventSource('/events');
      src.onmessage = () => { location.reload(); };
    </script>
  `;

  return layout({ title: `${title} status`, body });
}

function statusIcon(kind: "up" | "watch" | "down"): string {
  if (kind === "up") {
    return `<svg class="status-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#188038"/><path d="M7 12.5l3.2 3.2L17 8.8" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  if (kind === "down") {
    return `<svg class="status-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#d93025"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  }
  return `<svg class="status-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#e37400"/><path d="M12 7v7" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.2" fill="#fff"/></svg>`;
}

function emptyPublic(): string {
  return `<section class="panel"><div class="empty">
    <h2>No services yet</h2>
    <p>Open Admin and add a URL to publish this dashboard.</p>
  </div></section>`;
}

function monitorList(monitors: Monitor[]): string {
  const rows = monitors
    .map((monitor) => {
      const last = latestCheck(monitor.id);
      const ok = last ? Boolean(last.ok) : null;
      const state = ok == null ? "watch" : ok ? "up" : "down";
      const label = ok == null ? "Checking" : ok ? "No issues" : "Unavailable";
      const history = padTicks(recentChecks(monitor.id, TICK_COUNT).map((c) => Boolean(c.ok)));
      const latency = last?.latency_ms != null ? `${last.latency_ms} ms` : "Pending";
      const up = pct(uptimeRatio(monitor.id));
      return `<article class="service">
        <div>
          <h3>${escapeHtml(monitor.name)}</h3>
          <div class="sub">${escapeHtml(hostOf(monitor.url))} · ${latency} · ${up} uptime</div>
        </div>
        <span class="pill ${state}">${label}</span>
        ${ticks(history)}
      </article>`;
    })
    .join("");
  return `<section class="panel">
    <div class="panel-head">
      <h2>Services</h2>
      <span class="legend">90 most recent checks · oldest to newest</span>
    </div>
    ${rows}
  </section>`;
}

function incidentList(
  incidents: Array<{ title: string; started_at: string; ended_at: string | null; monitor_name: string; body: string }>
): string {
  const items = incidents.length
    ? incidents
        .map((item) => {
          const open = !item.ended_at;
          return `<article class="incident">
            <strong>${escapeHtml(item.title)}</strong>
            <div class="sub">${escapeHtml(item.monitor_name)} · ${escapeHtml(formatTime(item.started_at))}${
              open ? " · Ongoing" : ` · Resolved ${escapeHtml(formatTime(item.ended_at))}`
            }</div>
            <div class="sub">${escapeHtml(item.body)}</div>
          </article>`;
        })
        .join("")
    : `<div class="empty"><h2>No incidents reported</h2><p>There is no disruption history to show yet.</p></div>`;
  return `<section class="panel incidents">
    <div class="panel-head"><h2>Incident history</h2></div>
    ${items}
  </section>`;
}

export function loginPage(error?: string): string {
  const body = `
    <div class="login-shell">
      <div class="login-card">
        ${wordmark(brandName())}
        <h1>Sign in</h1>
        <p class="hint">Use the username and the ADMIN_PASSWORD value from your Railway service variables.</p>
        ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
        <form method="post" action="/login">
          <label for="user">Username</label>
          <input id="user" name="user" autocomplete="username" value="admin" />
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required />
          <div style="margin-top:28px" class="row">
            <button class="btn primary" type="submit">Sign in</button>
            <a class="btn ghost" href="/">Back to status</a>
          </div>
        </form>
      </div>
    </div>
  `;
  return layout({ title: "Sign in", body });
}

export function adminPage(opts: { toast?: string; editId?: number }): string {
  const monitors = listMonitors();
  const edit = opts.editId ? getMonitor(opts.editId) : undefined;
  const body = `
    <header class="topbar">
      <div class="topbar-inner">
        ${wordmark(brandName())}
        <span class="crumb">Admin</span>
        <div class="nav-links">
          <a class="btn ghost" href="/">Status</a>
          <a class="btn ghost" href="/admin/settings">Settings</a>
          <form method="post" action="/logout"><button class="btn" type="submit">Sign out</button></form>
        </div>
      </div>
    </header>
    <main class="wrap">
      <h1 class="page-title">Monitors</h1>
      <p class="lede">Add the URLs you want on the public dashboard. Checks start within one interval.</p>
      <div class="admin-grid">
        <div class="stack">
          ${
            monitors.length
              ? monitors.map((m) => adminCard(m, opts.editId)).join("")
              : `<div class="panel"><div class="empty"><h2>No monitors</h2><p>Add a site on the right. The first check runs within a minute.</p></div></div>`
          }
        </div>
        <div class="card">
          <h2>${edit ? "Edit monitor" : "Add a monitor"}</h2>
          <form method="post" action="${edit ? `/admin/monitors/${edit.id}` : "/admin/monitors"}" class="stack" style="margin-top:12px">
            <div>
              <label for="name">Name</label>
              <input id="name" name="name" required placeholder="Marketing site" value="${escapeHtml(edit?.name ?? "")}" />
            </div>
            <div>
              <label for="url">URL</label>
              <input id="url" name="url" required placeholder="https://example.com" value="${escapeHtml(edit?.url ?? "")}" />
            </div>
            <div class="grid-2">
              <div>
                <label for="type">Check</label>
                <select id="type" name="type">
                  <option value="http" ${!edit || edit.type === "http" ? "selected" : ""}>HTTP status</option>
                  <option value="keyword" ${edit?.type === "keyword" ? "selected" : ""}>HTTP + keyword</option>
                </select>
              </div>
              <div>
                <label for="interval_sec">Interval</label>
                <select id="interval_sec" name="interval_sec">
                  ${intervalOptions(edit?.interval_sec ?? 60)}
                </select>
              </div>
            </div>
            <div>
              <label for="keyword">Keyword (optional)</label>
              <input id="keyword" name="keyword" placeholder="ok" value="${escapeHtml(edit?.keyword ?? "")}" />
            </div>
            <div class="grid-2">
              <div>
                <label for="expected_status">Expected status</label>
                <input id="expected_status" name="expected_status" type="number" min="100" max="599" value="${edit?.expected_status ?? 200}" />
              </div>
              <div>
                <label for="timeout_ms">Timeout ms</label>
                <input id="timeout_ms" name="timeout_ms" type="number" min="2000" max="30000" value="${edit?.timeout_ms ?? 10000}" />
              </div>
            </div>
            ${edit ? `<input type="hidden" name="enabled" value="${edit.enabled}" />` : ""}
            <button class="btn primary" type="submit">${edit ? "Save monitor" : "Add monitor"}</button>
            ${edit ? `<a class="btn" href="/admin">Cancel</a>` : ""}
          </form>
        </div>
      </div>
    </main>
  `;
  return layout({ title: "Monitors", body, toast: opts.toast });
}

function adminCard(monitor: Monitor, editId?: number): string {
  const last = latestCheck(monitor.id);
  const ok = last ? Boolean(last.ok) : null;
  const state = ok == null ? "watch" : ok ? "up" : "down";
  const label = ok == null ? "Checking" : ok ? "No issues" : "Unavailable";
  const history = padTicks(recentChecks(monitor.id, TICK_COUNT).map((c) => Boolean(c.ok)));
  return `<article class="card">
    <div class="service" style="border:0;padding:0">
      <div>
        <h3>${escapeHtml(monitor.name)}</h3>
        <div class="sub">${escapeHtml(monitor.url)}</div>
      </div>
      <span class="pill ${state}">${label}</span>
      ${ticks(history)}
    </div>
    <div class="row" style="margin-top:16px">
      <a class="btn" href="/admin?edit=${monitor.id}">${editId === monitor.id ? "Editing" : "Edit"}</a>
      <form method="post" action="/admin/monitors/${monitor.id}/pause">
        <button class="btn" type="submit">${monitor.enabled ? "Pause" : "Resume"}</button>
      </form>
      <form method="post" action="/admin/monitors/${monitor.id}/delete">
        <button class="btn danger" type="submit">Remove</button>
      </form>
    </div>
  </article>`;
}

export function settingsPage(toast?: string): string {
  const body = `
    <header class="topbar">
      <div class="topbar-inner">
        ${wordmark(brandName())}
        <span class="crumb">Settings</span>
        <div class="nav-links">
          <a class="btn ghost" href="/admin">Monitors</a>
          <a class="btn ghost" href="/">Status</a>
        </div>
      </div>
    </header>
    <main class="wrap">
      <h1 class="page-title">Status page and alerts</h1>
      <p class="lede">Optional. Leave webhooks empty until you want Discord or Slack alerts.</p>
      <form method="post" action="/admin/settings" class="card stack">
        <div>
          <label for="page_title">Public title</label>
          <input id="page_title" name="page_title" value="${escapeHtml(getSetting("page_title", brandName()))}" />
        </div>
        <div>
          <label for="page_subtitle">Public subtitle</label>
          <input id="page_subtitle" name="page_subtitle" value="${escapeHtml(getSetting("page_subtitle", ""))}" placeholder="Leave blank to use the live headline" />
        </div>
        <div>
          <label for="discord_webhook">Discord webhook</label>
          <input id="discord_webhook" name="discord_webhook" value="${escapeHtml(getSetting("discord_webhook"))}" placeholder="https://discord.com/api/webhooks/..." />
        </div>
        <div>
          <label for="slack_webhook">Slack webhook</label>
          <input id="slack_webhook" name="slack_webhook" value="${escapeHtml(getSetting("slack_webhook"))}" placeholder="https://hooks.slack.com/services/..." />
        </div>
        <div>
          <label for="generic_webhook">Generic JSON webhook</label>
          <input id="generic_webhook" name="generic_webhook" value="${escapeHtml(getSetting("generic_webhook"))}" placeholder="https://example.com/hooks/status" />
        </div>
        <button class="btn primary" type="submit">Save settings</button>
      </form>
    </main>
  `;
  return layout({ title: "Settings", body, toast });
}

function intervalOptions(selected: number): string {
  const opts = [
    [30, "Every 30 seconds"],
    [60, "Every minute"],
    [120, "Every 2 minutes"],
    [300, "Every 5 minutes"],
    [600, "Every 10 minutes"],
  ] as const;
  return opts
    .map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`)
    .join("");
}

function hostOf(url: string): string {
  const match = url.trim().match(/^https?:\/\/([^/?#]+)/i);
  return match?.[1] || url;
}

function padTicks(values: boolean[]): Array<boolean | null> {
  const missing = Math.max(0, TICK_COUNT - values.length);
  return [...Array(missing).fill(null), ...values];
}
