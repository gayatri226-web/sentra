"use client";

import { useEffect, useState, useCallback } from "react";
import type { Incident, OperatorType } from "@/lib/types";
import { getIncidents } from "@/lib/api";

interface UseIncidentsResult {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Polls the backend every `intervalMs` for the current incident list.
 * This is intentionally simple polling, not WebSockets — it's invisible
 * to a demo audience and needs zero extra infrastructure to run tonight.
 */
export function useIncidents(
  operatorType?: OperatorType,
  intervalMs = 4000
): UseIncidentsResult {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnce = useCallback(async () => {
    try {
      const data = await getIncidents(operatorType);
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the Sentra backend. Is it running on port 8000?"
      );
    } finally {
      setLoading(false);
    }
  }, [operatorType]);

  useEffect(() => {
    fetchOnce();
    const id = setInterval(fetchOnce, intervalMs);
    return () => clearInterval(id);
  }, [fetchOnce, intervalMs]);

  return { incidents, loading, error, refresh: fetchOnce };
}
