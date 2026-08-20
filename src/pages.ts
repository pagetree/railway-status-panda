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

const headlines: Record<Overall, { title: string; lede: string; kicker: string; mood: "up" | "watch" | "down" }> = {
  calm: {
    title: "All systems operational",
    lede: "Every monitored endpoint is responding normally.",
    kicker: "Operational",
    mood: "up",
  },
  watch: {
    title: "Gathering live status",
    lede: "Checks are running. History fills in as results arrive.",
    kicker: "Monitoring",
    mood: "watch",
  },
  down: {
    title: "Partial system outage",
    lede: "At least one monitored endpoint is currently unavailable.",
    kicker: "Degraded",
    mood: "down",
  },
};

function brandName(): string {
  return process.env.APP_NAME?.trim() || "StatusPanda";
}

function nav(brand: string, extra: string): string {
  return `<header class="nav">
    ${wordmark(brand)}
    <div class="nav-links">${extra}</div>
  </header>`;
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
  const headline = title === brand ? copy.title : title;
  const openIncidents = incidents.filter((incident) => !incident.ended_at).length;
  const uptime = overallUptime(monitors);
  const enabled = monitors.filter((m) => m.enabled).length;

  const body = `
    <div class="shell status-shell">
      ${nav(
        brand,
        `<a class="nav-link" href="#services">Services</a>
         <a class="nav-link" href="#incidents">Incidents</a>
         <a class="btn ghost" href="/login">Admin</a>`
      )}

      <section class="status-banner mood-${copy.mood}" id="status">
        <div class="status-banner-glow" aria-hidden="true"></div>
        <div class="status-banner-inner">
          <div class="status-banner-main">
            <div class="live-pill">
              <i class="pulse"></i>
              <span>Live</span>
            </div>
            <h1 class="status-title">
              <span class="status-icon" aria-hidden="true">${statusGlyph(copy.mood)}</span>
              ${escapeHtml(headline)}
            </h1>
            <p class="status-lede">${escapeHtml(subtitle)}</p>
          </div>
          <div class="status-banner-meta">
            <div class="meta-chip">
              <span class="meta-label">Last checked</span>
              <strong>${escapeHtml(formatAgo(last))}</strong>
            </div>
            <div class="meta-chip">
              <span class="meta-label">Overall</span>
              <strong class="tone">${escapeHtml(copy.kicker)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="metric-strip" aria-label="Status overview">
        <div class="metric">
          <span class="metric-value">${monitors.length}</span>
          <span class="metric-label">Services</span>
        </div>
        <div class="metric">
          <span class="metric-value">${enabled}</span>
          <span class="metric-label">Active checks</span>
        </div>
        <div class="metric">
          <span class="metric-value">${uptime}</span>
          <span class="metric-label">Avg uptime</span>
        </div>
        <div class="metric">
          <span class="metric-value">${openIncidents}</span>
          <span class="metric-label">Open incidents</span>
        </div>
      </section>

      ${monitors.length ? monitorList(monitors) : emptyPublic()}
      ${incidentList(incidents)}

      <footer class="footer">
        <span>Powered by <strong>StatusPanda</strong></span>
        <span>Realtime uptime on Railway</span>
      </footer>
    </div>
    <script>
      const src = new EventSource('/events');
      src.onmessage = () => { location.reload(); };
    </script>
  `;

  return layout({ title: `${title} status`, body, mood: copy.mood });
}

function statusGlyph(mood: "up" | "watch" | "down"): string {
  if (mood === "up") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 12.5l3.2 3.2L17.5 8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  if (mood === "down") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="17" r="1.5" fill="currentColor"/></svg>`;
}

function overallUptime(monitors: Monitor[]): string {
  const ratios = monitors.map((monitor) => uptimeRatio(monitor.id)).filter((ratio): ratio is number => ratio != null);
  if (!ratios.length) return "new";
  const value = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
  return pct(value);
}

function emptyPublic(): string {
  return `<section class="panel-section" id="services">
    <div class="section-head">
      <div>
        <p class="section-kicker">Services</p>
        <h2 class="section-title">Current status</h2>
      </div>
    </div>
    <div class="empty">
      <h2>No services yet</h2>
      <p>Open Admin and add the first endpoint to start publishing uptime.</p>
    </div>
  </section>`;
}

function monitorList(monitors: Monitor[]): string {
  const rows = monitors
    .map((monitor) => {
      const last = latestCheck(monitor.id);
      const ok = last ? Boolean(last.ok) : null;
      const state = ok == null ? "watch" : ok ? "up" : "down";
      const label = ok == null ? "Checking" : ok ? "Operational" : "Down";
      const history = padTicks(recentChecks(monitor.id, TICK_COUNT).map((c) => Boolean(c.ok)));
      const latency = last?.latency_ms != null ? `${last.latency_ms}ms` : "Pending";
      const up = pct(uptimeRatio(monitor.id));
      return `<article class="service-row">
        <div class="service-row-top">
          <div class="service-identity">
            <h3>${escapeHtml(monitor.name)}</h3>
            <div class="meta">
              <span class="host">${escapeHtml(hostOf(monitor.url))}</span>
              <span class="sep" aria-hidden="true"></span>
              <span class="latency">${latency}</span>
            </div>
          </div>
          <div class="service-aside">
            <span class="state ${state}"><i></i>${label}</span>
            <div class="uptime-block">
              <strong>${up}</strong>
              <span>uptime</span>
            </div>
          </div>
        </div>
        ${ticks(history)}
        <div class="range-labels"><span>90 checks ago</span><span>Now</span></div>
      </article>`;
    })
    .join("");
  return `<section class="panel-section" id="services">
    <div class="section-head">
      <div>
        <p class="section-kicker">Services</p>
        <h2 class="section-title">Current status</h2>
      </div>
      <span class="section-count">${monitors.length} monitored</span>
    </div>
    <div class="services-panel">
      <div class="group-bar">
        <span>Production</span>
        <span>Uptime history</span>
      </div>
      ${rows}
    </div>
  </section>`;
}

function incidentList(
  incidents: Array<{ title: string; started_at: string; ended_at: string | null; monitor_name: string; body: string }>
): string {
  const items = incidents.length
    ? incidents
        .map((item) => {
          const open = !item.ended_at;
          return `<article class="incident ${open ? "open" : ""}">
            <div class="incident-rail" aria-hidden="true"><i class="dot"></i></div>
            <div class="incident-body">
              <div class="incident-top">
                <h3>${escapeHtml(item.title)}</h3>
                <span class="incident-badge ${open ? "open" : "resolved"}">${open ? "Ongoing" : "Resolved"}</span>
              </div>
              <p class="incident-meta">${escapeHtml(item.monitor_name)} · ${escapeHtml(formatTime(item.started_at))}${
                open ? "" : ` · Resolved ${escapeHtml(formatTime(item.ended_at))}`
              }</p>
              <p class="incident-copy">${escapeHtml(item.body)}</p>
            </div>
          </article>`;
        })
        .join("")
    : `<div class="empty quiet"><h2>No incidents</h2><p>Everything has stayed quiet so far.</p></div>`;
  return `<section class="panel-section" id="incidents">
    <div class="section-head">
      <div>
        <p class="section-kicker">History</p>
        <h2 class="section-title">Past incidents</h2>
      </div>
      <span class="section-count">${incidents.length ? `${incidents.length} shown` : "All clear"}</span>
    </div>
    <div class="timeline">${items}</div>
  </section>`;
}

export function loginPage(error?: string): string {
  const body = `
    <div class="login-shell">
      <div class="login-card">
        ${wordmark(brandName())}
        <h1>Welcome in.</h1>
        <p class="hint">Username defaults to admin. Password is ADMIN_PASSWORD in your Railway variables.</p>
        ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
        <form method="post" action="/login">
          <label for="user">Username</label>
          <input id="user" name="user" autocomplete="username" value="admin" />
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required />
          <div class="row" style="margin-top:28px">
            <button class="btn primary" type="submit">Enter</button>
            <a class="btn" href="/">Status page</a>
          </div>
        </form>
      </div>
    </div>
  `;
  return layout({ title: "Admin", body, mood: "up" });
}

export function adminPage(opts: { toast?: string; editId?: number }): string {
  const monitors = listMonitors();
  const edit = opts.editId ? getMonitor(opts.editId) : undefined;
  const brand = brandName();
  const body = `
    <div class="shell">
      ${nav(
        brand,
        `<a class="btn" href="/">Status</a>
         <a class="btn" href="/admin/settings">Settings</a>
         <form method="post" action="/logout"><button class="btn" type="submit">Sign out</button></form>`
      )}
      <p class="page-kicker">Admin</p>
      <h1 style="font-size:clamp(2.6rem,6vw,4.2rem);max-width:12ch;margin-bottom:36px">What should we watch?</h1>
      <div class="admin-grid">
        <div class="stack">
          ${
            monitors.length
              ? monitors.map((m) => adminCard(m, opts.editId)).join("")
              : `<div class="empty"><h2>No monitors yet</h2><p>Add a URL on the right. The first check runs within a minute.</p></div>`
          }
        </div>
        <form class="service" method="post" action="${edit ? `/admin/monitors/${edit.id}` : "/admin/monitors"}">
          <h3 style="margin-bottom:8px">${edit ? "Edit monitor" : "Add a monitor"}</h3>
          <div class="stack">
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
            <div class="row">
              <button class="btn primary" type="submit">${edit ? "Save" : "Add monitor"}</button>
              ${edit ? `<a class="btn" href="/admin">Cancel</a>` : ""}
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
  return layout({ title: "Monitors", body, mood: overallStatus() === "down" ? "down" : "up", toast: opts.toast });
}

function adminCard(monitor: Monitor, editId?: number): string {
  const last = latestCheck(monitor.id);
  const ok = last ? Boolean(last.ok) : null;
  const state = ok == null ? "watch" : ok ? "up" : "down";
  const label = ok == null ? "Checking" : ok ? "Up" : "Down";
  const history = padTicks(recentChecks(monitor.id, TICK_COUNT).map((c) => Boolean(c.ok)));
  return `<article class="service">
    <div class="service-top">
      <div>
        <h3>${escapeHtml(monitor.name)}</h3>
        <div class="meta"><span>${escapeHtml(monitor.url)}</span></div>
      </div>
      <span class="state ${state}">${label}</span>
    </div>
    ${ticks(history)}
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
  const brand = brandName();
  const body = `
    <div class="shell">
      ${nav(brand, `<a class="btn" href="/admin">Monitors</a><a class="btn" href="/">Status</a>`)}
      <p class="page-kicker">Settings</p>
      <h1 style="font-size:clamp(2.6rem,6vw,4.2rem);max-width:10ch;margin-bottom:36px">Page and alerts</h1>
      <form method="post" action="/admin/settings" class="service stack">
        <div>
          <label for="page_title">Public title</label>
          <input id="page_title" name="page_title" value="${escapeHtml(getSetting("page_title", brand))}" />
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
        <button class="btn primary" type="submit">Save</button>
      </form>
    </div>
  `;
  return layout({ title: "Settings", body, mood: "up", toast });
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
