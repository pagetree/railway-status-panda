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
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet" />
  <style>${css}</style>
</head>
<body class="mood-${mood}">
  <div class="wash" aria-hidden="true"></div>
  <div class="grid-bg" aria-hidden="true"></div>
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
    <circle cx="24" cy="27" r="15" fill="#eef2f7"/>
    <ellipse cx="17.5" cy="26" rx="5.5" ry="6.5" fill="currentColor"/>
    <ellipse cx="30.5" cy="26" rx="5.5" ry="6.5" fill="currentColor"/>
    <circle cx="18" cy="26.5" r="1.7" fill="#eef2f7"/>
    <circle cx="31" cy="26.5" r="1.7" fill="#eef2f7"/>
    <ellipse cx="24" cy="32" rx="2.6" ry="2" fill="currentColor"/>
  </svg>`;
}

const css = `
:root {
  --bg: #eef2f7;
  --bg-deep: #e4eaf2;
  --surface: #ffffff;
  --ink: #0b1220;
  --soft: #5b667a;
  --faint: #8b95a7;
  --line: #d7dee8;
  --line-strong: #c5cfdd;
  --green: #12b76a;
  --green-deep: #039855;
  --green-soft: #e8f8ef;
  --green-ink: #027a48;
  --yellow: #dc6803;
  --yellow-soft: #fff4e5;
  --red: #f04438;
  --red-soft: #fef3f2;
  --blue: #2e6bff;
  --shadow: 0 18px 50px rgba(15, 23, 42, .08);
  --radius: 20px;
  --radius-sm: 14px;
  --mono: "IBM Plex Mono", ui-monospace, monospace;
}
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body {
  font-family: "Outfit", ui-sans-serif, system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.wash {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(980px 520px at 12% -10%, rgba(18,183,106,.16), transparent 58%),
    radial-gradient(760px 420px at 92% 0%, rgba(46,107,255,.10), transparent 55%),
    linear-gradient(180deg, #f7f9fc 0%, transparent 38%);
}
.mood-down .wash {
  background:
    radial-gradient(980px 520px at 12% -10%, rgba(240,68,56,.16), transparent 58%),
    radial-gradient(760px 420px at 92% 0%, rgba(220,104,3,.10), transparent 55%),
    linear-gradient(180deg, #f7f9fc 0%, transparent 38%);
}
.mood-watch .wash {
  background:
    radial-gradient(980px 520px at 12% -10%, rgba(220,104,3,.14), transparent 58%),
    radial-gradient(760px 420px at 92% 0%, rgba(18,183,106,.08), transparent 55%),
    linear-gradient(180deg, #f7f9fc 0%, transparent 38%);
}
.grid-bg {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: .45;
  background-image:
    linear-gradient(rgba(15,23,42,.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15,23,42,.035) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 55% at 50% 0%, #000 20%, transparent 75%);
}
a { color: inherit; text-decoration: none; }
.shell {
  position: relative;
  z-index: 1;
  width: min(960px, calc(100% - 40px));
  margin: 0 auto;
  padding: 24px 0 80px;
}
.status-shell { animation: rise .55s ease both; }
@keyframes rise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--ink);
}
.brand .mark {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--ink);
  color: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 10px 24px rgba(11,18,32,.18);
}
.word {
  font-size: 17px;
  font-weight: 750;
  letter-spacing: -.04em;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-link {
  padding: 8px 12px;
  color: var(--soft);
  font-size: 14px;
  font-weight: 600;
  border-radius: 999px;
  transition: color .18s ease, background .18s ease;
}
.nav-link:hover {
  color: var(--ink);
  background: rgba(255,255,255,.7);
}
.btn, button.btn {
  appearance: none;
  cursor: pointer;
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255,255,255,.78);
  color: var(--ink);
  font: inherit;
  font-size: 14px;
  font-weight: 650;
  transition: transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease;
}
.btn:hover {
  transform: translateY(-1px);
  border-color: var(--line-strong);
  background: #fff;
  box-shadow: 0 10px 22px rgba(15,23,42,.08);
}
.btn.ghost {
  background: transparent;
}
.btn.primary {
  border-color: var(--ink);
  background: var(--ink);
  color: #fff;
}
.btn.danger { color: var(--red); }

/* ===== Public status banner ===== */
.status-banner {
  position: relative;
  overflow: hidden;
  margin: 0 0 18px;
  border-radius: 28px;
  color: #fff;
  box-shadow: var(--shadow);
}
.status-banner.mood-up {
  background: linear-gradient(135deg, #039855 0%, #12b76a 42%, #0ea5e9 140%);
}
.status-banner.mood-watch {
  background: linear-gradient(135deg, #b54708 0%, #dc6803 48%, #f79009 140%);
}
.status-banner.mood-down {
  background: linear-gradient(135deg, #b42318 0%, #f04438 48%, #fb7185 140%);
}
.status-banner-glow {
  position: absolute;
  inset: auto -10% -40% 40%;
  height: 180%;
  background: radial-gradient(circle, rgba(255,255,255,.22), transparent 62%);
  animation: drift 8s ease-in-out infinite alternate;
}
@keyframes drift {
  from { transform: translateX(0) scale(1); }
  to { transform: translateX(-8%) scale(1.06); }
}
.status-banner-inner {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  padding: 34px 36px 32px;
}
.status-banner-main { min-width: 0; max-width: 44rem; }
.live-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  padding: 6px 12px 6px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,.16);
  border: 1px solid rgba(255,255,255,.22);
  backdrop-filter: blur(8px);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.pulse {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 0 0 0 rgba(255,255,255,.55);
  animation: ping 1.8s ease-out infinite;
}
@keyframes ping {
  0% { box-shadow: 0 0 0 0 rgba(255,255,255,.55); }
  70% { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
}
.status-title {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0;
  max-width: none;
  font-family: inherit;
  font-size: clamp(1.9rem, 4.4vw, 3rem);
  font-weight: 750;
  line-height: 1.05;
  letter-spacing: -.045em;
  color: #fff;
}
.status-icon {
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255,255,255,.18);
  border: 1px solid rgba(255,255,255,.22);
}
.status-icon svg { width: 22px; height: 22px; }
.status-lede {
  margin: 14px 0 0;
  max-width: 48ch;
  color: rgba(255,255,255,.88);
  font-size: 16px;
  font-weight: 500;
}
.status-banner-meta {
  display: grid;
  gap: 10px;
  min-width: 180px;
}
.meta-chip {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(10px);
}
.meta-label {
  display: block;
  margin-bottom: 2px;
  color: rgba(255,255,255,.72);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.meta-chip strong {
  display: block;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -.02em;
}
.meta-chip .tone { color: #fff; }

.metric-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 0 0 40px;
}
.metric {
  padding: 18px 18px 16px;
  border: 1px solid rgba(255,255,255,.9);
  border-radius: 18px;
  background: rgba(255,255,255,.72);
  box-shadow: 0 10px 28px rgba(15,23,42,.04);
  backdrop-filter: blur(8px);
  transition: transform .2s ease, box-shadow .2s ease;
}
.metric:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(15,23,42,.08);
}
.metric-value {
  display: block;
  font-family: var(--mono);
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -.04em;
  color: var(--ink);
}
.metric-label {
  display: block;
  margin-top: 4px;
  color: var(--faint);
  font-size: 12px;
  font-weight: 650;
}

.panel-section { margin-bottom: 42px; }
.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.section-kicker {
  margin: 0 0 4px;
  color: var(--faint);
  font-size: 12px;
  font-weight: 750;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.section-title {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 750;
  letter-spacing: -.035em;
}
.section-count {
  color: var(--faint);
  font-size: 13px;
  font-weight: 650;
}
.services-panel,
.timeline {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255,255,255,.82);
  box-shadow: 0 14px 40px rgba(15,23,42,.05);
  overflow: hidden;
}
.group-bar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 22px;
  border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg, #fbfcfe, #f5f8fb);
  color: var(--faint);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .06em;
  text-transform: uppercase;
}
.service-row {
  padding: 22px 22px 18px;
  border-bottom: 1px solid var(--line);
  transition: background .18s ease;
}
.service-row:last-child { border-bottom: 0; }
.service-row:hover { background: rgba(246,249,252,.9); }
.service-row-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}
.service-identity h3 {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 750;
  letter-spacing: -.03em;
}
.service-identity .meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: var(--soft);
  font-size: 13px;
}
.service-identity .host { font-family: var(--mono); font-size: 12px; }
.service-identity .latency {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--faint);
}
.sep {
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: var(--line-strong);
}
.service-aside {
  display: flex;
  align-items: center;
  gap: 14px;
}
.uptime-block {
  text-align: right;
  min-width: 72px;
}
.uptime-block strong {
  display: block;
  font-family: var(--mono);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -.03em;
}
.uptime-block span {
  color: var(--faint);
  font-size: 11px;
  font-weight: 650;
}
.state {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 12px 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 750;
  letter-spacing: -.01em;
}
.state i {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}
.state.up {
  background: var(--green-soft);
  color: var(--green-ink);
}
.state.watch {
  background: var(--yellow-soft);
  color: var(--yellow);
}
.state.down {
  background: var(--red-soft);
  color: var(--red);
}
.ticks {
  display: flex;
  gap: 2.5px;
  height: 36px;
}
.tick {
  flex: 1;
  min-width: 2px;
  border-radius: 3px;
  background: #dbe3ee;
  transition: transform .15s ease, filter .15s ease, opacity .15s ease;
}
.tick:hover {
  transform: scaleY(1.18);
  filter: brightness(.92);
}
.tick.up {
  background: linear-gradient(180deg, #32d583, #12b76a);
}
.tick.down {
  background: linear-gradient(180deg, #fda29b, #f04438);
}
.tick.unknown {
  background: #dbe3ee;
  opacity: .7;
}
.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: var(--faint);
  font-size: 11px;
  font-weight: 600;
}
.empty {
  padding: 36px 28px;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius);
  background: rgba(255,255,255,.55);
  text-align: center;
}
.empty.quiet {
  border-style: solid;
  background: rgba(255,255,255,.82);
  box-shadow: 0 14px 40px rgba(15,23,42,.05);
}
.empty h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 750;
  letter-spacing: -.03em;
}
.empty p {
  margin: 0;
  color: var(--soft);
}
.incident {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 4px 10px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--line);
}
.incident:last-child { border-bottom: 0; }
.incident-rail {
  display: flex;
  justify-content: center;
  padding-top: 6px;
}
.incident .dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--green);
  box-shadow: 0 0 0 4px rgba(18,183,106,.12);
}
.incident.open .dot {
  background: var(--red);
  box-shadow: 0 0 0 4px rgba(240,68,56,.12);
}
.incident-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.incident h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  letter-spacing: -.02em;
}
.incident-badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 750;
}
.incident-badge.resolved {
  background: var(--green-soft);
  color: var(--green-ink);
}
.incident-badge.open {
  background: var(--red-soft);
  color: var(--red);
}
.incident-meta {
  margin: 6px 0 0;
  color: var(--faint);
  font-size: 13px;
}
.incident-copy {
  margin: 8px 0 0;
  color: var(--soft);
  font-size: 14px;
}
.footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding-top: 22px;
  border-top: 1px solid rgba(15,23,42,.06);
  color: var(--faint);
  font-size: 13px;
}
.footer strong { color: var(--soft); font-weight: 700; }

/* ===== Shared / admin forms ===== */
.service {
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255,255,255,.82);
  box-shadow: 0 14px 40px rgba(15,23,42,.05);
}
.service-top {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: start;
  margin-bottom: 20px;
}
.service h3 {
  margin: 0 0 5px;
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -.03em;
}
.service .meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--soft);
  font-size: 14px;
}
.login-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}
.login-card {
  width: min(430px, 100%);
  padding: 40px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: rgba(255,255,255,.88);
  box-shadow: var(--shadow);
}
.login-card h1 {
  margin: 26px 0 8px;
  font-family: inherit;
  font-size: 2.6rem;
  font-weight: 750;
  line-height: 1;
  letter-spacing: -.045em;
  max-width: none;
  color: var(--ink);
}
.hint {
  margin: 0 0 26px;
  color: var(--soft);
}
label {
  display: block;
  margin: 16px 0 7px;
  color: var(--soft);
  font-size: 13px;
  font-weight: 750;
}
input, select, textarea {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  outline: none;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 4px rgba(18,183,106,.12);
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.admin-grid {
  display: grid;
  grid-template-columns: 1.15fr .85fr;
  gap: 18px;
  align-items: start;
}
.stack { display: grid; gap: 12px; }
.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
}
.page-kicker {
  margin: 0 0 10px;
  color: var(--soft);
  font-size: 14px;
  font-weight: 750;
}
h1 {
  margin: 0;
  color: var(--ink);
  font-family: inherit;
  font-size: clamp(2.4rem, 6vw, 3.8rem);
  font-weight: 750;
  line-height: 1.02;
  letter-spacing: -.045em;
}
.toast {
  position: fixed;
  z-index: 20;
  right: 24px;
  bottom: 24px;
  padding: 13px 18px;
  border-radius: 999px;
  background: var(--ink);
  color: #fff;
  font-size: 14px;
  font-weight: 750;
  box-shadow: var(--shadow);
  animation: rise .35s ease both;
}
.error {
  margin: 0 0 12px;
  color: var(--red);
  font-size: 14px;
}
@media (max-width: 820px) {
  .shell { width: min(960px, calc(100% - 24px)); padding-top: 18px; }
  .nav { margin-bottom: 20px; }
  .nav-link { display: none; }
  .status-banner-inner {
    flex-direction: column;
    align-items: stretch;
    padding: 26px 22px 22px;
  }
  .status-banner-meta { grid-template-columns: 1fr 1fr; min-width: 0; }
  .status-title { font-size: clamp(1.55rem, 7vw, 2.1rem); }
  .metric-strip { grid-template-columns: 1fr 1fr; margin-bottom: 28px; }
  .group-bar { display: none; }
  .service-row-top { flex-direction: column; }
  .service-aside { width: 100%; justify-content: space-between; }
  .admin-grid, .grid-2 { grid-template-columns: 1fr; }
  .ticks { height: 30px; gap: 2px; }
}
`;
