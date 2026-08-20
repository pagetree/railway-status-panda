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
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,620;9..144,700&family=Outfit:wght@380;460;560;650&display=swap" rel="stylesheet" />
  <style>${css}</style>
</head>
<body>
  <div class="grain"></div>
  <div class="glow"></div>
  ${opts.body}
  ${opts.toast ? `<div class="toast">${escapeHtml(opts.toast)}</div>` : ""}
</body>
</html>`;
}

export function panda(mood: "calm" | "watch" | "down"): string {
  const blush = mood === "calm" ? "0.9" : "0.15";
  const eye = mood === "down" ? "worried" : mood === "watch" ? "alert" : "soft";
  return `
  <svg class="panda panda-${mood}" viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <radialGradient id="fur" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#2a2a2a"/>
        <stop offset="100%" stop-color="#111"/>
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="168" rx="46" ry="10" fill="rgba(0,0,0,.28)"/>
    <circle cx="58" cy="58" r="28" fill="#111"/>
    <circle cx="142" cy="58" r="28" fill="#111"/>
    <circle cx="100" cy="108" r="62" fill="#f4efe6"/>
    <ellipse class="patch" cx="72" cy="100" rx="22" ry="26" fill="#111"/>
    <ellipse class="patch" cx="128" cy="100" rx="22" ry="26" fill="#111"/>
    ${
      eye === "soft"
        ? `<circle cx="72" cy="102" r="6.5" fill="#f4efe6"/><circle cx="128" cy="102" r="6.5" fill="#f4efe6"/><circle cx="73.5" cy="103" r="2.4" fill="#111"/><circle cx="129.5" cy="103" r="2.4" fill="#111"/>`
        : eye === "alert"
          ? `<ellipse cx="72" cy="102" rx="5" ry="7" fill="#f4efe6"/><ellipse cx="128" cy="102" rx="5" ry="7" fill="#f4efe6"/><circle cx="72" cy="103" r="2.6" fill="#111"/><circle cx="128" cy="103" r="2.6" fill="#111"/>`
          : `<path d="M64 106c6-8 16-8 22 0" fill="none" stroke="#f4efe6" stroke-width="4" stroke-linecap="round"/><path d="M114 106c6-8 16-8 22 0" fill="none" stroke="#f4efe6" stroke-width="4" stroke-linecap="round"/>`
    }
    <ellipse cx="100" cy="124" rx="10" ry="7" fill="#111"/>
    <ellipse class="blush" cx="54" cy="122" rx="10" ry="6" fill="#ff8a7a" opacity="${blush}"/>
    <ellipse class="blush" cx="146" cy="122" rx="10" ry="6" fill="#ff8a7a" opacity="${blush}"/>
    <path d="M88 138c8 8 16 8 24 0" fill="none" stroke="#111" stroke-width="3.2" stroke-linecap="round" opacity="${mood === "down" ? "0.35" : "1"}"/>
  </svg>`;
}

export function ticks(values: Array<boolean | null>): string {
  const cells = values
    .map((value) => {
      const cls = value == null ? "unknown" : value ? "up" : "down";
      return `<i class="tick ${cls}"></i>`;
    })
    .join("");
  return `<div class="ticks" title="Recent checks">${cells}</div>`;
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
  if (!iso) return "not yet";
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.round(ms / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
}

export function pct(ratio: number | null): string {
  if (ratio == null) return "fresh";
  return `${(ratio * 100).toFixed(2)}%`;
}

export function wordmark(): string {
  return `<a class="brand" href="/">
    <span class="mark">${miniPanda()}</span>
    <span class="word">StatusPanda</span>
  </a>`;
}

function miniPanda(): string {
  return `<svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true">
    <circle cx="14" cy="14" r="8" fill="currentColor"/>
    <circle cx="34" cy="14" r="8" fill="currentColor"/>
    <circle cx="24" cy="27" r="16" fill="#f4efe6"/>
    <ellipse cx="17" cy="26" rx="6" ry="7" fill="currentColor"/>
    <ellipse cx="31" cy="26" rx="6" ry="7" fill="currentColor"/>
    <circle cx="17" cy="26" r="2" fill="#f4efe6"/>
    <circle cx="31" cy="26" r="2" fill="#f4efe6"/>
    <ellipse cx="24" cy="32" rx="3" ry="2.2" fill="currentColor"/>
  </svg>`;
}

const css = `
:root {
  --bg: #07110d;
  --bg-2: #0d1c15;
  --card: rgba(16, 36, 28, 0.72);
  --ink: #eef6ee;
  --muted: #8aa392;
  --bamboo: #8be36a;
  --bamboo-2: #3fbf6c;
  --cream: #f4efe6;
  --down: #ff6b5a;
  --watch: #ffc857;
  --line: rgba(139, 227, 106, 0.14);
  --shadow: 0 40px 80px rgba(0,0,0,.35);
  --radius: 28px;
}
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body {
  font-family: Outfit, ui-sans-serif, system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  letter-spacing: 0.01em;
}
a { color: inherit; text-decoration: none; }
.grain {
  pointer-events: none;
  position: fixed; inset: 0; z-index: 0; opacity: .18;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>");
}
.glow {
  pointer-events: none;
  position: fixed; inset: 0; z-index: 0;
  background:
    radial-gradient(900px 500px at 50% -10%, rgba(139,227,106,.16), transparent 55%),
    radial-gradient(600px 400px at 100% 100%, rgba(255,107,90,.08), transparent 45%);
}
.wrap { position: relative; z-index: 1; width: min(1080px, calc(100% - 40px)); margin: 0 auto; padding: 28px 0 80px; }
.nav { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
.brand { display: flex; align-items: center; gap: 10px; color: var(--cream); }
.brand .mark { color: #111; background: var(--bamboo); width: 40px; height: 40px; border-radius: 14px; display: grid; place-items: center; box-shadow: 0 10px 30px rgba(139,227,106,.25); }
.word { font-weight: 650; letter-spacing: -0.03em; font-size: 1.05rem; }
.nav-links { display: flex; gap: 8px; flex-wrap: wrap; }
.btn, button.btn, input[type=submit].btn {
  appearance: none; border: 0; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 11px 16px; border-radius: 999px; font: inherit; font-weight: 560;
  background: transparent; color: var(--ink); border: 1px solid var(--line);
  transition: transform .15s ease, background .15s ease, border-color .15s ease;
}
.btn:hover { transform: translateY(-1px); border-color: rgba(139,227,106,.4); }
.btn.primary { background: var(--bamboo); color: #102116; border-color: transparent; font-weight: 650; }
.btn.ghost { background: rgba(255,255,255,.03); }
.btn.danger { color: var(--down); border-color: rgba(255,107,90,.3); }
.hero {
  display: grid; grid-template-columns: 180px 1fr; gap: 28px; align-items: center;
  background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
  border: 1px solid var(--line); border-radius: 40px; padding: 36px 40px;
  box-shadow: var(--shadow); margin-bottom: 28px;
}
.panda { width: 160px; height: 160px; filter: drop-shadow(0 20px 30px rgba(0,0,0,.35)); }
.panda-calm { animation: float 4.8s ease-in-out infinite; }
.panda-watch { animation: shake 1.8s ease-in-out infinite; }
.panda-down { animation: sit .6s ease both; }
@keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
@keyframes shake { 0%,100% { transform: rotate(-1deg) } 50% { transform: rotate(2deg) } }
@keyframes sit { from { transform: scale(.96); opacity: .4 } to { transform: none; opacity: 1 } }
.kicker { color: var(--bamboo); font-weight: 560; font-size: .82rem; letter-spacing: .16em; text-transform: uppercase; }
h1, h2, h3 { font-family: Fraunces, ui-serif, Georgia, serif; letter-spacing: -0.04em; margin: 0; }
h1 { font-size: clamp(2.4rem, 6vw, 4.4rem); line-height: .95; font-weight: 620; }
.lede { color: var(--muted); font-size: 1.05rem; margin-top: 12px; max-width: 46ch; }
.meta { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 18px; color: var(--muted); font-size: .92rem; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }
.dot.up { background: var(--bamboo); box-shadow: 0 0 12px var(--bamboo); }
.dot.watch { background: var(--watch); box-shadow: 0 0 12px var(--watch); }
.dot.down { background: var(--down); box-shadow: 0 0 12px var(--down); }
.list { display: grid; gap: 12px; }
.card {
  background: var(--card); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 20px 22px; backdrop-filter: blur(16px);
}
.mon {
  display: grid; grid-template-columns: 1fr auto; gap: 10px 20px; align-items: center;
}
.mon h3 { font-size: 1.25rem; }
.pill {
  font-size: .78rem; font-weight: 650; letter-spacing: .04em; text-transform: uppercase;
  padding: 6px 10px; border-radius: 999px;
}
.pill.up { background: rgba(139,227,106,.12); color: var(--bamboo); }
.pill.watch { background: rgba(255,200,87,.12); color: var(--watch); }
.pill.down { background: rgba(255,107,90,.12); color: var(--down); }
.ticks { display: flex; gap: 3px; align-items: end; height: 28px; }
.tick { width: 7px; flex: 1; max-width: 10px; height: 18px; border-radius: 99px; background: rgba(255,255,255,.08); }
.tick.up { background: var(--bamboo); height: 24px; }
.tick.down { background: var(--down); height: 12px; }
.tick.unknown { height: 10px; }
.sub { color: var(--muted); font-size: .88rem; }
.empty {
  text-align: center; padding: 56px 24px; border-radius: 40px; border: 1px dashed var(--line);
}
.empty h2 { font-size: 2rem; margin-bottom: 8px; }
.login-shell { min-height: 100vh; display: grid; place-items: center; position: relative; z-index: 1; padding: 24px; }
.login-card {
  width: min(440px, 100%); background: var(--card); border: 1px solid var(--line);
  border-radius: 36px; padding: 36px; box-shadow: var(--shadow);
}
label { display: block; font-size: .82rem; color: var(--muted); margin: 14px 0 6px; }
input, select, textarea {
  width: 100%; background: rgba(0,0,0,.28); color: var(--ink); border: 1px solid var(--line);
  border-radius: 16px; padding: 12px 14px; font: inherit; outline: none;
}
input:focus, select:focus, textarea:focus { border-color: var(--bamboo); }
.hint { color: var(--muted); font-size: .88rem; line-height: 1.45; margin: 10px 0 18px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.admin-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 18px; }
.stack { display: grid; gap: 12px; }
.row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.toast {
  position: fixed; z-index: 5; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #102116; color: var(--bamboo); border: 1px solid rgba(139,227,106,.35);
  padding: 12px 18px; border-radius: 999px; font-weight: 560;
  animation: pop .35s ease;
}
@keyframes pop { from { transform: translateX(-50%) translateY(12px); opacity: 0 } }
.incidents { margin-top: 28px; }
.incident { display: grid; gap: 4px; }
.footer { margin-top: 48px; color: var(--muted); font-size: .85rem; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
hr.line { border: 0; border-top: 1px solid var(--line); margin: 18px 0; }
.error { color: var(--down); font-size: .9rem; margin: 0 0 10px; }
@media (max-width: 820px) {
  .hero, .admin-grid, .grid-2 { grid-template-columns: 1fr; }
  .hero { padding: 24px; }
  .panda { width: 120px; height: 120px; margin: 0 auto; }
}
`;
