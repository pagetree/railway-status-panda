# StatusPanda

A calm public status page with a private admin den. Deploy on Railway, paste a URL, and you are monitoring.

No setup fields. No database to wire. No empty dashboard.

**Live demo:** [statuspanda-production.up.railway.app](https://statuspanda-production.up.railway.app/)

## What you get

A public status page that feels finished on first open.
HTTP, keyword, TCP, DNS, and SSL checks on a 30 second to 10 minute beat.
Incident history that opens after two failed checks and closes when the site recovers.
Discord, Slack, and generic webhook alerts.
A live `/api/status` feed and a `/badge.svg` for READMEs.
SQLite on a volume so history survives deploys.

## For people who deploy the template

1. Click Deploy on Railway. Do not fill in any variables.
2. Open the public URL. An example check against Railway is already running so the page is not empty.
3. Open Admin. Username is `admin`. Password is `ADMIN_PASSWORD` in the service variables.
4. Remove the example, add your real sites. Optional: Settings for Discord or Slack webhooks.

That is the whole onboarding.

## Local

```bash
cp .env.example .env
npm install
npm run dev
```

Data lands in `./data` if `/data` is not writable.

## Template composer (publisher)

Create a GitHub repo from this folder, then New Template in Railway.

**Service**
Source: the GitHub repo
Public networking: on
Healthcheck path: `/health`
Volume: mount path `/data`

**Variables (none are user input)**

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | `${{secret(24)}}` |
| `ADMIN_USER` | `admin` |
| `APP_NAME` | `StatusPanda` |

Leave every variable hidden from the deploy form. The secret function fills the password at deploy time.

**Icon**
Use `public/icon.svg`. Square, transparent, 1:1.

**Category**
Observability

## Marketplace overview (paste into publish form)

# Deploy and Host StatusPanda Uptime on Railway

StatusPanda Uptime is a self hosted monitor with a public status page and a private admin den. Deploy it on Railway and leave the defaults. It watches HTTP URLs, TCP ports, DNS names, and SSL certificates, records incidents, and can shout into Discord or Slack when a site falls over. An example check is already running on first boot so the page is never empty.

## About Hosting StatusPanda Uptime

StatusPanda Uptime runs as one Node service. Checks, the public page, and SQLite all live together. Railway gives you the public domain, a generated admin password, and a volume at `/data` so history survives redeploys. There is no separate database to provision and no secret for you to invent. Open the URL, copy `ADMIN_PASSWORD` from the service variables, and add your real sites. Optional webhooks wait in Settings until you want alerts.

## Common Use Cases

- Publish a calm status page for customers while you sleep
- Watch a marketing site, API, TCP port, DNS name, and SSL cert from one den
- Ping Discord or Slack the moment a check fails twice

## Dependencies for StatusPanda Uptime Hosting

- Node 22 runtime
- SQLite file on a Railway volume at `/data`
- Outbound HTTPS so checks can reach the public internet

### Implementation Details

Required variables (leave the defaults):

- `APP_NAME`: Public name on the status page. Leave StatusPanda unless you want your own brand.
- `ADMIN_USER`: Admin login username. Leave admin unless you want a different name.
- `ADMIN_PASSWORD`: Leave this. Railway fills a random password. After deploy, copy it from the service Variables tab to log in.

After deploy (swap in your Railway public URL):

1. Public page: `https://YOUR_APP.up.railway.app/`
2. Admin: `https://YOUR_APP.up.railway.app/login`
3. Username: `admin` (or your `ADMIN_USER`)
4. Password: service variable `ADMIN_PASSWORD`
5. Health: `https://YOUR_APP.up.railway.app/health`
6. JSON: `https://YOUR_APP.up.railway.app/api/status`
7. Badge: `https://YOUR_APP.up.railway.app/badge.svg`

An example monitor for `https://railway.com` is created on first boot. Remove it in Admin whenever you like.

## Why Deploy StatusPanda Uptime on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying StatusPanda Uptime on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
