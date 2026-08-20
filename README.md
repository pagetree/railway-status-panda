# StatusPanda

A calm public status page with a private admin den. Deploy on Railway, paste a URL, and you are monitoring.

No setup fields. No database to wire. No empty dashboard.

## What you get

A public status page that feels finished on first open.
HTTP and keyword checks on a 30 second to 10 minute beat.
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

# Deploy and Host StatusPanda with Railway

StatusPanda is a self hosted uptime monitor with a public status page, a private admin, and alerts when a site falls over. It is built to deploy in one click on Railway with zero form fields and a working page on first boot.

## About Hosting StatusPanda

StatusPanda runs as one Node service. Checks, the status page, and SQLite all live together. Railway supplies the public domain, a generated admin password, and a volume at `/data` so incident history survives redeploys. There is no separate database to provision and no secret for the user to invent.

## Common Use Cases

- Publish a calm status page for customers while you sleep
- Watch a marketing site, API, and docs URL from one den
- Ping Discord or Slack the moment a check fails twice
- Drop a live status badge into a GitHub README
- Keep uptime history on a Railway volume without babysitting Postgres

## Dependencies for StatusPanda Hosting

- Node 22 runtime
- SQLite file on a Railway volume at `/data`
- Outbound HTTPS so checks can reach the public internet

### Deployment Dependencies

- This repository
- Railway public networking
- Volume mounted at `/data`

### Implementation Details

After deploy:

1. Public page: `https://<domain>/`
2. Admin: `https://<domain>/login`
3. Username: `admin`
4. Password: service variable `ADMIN_PASSWORD`
5. Health: `https://<domain>/health`
6. JSON: `https://<domain>/api/status`
7. Badge: `https://<domain>/badge.svg`

A self check is not used. An example monitor for https://railway.com is created on first boot so the status page already has a heartbeat. Remove it whenever you like.

### Why Deploy StatusPanda on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying StatusPanda on Railway, you are one step closer to supporting a complete full-stack application.
