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
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
  <style>${css}</style>
</head>
<body class="mood-${mood}">
  <div class="wash" aria-hidden="true"></div>
  <div class="noise" aria-hidden="true"></div>
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
    <circle cx="24" cy="27" r="15" fill="#f3efe6"/>
    <ellipse cx="17.5" cy="26" rx="5.5" ry="6.5" fill="currentColor"/>
    <ellipse cx="30.5" cy="26" rx="5.5" ry="6.5" fill="currentColor"/>
    <circle cx="18" cy="26.5" r="1.7" fill="#f3efe6"/>
    <circle cx="31" cy="26.5" r="1.7" fill="#f3efe6"/>
    <ellipse cx="24" cy="32" rx="2.6" ry="2" fill="currentColor"/>
  </svg>`;
}

const css = `
:root {
  --bg: #070708;
  --ink: #f6f1e8;
  --muted: #8a8680;
  --hair: rgba(246,241,232,.08);
  --up: #5ee9a3;
  --up-deep: #14532d;
  --down: #fb7185;
  --watch: #fbbf24;
  --paper: #f3efe6;
}
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body {
  font-family: "Instrument Sans", ui-sans-serif, system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.wash {
  pointer-events: none; position: fixed; inset: 0; z-index: 0;
  background:
    radial-gradient(1200px 700px at 50% -10%, rgba(94,233,163,.16), transparent 58%),
    radial-gradient(900px 500px at 100% 100%, rgba(251,113,133,.06), transparent 50%);
  transition: background 1s ease;
}
.mood-down .wash {
  background:
    radial-gradient(1200px 700px at 50% -10%, rgba(251,113,133,.22), transparent 58%),
    radial-gradient(800px 400px at 0% 100%, rgba(251,191,36,.08), transparent 50%);
}
.mood-watch .wash {
  background:
    radial-gradient(1200px 700px at 50% -10%, rgba(251,191,36,.14), transparent 58%),
    radial-gradient(800px 400px at 80% 100%, rgba(94,233,163,.06), transparent 50%);
}
.noise {
  pointer-events: none; position: fixed; inset: 0; z-index: 0; opacity: .035;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
a { color: inherit; text-decoration: none; }
.shell { position: relative; z-index: 1; width: min(1120px, calc(100% - 48px)); margin: 0 auto; padding: 28px 0 96px; }
.nav {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 72px;
}
.brand { display: flex; align-items: center; gap: 10px; color: var(--paper); }
.brand .mark {
  width: 34px; height: 34px; border-radius: 11px;
  background: var(--paper); color: #111;
  display: grid; place-items: center;
}
.word { font-weight: 600; letter-spacing: -0.03em; font-size: 15px; }
.nav-links { display: flex; gap: 8px; align-items: center; }
.btn, button.btn {
  appearance: none; cursor: pointer; font: inherit; font-size: 13px; font-weight: 500;
  height: 38px; padding: 0 16px; border-radius: 999px;
  border: 1px solid var(--hair); background: rgba(246,241,232,.04); color: var(--ink);
  transition: background .2s ease, border-color .2s ease, transform .2s ease;
}
.btn:hover { background: rgba(246,241,232,.08); border-color: rgba(246,241,232,.16); transform: translateY(-1px); }
.btn.primary { background: var(--paper); color: #111; border-color: transparent; font-weight: 600; }
.btn.primary:hover { background: #fff; }
.btn.danger { color: var(--down); }
.hero { margin-bottom: 64px; max-width: 18ch; }
.kicker {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 12px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
  color: var(--up); margin: 0 0 18px;
}
.mood-down .kicker { color: var(--down); }
.mood-watch .kicker { color: var(--watch); }
.orb {
  width: 8px; height: 8px; border-radius: 50%; background: currentColor;
  box-shadow: 0 0 0 0 currentColor;
  animation: breathe 3.4s ease-out infinite;
}
@keyframes breathe {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 55%, transparent); }
  70% { box-shadow: 0 0 0 14px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
h1 {
  font-family: "Instrument Serif", ui-serif, Georgia, serif;
  font-size: clamp(3.4rem, 9vw, 6.4rem);
  font-weight: 400; letter-spacing: -0.045em; line-height: .92;
  margin: 0;
}
.subline { margin: 22px 0 0; color: var(--muted); font-size: 16px; max-width: 36ch; }
.section-label {
  font-size: 12px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
  color: var(--muted); margin: 0 0 16px;
}
.services { display: grid; gap: 10px; }
.service {
  padding: 22px 24px 24px;
  border: 1px solid var(--hair);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(246,241,232,.035), rgba(246,241,232,.015));
}
.service-top {
  display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
  margin-bottom: 16px;
}
.service h3 { margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.03em; }
.service .meta { color: var(--muted); font-size: 13px; display: flex; gap: 14px; flex-wrap: wrap; }
.state { font-size: 13px; font-weight: 600; }
.state.up { color: var(--up); }
.state.watch { color: var(--watch); }
.state.down { color: var(--down); }
.ticks { display: flex; gap: 3px; height: 44px; }
.tick {
  flex: 1; min-width: 2px; border-radius: 3px; background: rgba(246,241,232,.07);
  transition: transform .15s ease, filter .15s ease;
}
.tick:hover { transform: scaleY(1.08); filter: brightness(1.15); }
.tick.up {
  background: linear-gradient(180deg, #9af7c4, #2dd4a0);
  box-shadow: 0 8px 18px rgba(45,212,160,.12);
}
.tick.down { background: linear-gradient(180deg, #fda4af, #fb7185); }
.tick.unknown { background: rgba(246,241,232,.07); }
.empty {
  padding: 56px 24px; text-align: left;
  border: 1px dashed var(--hair); border-radius: 22px;
}
.empty h2 {
  font-family: "Instrument Serif", ui-serif, Georgia, serif;
  font-size: 2rem; font-weight: 400; margin: 0 0 8px; letter-spacing: -0.03em;
}
.empty p { margin: 0; color: var(--muted); }
.timeline { margin-top: 56px; display: grid; gap: 0; }
.incident {
  display: grid; grid-template-columns: 14px 1fr; gap: 16px;
  padding: 18px 0;
  border-top: 1px solid var(--hair);
}
.incident .dot {
  width: 10px; height: 10px; border-radius: 50%; margin-top: 7px;
  background: var(--muted);
}
.incident.open .dot { background: var(--down); box-shadow: 0 0 12px var(--down); }
.incident h3 { margin: 0; font-size: 16px; font-weight: 600; }
.incident p { margin: 6px 0 0; color: var(--muted); font-size: 14px; }
.footer {
  margin-top: 72px; color: var(--muted); font-size: 13px;
  display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
}
.login-shell {
  position: relative; z-index: 1; min-height: 100vh;
  display: grid; place-items: center; padding: 24px;
}
.login-card {
  width: min(420px, 100%);
  padding: 40px 36px;
  border: 1px solid var(--hair); border-radius: 28px;
  background: rgba(246,241,232,.03);
}
.login-card h1 {
  font-size: 3rem; margin: 22px 0 10px; max-width: none;
}
.hint { color: var(--muted); margin: 0 0 28px; }
label { display: block; font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin: 16px 0 8px; }
input, select, textarea {
  width: 100%; color: var(--ink); font: inherit;
  background: rgba(0,0,0,.28); border: 1px solid var(--hair);
  border-radius: 14px; padding: 12px 14px; outline: none;
}
input:focus, select:focus, textarea:focus { border-color: rgba(94,233,163,.45); }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.admin-grid { display: grid; grid-template-columns: 1.2fr .8fr; gap: 20px; }
.stack { display: grid; gap: 12px; }
.row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.page-kicker { color: var(--muted); font-size: 13px; margin: 0 0 8px; }
.toast {
  position: fixed; z-index: 20; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: var(--paper); color: #111; padding: 12px 18px; border-radius: 999px;
  font-size: 14px; font-weight: 600;
}
.error { color: var(--down); font-size: 14px; margin: 0 0 12px; }
@media (max-width: 840px) {
  .shell { width: min(1120px, calc(100% - 32px)); }
  .nav { margin-bottom: 48px; }
  .hero { margin-bottom: 40px; }
  .admin-grid, .grid-2 { grid-template-columns: 1fr; }
  .ticks { height: 32px; }
}
`;
