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
  tab?: "public" | "login" | "admin";
  toast?: string;
}): string {
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
<body>
  ${opts.body}
  ${opts.toast ? `<div class="toast" role="status">${escapeHtml(opts.toast)}</div>` : ""}
</body>
</html>`;
}

export function ticks(values: Array<boolean | null>): string {
  const cells = values
    .map((value, index) => {
      const cls = value == null ? "unknown" : value ? "up" : "down";
      const label = value == null ? "No data yet" : value ? "Available" : "Unavailable";
      return `<i class="tick ${cls}" style="animation-delay:${index * 8}ms" title="${label}"></i>`;
    })
    .join("");
  return `<div class="ticks" aria-hidden="true">${cells}</div>`;
}

export function formatTime(iso: string | null): string {
  if (!iso) return "Waiting for the first check";
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatAgo(iso: string | null): string {
  if (!iso) return "Waiting for the first check";
  const sec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return `Updated ${sec} ${sec === 1 ? "second" : "seconds"} ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `Updated ${min} ${min === 1 ? "minute" : "minutes"} ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `Updated ${hr} ${hr === 1 ? "hour" : "hours"} ago`;
  const day = Math.round(hr / 24);
  return `Updated ${day} ${day === 1 ? "day" : "days"} ago`;
}

export function pct(ratio: number | null): string {
  if (ratio == null) return "Collecting";
  return `${(ratio * 100).toFixed(2)}%`;
}

export function wordmark(name = "StatusPanda"): string {
  return `<a class="brand" href="/">
    <span class="mark">${miniPanda()}</span>
    <span class="word">${escapeHtml(name)}</span>
  </a>`;
}

function miniPanda(): string {
  return `<svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true">
    <circle cx="14" cy="14" r="8" fill="#202124"/>
    <circle cx="34" cy="14" r="8" fill="#202124"/>
    <circle cx="24" cy="27" r="16" fill="#fff"/>
    <ellipse cx="17" cy="26" rx="6" ry="7" fill="#202124"/>
    <ellipse cx="31" cy="26" rx="6" ry="7" fill="#202124"/>
    <circle cx="17" cy="26" r="2" fill="#fff"/>
    <circle cx="31" cy="26" r="2" fill="#fff"/>
    <ellipse cx="24" cy="32" rx="3" ry="2.2" fill="#202124"/>
  </svg>`;
}

const css = `
:root {
  --bg: #f8f9fa;
  --surface: #ffffff;
  --ink: #202124;
  --muted: #5f6368;
  --line: #dadce0;
  --line-soft: #e8eaed;
  --ok: #188038;
  --ok-bg: #e6f4ea;
  --ok-ink: #137333;
  --watch: #e37400;
  --watch-bg: #fef7e0;
  --watch-ink: #b06000;
  --down: #d93025;
  --down-bg: #fce8e6;
  --down-ink: #c5221f;
  --blue: #1a73e8;
  --blue-hover: #1557b0;
  --radius: 12px;
  --shadow: 0 1px 2px rgba(60,64,67,.12), 0 1px 3px rgba(60,64,67,.16);
}
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body {
  font-family: Inter, "Google Sans", Roboto, Arial, sans-serif;
  background: var(--bg);
  color: var(--ink);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
a { color: var(--blue); text-decoration: none; }
a:hover { text-decoration: underline; }
.topbar {
  position: sticky; top: 0; z-index: 20;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  height: 64px;
  display: flex; align-items: center;
}
.topbar-inner, .wrap {
  width: min(880px, calc(100% - 40px));
  margin: 0 auto;
}
.topbar-inner {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.brand { display: flex; align-items: center; gap: 10px; color: var(--ink); text-decoration: none; }
.brand:hover { text-decoration: none; }
.brand .mark {
  width: 32px; height: 32px; border-radius: 8px;
  background: #e8f0fe; color: #202124;
  display: grid; place-items: center;
}
.word { font-weight: 600; font-size: 16px; letter-spacing: -0.01em; }
.crumb { color: var(--muted); font-size: 13px; font-weight: 500; }
.nav-links { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.wrap { padding: 32px 0 80px; }
.btn, button.btn {
  appearance: none; border: 1px solid var(--line); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  height: 36px; padding: 0 16px; border-radius: 18px;
  font: inherit; font-weight: 500; font-size: 14px;
  background: var(--surface); color: var(--blue);
  transition: background .15s ease, box-shadow .15s ease;
}
.btn:hover { background: #f1f3f4; text-decoration: none; }
.btn.primary {
  background: var(--blue); color: #fff; border-color: var(--blue);
}
.btn.primary:hover { background: var(--blue-hover); }
.btn.danger { color: var(--down); border-color: var(--line); }
.btn.ghost { background: transparent; }
.banner {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 20px 22px; border-radius: var(--radius);
  margin-bottom: 28px;
}
.banner.up { background: var(--ok-bg); color: var(--ok-ink); }
.banner.watch { background: var(--watch-bg); color: var(--watch-ink); }
.banner.down { background: var(--down-bg); color: var(--down-ink); }
.banner h1 {
  margin: 0; font-size: 22px; font-weight: 500; letter-spacing: -0.02em; line-height: 1.3;
}
.banner .lede { margin: 4px 0 0; font-size: 14px; opacity: .9; }
.banner .meta { margin-top: 8px; font-size: 13px; opacity: .8; }
.status-icon {
  width: 28px; height: 28px; flex-shrink: 0; margin-top: 2px;
}
.live {
  width: 10px; height: 10px; border-radius: 50%; background: currentColor;
  box-shadow: 0 0 0 0 currentColor;
  animation: live 2.2s ease-out infinite;
  display: inline-block; margin-right: 8px; vertical-align: middle;
}
@keyframes live {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 45%, transparent); }
  70% { box-shadow: 0 0 0 8px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
.panel {
  background: var(--surface);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.panel-head {
  display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
  padding: 16px 20px 12px; border-bottom: 1px solid var(--line-soft);
}
.panel-head h2, .page-title {
  margin: 0; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;
}
.legend { color: var(--muted); font-size: 12px; }
.service {
  display: grid; grid-template-columns: 1fr auto; gap: 6px 16px;
  padding: 16px 20px 18px;
  border-bottom: 1px solid var(--line-soft);
}
.service:last-child { border-bottom: 0; }
.service h3 { margin: 0; font-size: 15px; font-weight: 600; }
.service .sub { color: var(--muted); font-size: 13px; }
.pill {
  font-size: 13px; font-weight: 600; padding: 2px 0; white-space: nowrap;
}
.pill.up { color: var(--ok); }
.pill.watch { color: var(--watch); }
.pill.down { color: var(--down); }
.ticks {
  grid-column: 1 / -1;
  display: flex; gap: 2px; height: 28px; align-items: stretch; margin-top: 8px;
}
.tick {
  flex: 1; min-width: 3px; border-radius: 2px; background: #e8eaed;
  transition: transform .12s ease, background .2s ease;
}
.tick:hover { transform: scaleY(1.12); }
.tick.up { background: #34a853; }
.tick.down { background: #ea4335; }
.tick.unknown { background: #e8eaed; }
.empty {
  padding: 48px 24px; text-align: center; color: var(--muted);
}
.empty h2 { margin: 0 0 6px; font-size: 18px; color: var(--ink); font-weight: 500; }
.incidents { margin-top: 28px; }
.incident { padding: 16px 20px; border-bottom: 1px solid var(--line-soft); }
.incident:last-child { border-bottom: 0; }
.incident strong { display: block; font-size: 14px; font-weight: 600; }
.footer {
  margin-top: 32px; color: var(--muted); font-size: 12px;
  display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
}
.login-shell { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: var(--bg); }
.login-card {
  width: min(400px, 100%); background: var(--surface);
  border: 1px solid var(--line); border-radius: 8px;
  padding: 48px 40px 36px; box-shadow: var(--shadow);
}
.login-card h1 { margin: 20px 0 8px; font-size: 24px; font-weight: 400; }
.hint { color: var(--muted); font-size: 14px; margin: 0 0 24px; }
label { display: block; font-size: 12px; font-weight: 500; color: var(--muted); margin: 16px 0 6px; }
input, select, textarea {
  width: 100%; background: var(--surface); color: var(--ink);
  border: 1px solid var(--line); border-radius: 4px; padding: 10px 12px;
  font: inherit; outline: none;
}
input:focus, select:focus, textarea:focus { border-color: var(--blue); box-shadow: 0 0 0 1px var(--blue); }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.admin-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 20px; }
.stack { display: grid; gap: 12px; }
.row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.page-title { font-size: 28px; font-weight: 400; margin: 0 0 8px; }
.lede { color: var(--muted); margin: 0 0 24px; font-size: 14px; }
.card {
  background: var(--surface); border: 1px solid var(--line-soft);
  border-radius: var(--radius); box-shadow: var(--shadow); padding: 20px;
}
.toast {
  position: fixed; z-index: 30; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #323232; color: #fff; padding: 12px 20px; border-radius: 4px;
  font-size: 14px; box-shadow: var(--shadow);
}
.error { color: var(--down); font-size: 13px; margin: 0 0 12px; }
@media (max-width: 820px) {
  .admin-grid, .grid-2 { grid-template-columns: 1fr; }
  .login-card { padding: 32px 24px; }
  .crumb { display: none; }
}
`;
