import type { Incident, Device, OperatorType, IncidentStatus } from "./types";

// Point this at your running FastAPI backend. Override with an env var
// (NEXT_PUBLIC_API_BASE) if it's not running on the default port.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    // Always get fresh data — this is a live safety dashboard, not a
    // static site. Next.js caches fetches by default; opt out explicitly.
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sentra API error ${res.status}: ${body || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export function getIncidents(operatorType?: OperatorType): Promise<Incident[]> {
  const query = operatorType ? `?operator_type=${operatorType}` : "";
  return request<Incident[]>(`/incidents${query}`);
}

export function getIncident(incidentId: string): Promise<Incident> {
  return request<Incident>(`/incidents/${incidentId}`);
}

export function getDevices(operatorType?: OperatorType): Promise<Device[]> {
  const query = operatorType ? `?operator_type=${operatorType}` : "";
  return request<Device[]>(`/devices${query}`);
}

export function reviewIncident(
  incidentId: string,
  decision: Extract<IncidentStatus, "escalate" | "false_positive" | "resolved">
): Promise<Incident> {
  return request<Incident>(
    `/incidents/${incidentId}/review?decision=${decision}`,
    { method: "POST" }
  );
}
