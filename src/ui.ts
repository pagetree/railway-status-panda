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
  --bg: #fbfaf7;
  --surface: #ffffff;
  --ink: #171717;
  --soft: #6b665f;
  --faint: #9a948a;
  --line: #ece7dd;
  --line-strong: #ded7ca;
  --green: #16a34a;
  --green-soft: #eaf8ef;
  --green-ink: #0d6f31;
  --yellow: #b7791f;
  --yellow-soft: #fff7df;
  --red: #dc2626;
  --red-soft: #fff1f1;
  --shadow: 0 24px 60px rgba(56, 44, 25, .08);
  --radius: 24px;
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
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(900px 520px at 18% -8%, rgba(22,163,74,.12), transparent 62%),
    radial-gradient(820px 460px at 90% 6%, rgba(244,180,0,.10), transparent 58%),
    linear-gradient(180deg, rgba(255,255,255,.86), transparent 42%);
}
.mood-down .wash {
  background:
    radial-gradient(900px 520px at 18% -8%, rgba(220,38,38,.14), transparent 62%),
    radial-gradient(820px 460px at 90% 6%, rgba(244,180,0,.10), transparent 58%),
    linear-gradient(180deg, rgba(255,255,255,.86), transparent 42%);
}
.mood-watch .wash {
  background:
    radial-gradient(900px 520px at 18% -8%, rgba(183,121,31,.13), transparent 62%),
    radial-gradient(820px 460px at 90% 6%, rgba(22,163,74,.08), transparent 58%),
    linear-gradient(180deg, rgba(255,255,255,.86), transparent 42%);
}
.noise { display: none; }
a { color: inherit; text-decoration: none; }
.shell {
  position: relative;
  z-index: 1;
  width: min(1020px, calc(100% - 48px));
  margin: 0 auto;
  padding: 28px 0 76px;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 74px;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: var(--ink);
}
.brand .mark {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: var(--ink);
  color: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 14px 30px rgba(23,23,23,.14);
}
.word {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -.035em;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 10px;
}
.nav-link {
  color: var(--soft);
  font-size: 14px;
  font-weight: 650;
  transition: color .18s ease;
}
.nav-link:hover { color: var(--ink); }
.btn, button.btn {
  appearance: none;
  cursor: pointer;
  height: 40px;
  padding: 0 17px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255,255,255,.64);
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
  box-shadow: 0 12px 24px rgba(56,44,25,.08);
}
.btn.primary {
  border-color: var(--ink);
  background: var(--ink);
  color: #fff;
}
.btn.danger { color: var(--red); }
.hero {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 34px;
  align-items: stretch;
  margin: 0 0 44px;
  padding: 42px 46px;
  border: 1px solid var(--line);
  border-radius: 34px;
  background:
    linear-gradient(135deg, rgba(255,255,255,.95), rgba(255,255,255,.70)),
    linear-gradient(135deg, var(--green-soft), transparent 48%);
  box-shadow: var(--shadow);
}
.hero-copy {
  min-width: 0;
}
.mood-down .hero {
  background:
    linear-gradient(135deg, rgba(255,255,255,.95), rgba(255,255,255,.70)),
    linear-gradient(135deg, var(--red-soft), transparent 48%);
}
.mood-watch .hero {
  background:
    linear-gradient(135deg, rgba(255,255,255,.95), rgba(255,255,255,.70)),
    linear-gradient(135deg, var(--yellow-soft), transparent 48%);
}
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 22px;
  color: var(--green-ink);
  font-size: 13px;
  font-weight: 750;
}
.mood-down .kicker { color: var(--red); }
.mood-watch .kicker { color: var(--yellow); }
.orb {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 0 6px color-mix(in srgb, currentColor 12%, transparent);
}
h1 {
  margin: 0;
  max-width: 12ch;
  color: var(--ink);
  font-family: "Instrument Serif", ui-serif, Georgia, serif;
  font-size: clamp(3.4rem, 8vw, 6.2rem);
  font-weight: 400;
  line-height: .94;
  letter-spacing: -.055em;
}
.subline {
  max-width: 48ch;
  margin: 24px 0 0;
  color: var(--soft);
  font-size: 17px;
}
.updated {
  margin: 12px 0 0;
  color: var(--faint);
  font-size: 14px;
}
.status-card {
  align-self: stretch;
  display: grid;
  align-content: end;
  padding: 28px;
  border: 1px solid rgba(255,255,255,.72);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255,255,255,.82), rgba(255,255,255,.48)),
    var(--green-soft);
}
.mood-down .status-card { background: linear-gradient(180deg, rgba(255,255,255,.82), rgba(255,255,255,.48)), var(--red-soft); }
.mood-watch .status-card { background: linear-gradient(180deg, rgba(255,255,255,.82), rgba(255,255,255,.48)), var(--yellow-soft); }
.status-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--green-ink);
  font-size: 13px;
  font-weight: 750;
}
.mood-down .status-card-top { color: var(--red); }
.mood-watch .status-card-top { color: var(--yellow); }
.status-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #fff;
  color: currentColor;
}
.status-mark svg { width: 20px; height: 20px; }
.status-card strong {
  margin-top: 48px;
  font-size: 64px;
  line-height: .9;
  letter-spacing: -.07em;
}
.status-card p {
  margin: 8px 0 22px;
  color: var(--soft);
}
.hero-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.hero-stats span {
  padding: 14px;
  border: 1px solid rgba(23,23,23,.06);
  border-radius: 16px;
  background: rgba(255,255,255,.58);
  color: var(--soft);
  font-size: 12px;
}
.hero-stats b {
  display: block;
  color: var(--ink);
  font-size: 16px;
}
.section-label {
  margin: 42px 0 16px;
  color: var(--soft);
  font-size: 13px;
  font-weight: 750;
  letter-spacing: .02em;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.section-head .section-label { margin-bottom: 14px; }
.section-head span {
  color: var(--faint);
  font-size: 13px;
  font-weight: 650;
}
.services {
  display: grid;
  gap: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255,255,255,.70);
  box-shadow: 0 16px 44px rgba(56,44,25,.055);
  overflow: hidden;
}
.group-title {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 20px;
  padding: 15px 26px;
  border-bottom: 1px solid var(--line);
  background: rgba(255,255,255,.62);
  color: var(--faint);
  font-size: 12px;
  font-weight: 750;
  letter-spacing: .02em;
}
.service {
  padding: 26px;
  border: 0;
  border-bottom: 1px solid var(--line);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
.service:last-child {
  border-bottom: 0;
}
.admin-grid > .service,
.stack > .service,
form.service {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255,255,255,.78);
  box-shadow: 0 16px 44px rgba(56,44,25,.055);
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
  font-size: 19px;
  font-weight: 750;
  letter-spacing: -.035em;
}
.service .meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--soft);
  font-size: 14px;
}
.service-score {
  min-width: 112px;
  text-align: right;
}
.service-score strong {
  display: block;
  margin-top: 3px;
  font-size: 22px;
  line-height: 1;
  letter-spacing: -.04em;
}
.service-score span:last-child {
  color: var(--faint);
  font-size: 12px;
}
.state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 86px;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 750;
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
  gap: 3px;
  height: 52px;
}
.tick {
  flex: 1;
  min-width: 3px;
  border-radius: 5px;
  background: #eee9df;
  transition: transform .16s ease, filter .16s ease;
}
.tick:hover {
  transform: scaleY(1.08);
  filter: brightness(.96);
}
.tick.up {
  background: linear-gradient(180deg, #33d17a, #15a85a);
}
.tick.down {
  background: linear-gradient(180deg, #fb7185, #dc2626);
}
.tick.unknown { background: #eee9df; }
.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: var(--faint);
  font-size: 12px;
}
.empty {
  padding: 34px;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius);
  background: rgba(255,255,255,.55);
}
.empty h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 750;
  letter-spacing: -.035em;
}
.empty p {
  margin: 0;
  color: var(--soft);
}
.incidents-title { margin-top: 54px; }
.timeline {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255,255,255,.78);
  overflow: hidden;
  box-shadow: 0 16px 44px rgba(56,44,25,.05);
}
.incident {
  display: grid;
  grid-template-columns: 12px 1fr;
  gap: 16px;
  padding: 22px 24px;
  border-bottom: 1px solid var(--line);
}
.incident:last-child { border-bottom: 0; }
.incident .dot {
  width: 10px;
  height: 10px;
  margin-top: 7px;
  border-radius: 999px;
  background: var(--green);
}
.incident.open .dot {
  background: var(--red);
  box-shadow: 0 0 0 6px rgba(220,38,38,.09);
}
.incident h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
  letter-spacing: -.02em;
}
.incident p {
  margin: 6px 0 0;
  color: var(--soft);
  font-size: 14px;
}
.footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 44px;
  color: var(--faint);
  font-size: 13px;
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
  background: rgba(255,255,255,.82);
  box-shadow: var(--shadow);
}
.login-card h1 {
  margin: 26px 0 8px;
  font-family: "Instrument Serif", ui-serif, Georgia, serif;
  font-size: 3.4rem;
  font-weight: 400;
  line-height: .95;
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
  box-shadow: 0 0 0 4px rgba(22,163,74,.08);
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
}
.error {
  margin: 0 0 12px;
  color: var(--red);
  font-size: 14px;
}
@media (max-width: 820px) {
  .shell { width: min(1020px, calc(100% - 28px)); padding-top: 20px; }
  .nav { margin-bottom: 36px; }
  .nav-link { display: none; }
  .hero { grid-template-columns: 1fr; gap: 18px; }
  .hero { padding: 30px 24px; border-radius: 28px; }
  .status-card strong { margin-top: 26px; font-size: 50px; }
  .hero-stats { grid-template-columns: 1fr; }
  .group-title { display: none; }
  .service-top { grid-template-columns: 1fr; }
  .service-score { min-width: 0; text-align: left; }
  .admin-grid, .grid-2 { grid-template-columns: 1fr; }
  .ticks { height: 42px; gap: 2px; }
}
`;
