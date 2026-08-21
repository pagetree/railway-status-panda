import type { MonitorType } from "./db.js";

export const MONITOR_TYPES: Array<{
  value: MonitorType;
  label: string;
  hint: string;
  targetLabel: string;
  placeholder: string;
}> = [
  {
    value: "http",
    label: "HTTP",
    hint: "Reachable and returns a good status",
    targetLabel: "URL",
    placeholder: "https://example.com",
  },
  {
    value: "keyword",
    label: "Keyword",
    hint: "Page body must contain your word",
    targetLabel: "URL",
    placeholder: "https://example.com/health",
  },
  {
    value: "tcp",
    label: "TCP",
    hint: "Host and port accept a connection",
    targetLabel: "Host and port",
    placeholder: "example.com:5432",
  },
  {
    value: "dns",
    label: "DNS",
    hint: "Hostname resolves on the public internet",
    targetLabel: "Hostname",
    placeholder: "example.com",
  },
  {
    value: "ssl",
    label: "SSL",
    hint: "Certificate is valid and not near expiry",
    targetLabel: "HTTPS URL",
    placeholder: "https://example.com",
  },
];

export const SSL_WARN_DAYS = 14;

export function parseMonitorType(raw: unknown): MonitorType {
  const value = String(raw || "http");
  if (value === "keyword" || value === "tcp" || value === "dns" || value === "ssl") return value;
  return "http";
}

export function normalizeTarget(type: MonitorType, raw: string): string {
  const value = raw.trim();
  if (!value) return value;

  if (type === "tcp") {
    return value
      .replace(/^(tcp|https?):\/\//i, "")
      .replace(/\/$/, "")
      .split("/")[0]
      .trim();
  }

  if (type === "dns") {
    return value
      .replace(/^(dns:\/\/|https?:\/\/)/i, "")
      .split("/")[0]
      .split(":")[0]
      .replace(/\.$/, "")
      .trim();
  }

  if (type === "ssl") {
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return withScheme.replace(/^http:\/\//i, "https://");
  }

  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function parseTcpTarget(raw: string): { host: string; port: number } | null {
  const value = normalizeTarget("tcp", raw);
  const match = value.match(/^\[([^\]]+)\]:(\d+)$/) || value.match(/^([^:\s\/]+):(\d+)$/);
  if (!match) return null;
  const host = match[1];
  const port = Number(match[2]);
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535) return null;
  return { host, port };
}

export function isDnsHostname(raw: string): boolean {
  const host = normalizeTarget("dns", raw);
  if (!host || host.length > 253) return false;
  if (host === "localhost") return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return /^(?=.{1,253}$)(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(host);
}

export function isHttpUrl(raw: string, httpsOnly = false): boolean {
  try {
    const url = new URL(raw);
    if (httpsOnly) return url.protocol === "https:";
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function targetLabel(type: MonitorType, raw: string): string {
  if (type === "tcp") {
    const parsed = parseTcpTarget(raw);
    return parsed ? `${parsed.host}:${parsed.port}` : raw;
  }
  if (type === "dns") return normalizeTarget("dns", raw);
  try {
    return new URL(normalizeTarget(type === "ssl" ? "ssl" : "http", raw)).host;
  } catch {
    return raw;
  }
}

export function typeLabel(type: MonitorType): string {
  return MONITOR_TYPES.find((item) => item.value === type)?.label ?? "HTTP";
}
