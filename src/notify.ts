import { EventEmitter } from "node:events";
import { getSetting } from "./db.js";

export const bus = new EventEmitter();
bus.setMaxListeners(100);

export type AlertKind = "down" | "recovered";

export async function notify(kind: AlertKind, name: string, detail: string): Promise<void> {
  const discord = getSetting("discord_webhook");
  const slack = getSetting("slack_webhook");
  const generic = getSetting("generic_webhook");
  const payload = {
    kind,
    name,
    detail,
    at: new Date().toISOString(),
    source: "StatusPanda",
  };

  const tasks: Promise<void>[] = [];
  if (discord) tasks.push(postJson(discord, discordBody(kind, name, detail)));
  if (slack) tasks.push(postJson(slack, { text: line(kind, name, detail) }));
  if (generic) tasks.push(postJson(generic, payload));
  await Promise.allSettled(tasks);
}

function line(kind: AlertKind, name: string, detail: string): string {
  if (kind === "down") return `StatusPanda · ${name} is down. ${detail}`;
  return `StatusPanda · ${name} is back. ${detail}`;
}

function discordBody(kind: AlertKind, name: string, detail: string) {
  const down = kind === "down";
  return {
    embeds: [
      {
        title: down ? `${name} is down` : `${name} is back`,
        description: detail,
        color: down ? 0xff6b5a : 0x8be36a,
        footer: { text: "StatusPanda" },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

async function postJson(url: string, body: unknown): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}
