export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function layout(opts: {
  title: string;
  body: string;
  mood?: "up" | "watch" | "down";
  toast?: string;
}): string {
  const mood = opts.mood ?? "up";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>${css}</style>
</head>
<body class="mood-${mood}">
  ${opts.body}
  ${opts.toast ? `<div class="toast" role="status">${escapeHtml(opts.toast)}</div>` : ""}
</body>
</html>`;
}

export function ticks(values: Array<boolean | null>): string {
  const cells = values
    .map((value) => {
      const cls = value == null ? "unknown" : value ? "up" : "down";
      const label = value == null ? "No data" : value ? "Up" : "Down";
      return `<i class="tick ${cls}" title="${label}"></i>`;
    })
    .join("");
  return `<div class="ticks">${cells}</div>`;
}

export function formatTime(iso: string | null): string {
  if (!iso) return "Waiting for the first check";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatAgo(iso: string | null): string {
  if (!iso) return "Waiting for the first check";
  const sec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return `${sec} ${sec === 1 ? "second" : "seconds"} ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} ${min === 1 ? "minute" : "minutes"} ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr} ${hr === 1 ? "hour" : "hours"} ago`;
  const day = Math.round(hr / 24);
  return `${day} ${day === 1 ? "day" : "days"} ago`;
}

export function pct(ratio: number | null): string {
  if (ratio == null) return "new";
  return `${(ratio * 100).toFixed(2)}%`;
}

export function wordmark(name = "StatusPanda"): string {
  return `<a class="brand" href="/">
    <span class="mark">${miniPanda()}</span>
    <span class="word">${escapeHtml(name)}</span>
  </a>`;
}

function miniPanda(): string {
  return `<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
    <circle cx="14" cy="14" r="7.5" fill="currentColor"/>
    <circle cx="34" cy="14" r="7.5" fill="currentColor"/>
    <circle cx="24" cy="27" r="15" fill="#ffffff"/>
    <ellipse cx="17.5" cy="26" rx="5.5" ry="6.5" fill="currentColor"/>
    <ellipse cx="30.5" cy="26" rx="5.5" ry="6.5" fill="currentColor"/>
    <circle cx="18" cy="26.5" r="1.7" fill="#ffffff"/>
    <circle cx="31" cy="26.5" r="1.7" fill="#ffffff"/>
    <ellipse cx="24" cy="32" rx="2.6" ry="2" fill="currentColor"/>
  </svg>`;
}

const css = `
:root {
  --bg: #ffffff;
  --ink: #1a1a1a;
  --muted: #6b7280;
  --faint: #9ca3af;
  --line: #e5e7eb;
  --green: #22c55e;
  --green-text: #16a34a;
  --yellow: #d97706;
  --red: #ef4444;
  --soft-bg: #f9fafb;
}
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
.shell {
  width: min(920px, calc(100% - 48px));
  margin: 0 auto;
  padding: 28px 0 72px;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 56px;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.brand .mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--ink);
  color: #fff;
  display: grid;
  place-items: center;
}
.word {
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -.02em;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-link {
  padding: 8px 10px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
}
.nav-link:hover { color: var(--ink); }
.btn, button.btn {
  appearance: none;
  cursor: pointer;
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 14px;
  font-weight: 550;
}
.btn:hover { background: var(--soft-bg); }
.btn.primary {
  border-color: var(--ink);
  background: var(--ink);
  color: #fff;
}
.btn.danger { color: var(--red); }

/* Better Stack style hero: flat, no banner, no cards */
.hero {
  margin: 0 0 48px;
}
.hero-status {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}
.hero-mark {
  flex: 0 0 auto;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #fff;
}
.hero-mark svg { width: 26px; height: 26px; }
.hero-mark.up { background: var(--green); }
.hero-mark.watch { background: var(--yellow); }
.hero-mark.down { background: var(--red); }
.hero h1 {
  margin: 4px 0 0;
  max-width: none;
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  font-weight: 700;
  letter-spacing: -.03em;
  line-height: 1.15;
  color: var(--ink);
}
.hero-sub {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 15px;
}
.hero-updated {
  margin: 10px 0 0;
  color: var(--faint);
  font-size: 14px;
}

/* Flat service list: no outer panel, no nested cards */
.services {
  display: grid;
  gap: 0;
}
.monitor {
  padding: 28px 0;
  border-top: 1px solid var(--line);
}
.monitor:last-child { border-bottom: 1px solid var(--line); }
.monitor-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.monitor h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  letter-spacing: -.02em;
}
.monitor-desc {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 13px;
}
.status-text {
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 600;
}
.status-text.up { color: var(--green-text); }
.status-text.watch { color: var(--yellow); }
.status-text.down { color: var(--red); }
.monitor-bars {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ticks {
  display: flex;
  flex: 1;
  gap: 2px;
  height: 34px;
  min-width: 0;
}
.tick {
  flex: 1;
  min-width: 2px;
  border-radius: 2px;
  background: #e5e7eb;
}
.tick.up { background: var(--green); }
.tick.down { background: var(--red); }
.tick.unknown { background: #e5e7eb; }
.tick:hover { filter: brightness(.92); }
.uptime-pct {
  flex: 0 0 auto;
  color: var(--muted);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}
.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding-right: 96px;
  color: var(--faint);
  font-size: 12px;
}
.empty {
  padding: 40px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.empty h2 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 650;
}
.empty p {
  margin: 0;
  color: var(--muted);
}

.incidents {
  margin-top: 56px;
}
.incidents h2 {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -.02em;
}
.incident {
  padding: 18px 0;
  border-top: 1px solid var(--line);
}
.incident:last-child { border-bottom: 1px solid var(--line); }
.incident-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.incident h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
}
.incident-meta {
  margin: 6px 0 0;
  color: var(--faint);
  font-size: 13px;
}
.incident-body {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 14px;
}
.incident-empty {
  margin: 0;
  padding: 18px 0;
  border-top: 1px solid var(--line);
  color: var(--muted);
}
.footer {
  margin-top: 48px;
  color: var(--faint);
  font-size: 13px;
}

/* Admin / forms only: light bordered panels (not public status) */
.service {
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
}
.service-top {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: start;
  margin-bottom: 16px;
}
.service h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 650;
}
.service .meta {
  color: var(--muted);
  font-size: 13px;
}
.state {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 650;
}
.state.up { background: #ecfdf5; color: var(--green-text); }
.state.watch { background: #fffbeb; color: var(--yellow); }
.state.down { background: #fef2f2; color: var(--red); }
.login-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--soft-bg);
}
.login-card {
  width: min(400px, 100%);
  padding: 32px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
}
.login-card h1 {
  margin: 20px 0 8px;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -.03em;
  max-width: none;
}
.hint {
  margin: 0 0 22px;
  color: var(--muted);
  font-size: 14px;
}
label {
  display: block;
  margin: 14px 0 6px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
}
input, select, textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  outline: none;
}
input:focus, select:focus, textarea:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148,163,184,.25);
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.admin-grid {
  display: grid;
  grid-template-columns: 1.15fr .85fr;
  gap: 16px;
  align-items: start;
}
.stack { display: grid; gap: 12px; }
.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.page-kicker {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
}
h1 {
  margin: 0;
  color: var(--ink);
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
  letter-spacing: -.03em;
  line-height: 1.15;
}
.toast {
  position: fixed;
  z-index: 20;
  right: 20px;
  bottom: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--ink);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
.error {
  margin: 0 0 12px;
  color: var(--red);
  font-size: 14px;
}
@media (max-width: 720px) {
  .shell { width: min(920px, calc(100% - 28px)); padding-top: 20px; }
  .nav { margin-bottom: 36px; }
  .nav-link { display: none; }
  .hero { margin-bottom: 32px; }
  .hero-status { gap: 14px; }
  .hero-mark { width: 44px; height: 44px; }
  .monitor-bars { flex-wrap: wrap; }
  .uptime-pct { width: 100%; }
  .range-labels { padding-right: 0; }
  .admin-grid, .grid-2 { grid-template-columns: 1fr; }
  .ticks { height: 28px; }
}
`;
