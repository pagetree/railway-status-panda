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
import { escapeHtml, formatAgo, formatTime, layout, panda, pct, ticks, wordmark } from "./ui.js";

export type Overall = "calm" | "watch" | "down";

export function overallStatus(): Overall {
  const monitors = listMonitors().filter((m) => m.enabled);
  if (!monitors.length) return "watch";
  const states = monitors.map((m) => latestCheck(m.id));
  if (states.some((c) => c && !c.ok)) return "down";
  if (states.some((c) => !c)) return "watch";
  return "calm";
}

const headlines: Record<Overall, { kicker: string; title: string; lede: string }> = {
  calm: {
    kicker: "All calm",
    title: "The panda is napping.",
    lede: "Every service we watch is answering. Go drink some tea.",
  },
  watch: {
    kicker: "Warming up",
    title: "Eyes open, still stretching.",
    lede: "Checks are running. This page will settle as soon as the first heartbeats land.",
  },
  down: {
    kicker: "Something broke",
    title: "The panda sat up.",
    lede: "At least one service missed a check. Details are below.",
  },
};

export function statusPage(): string {
  const overall = overallStatus();
  const copy = headlines[overall];
  const monitors = listMonitors();
  const incidents = listIncidents(8);
  const brand = process.env.APP_NAME?.trim() || "StatusPanda";
  const title = getSetting("page_title", brand);
  const subtitle = getSetting("page_subtitle") || copy.lede;
  const last = lastCheckedAt();

  const body = `
    <div class="wrap">
      <nav class="nav">
        ${wordmark()}
        <div class="nav-links">
          <a class="btn ghost" href="/login">Admin</a>
        </div>
      </nav>
      <section class="hero">
        ${panda(overall)}
        <div>
          <div class="kicker">${copy.kicker}</div>
          <h1>${escapeHtml(title === brand ? copy.title : title)}</h1>
          <p class="lede">${escapeHtml(subtitle)}</p>
          <div class="meta">
            <span><i class="dot ${overall === "calm" ? "up" : overall}"></i>Updated ${escapeHtml(formatAgo(last))}</span>
            <span>${monitors.length} ${monitors.length === 1 ? "monitor" : "monitors"}</span>
          </div>
        </div>
      </section>
      ${monitors.length ? monitorList(monitors) : emptyPublic()}
      ${incidentList(incidents)}
      <footer class="footer">
        <span>A quiet status page for people who ship.</span>
        <span>StatusPanda on Railway</span>
      </footer>
    </div>
    <script>
      const src = new EventSource('/events');
      src.onmessage = () => { location.reload(); };
    </script>
  `;

  return layout({ title: `${title} · status`, body });
}

function emptyPublic(): string {
  return `<div class="empty card">
    <h2>Nobody to watch yet</h2>
    <p class="sub">Open Admin, paste a URL, and this page becomes a live status board.</p>
  </div>`;
}

function monitorList(monitors: Monitor[]): string {
  const cards = monitors
    .map((monitor) => {
      const last = latestCheck(monitor.id);
      const ok = last ? Boolean(last.ok) : null;
      const state = ok == null ? "watch" : ok ? "up" : "down";
      const label = ok == null ? "Checking" : ok ? "Operational" : "Down";
      const history = padTicks(recentChecks(monitor.id, 40).map((c) => Boolean(c.ok)));
      const latency = last?.latency_ms != null ? `${last.latency_ms}ms` : "…";
      const up = pct(uptimeRatio(monitor.id));
      return `<article class="card mon">
        <div>
          <h3>${escapeHtml(monitor.name)}</h3>
          <div class="sub">${escapeHtml(hostOf(monitor.url))} · ${latency} · ${up} uptime</div>
        </div>
        <span class="pill ${state}">${label}</span>
        <div style="grid-column: 1 / -1">${ticks(history)}</div>
      </article>`;
    })
    .join("");
  return `<div class="list">${cards}</div>`;
}

function incidentList(incidents: Array<{ title: string; started_at: string; ended_at: string | null; monitor_name: string; body: string }>): string {
  if (!incidents.length) return "";
  const items = incidents
    .map((item) => {
      const open = !item.ended_at;
      return `<article class="card incident">
        <strong>${escapeHtml(item.title)}</strong>
        <div class="sub">${escapeHtml(item.monitor_name)} · ${escapeHtml(formatTime(item.started_at))}${open ? " · ongoing" : ` · resolved ${escapeHtml(formatTime(item.ended_at))}`}</div>
        <div class="sub">${escapeHtml(item.body)}</div>
      </article>`;
    })
    .join("");
  return `<section class="incidents"><h2>Incidents</h2><div class="list" style="margin-top:12px">${items}</div></section>`;
}

export function loginPage(error?: string): string {
  const body = `
    <div class="login-shell">
      <div class="login-card">
        ${wordmark()}
        <h1 style="font-size:2.2rem;margin:18px 0 8px">Welcome back.</h1>
        <p class="hint">Your password lives in Railway under this service, in the variable named ADMIN_PASSWORD. Username defaults to admin.</p>
        ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
        <form method="post" action="/login">
          <label for="user">Username</label>
          <input id="user" name="user" autocomplete="username" value="admin" />
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required />
          <div style="margin-top:18px" class="row">
            <button class="btn primary" type="submit">Open the den</button>
            <a class="btn" href="/">Public status</a>
          </div>
        </form>
      </div>
    </div>
  `;
  return layout({ title: "StatusPanda login", body });
}

export function adminPage(opts: { toast?: string; editId?: number }): string {
  const monitors = listMonitors();
  const edit = opts.editId ? getMonitor(opts.editId) : undefined;
  const body = `
    <div class="wrap">
      <nav class="nav">
        ${wordmark()}
        <div class="nav-links">
          <a class="btn ghost" href="/">View status</a>
          <a class="btn ghost" href="/admin/settings">Settings</a>
          <form method="post" action="/logout"><button class="btn" type="submit">Log out</button></form>
        </div>
      </nav>
      <section class="hero">
        ${panda(overallStatus())}
        <div>
          <div class="kicker">Control den</div>
          <h1>Watch the web without the fuss.</h1>
          <p class="lede">Paste a URL. We check it, draw a public page, and shout if it falls over.</p>
        </div>
      </section>
      <div class="admin-grid">
        <div class="stack">
          ${monitors.length ? monitors.map((m) => adminCard(m, opts.editId)).join("") : `<div class="empty card"><h2>First watch</h2><p class="sub">Add a site on the right. We will start checking within a minute.</p></div>`}
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
            <button class="btn primary" type="submit">${edit ? "Save monitor" : "Start watching"}</button>
            ${edit ? `<a class="btn" href="/admin">Cancel</a>` : ""}
          </form>
        </div>
      </div>
    </div>
  `;
  return layout({ title: "StatusPanda admin", body, toast: opts.toast });
}

function adminCard(monitor: Monitor, editId?: number): string {
  const last = latestCheck(monitor.id);
  const ok = last ? Boolean(last.ok) : null;
  const state = ok == null ? "watch" : ok ? "up" : "down";
  const label = ok == null ? "Checking" : ok ? "Operational" : "Down";
  const history = padTicks(recentChecks(monitor.id, 40).map((c) => Boolean(c.ok)));
  return `<article class="card">
    <div class="mon">
      <div>
        <h3>${escapeHtml(monitor.name)}</h3>
        <div class="sub">${escapeHtml(monitor.url)}</div>
      </div>
      <span class="pill ${state}">${label}</span>
      <div style="grid-column:1/-1">${ticks(history)}</div>
    </div>
    <div class="row" style="margin-top:12px">
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
    <div class="wrap">
      <nav class="nav">
        ${wordmark()}
        <div class="nav-links">
          <a class="btn ghost" href="/admin">Monitors</a>
          <a class="btn ghost" href="/">View status</a>
        </div>
      </nav>
      <h1>Status page & alerts</h1>
      <p class="lede">These are optional. Leave webhooks empty until you want a shout in Discord or Slack.</p>
      <form method="post" action="/admin/settings" class="card stack" style="margin-top:20px">
        <div>
          <label for="page_title">Public title</label>
          <input id="page_title" name="page_title" value="${escapeHtml(getSetting("page_title", process.env.APP_NAME?.trim() || "StatusPanda"))}" />
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
    </div>
  `;
  return layout({ title: "StatusPanda settings", body, toast });
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
  const missing = Math.max(0, 40 - values.length);
  return [...Array(missing).fill(null), ...values];
}
