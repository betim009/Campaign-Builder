import { useMemo, useState } from "react";
import { formatNowPtBr, inferEntityFromAction, normalizeNonEmptyString } from "./metaTestUtils.js";

export default function useOpsLogs({ storageKey = "metaTest.opsLogs.v1", maxEntries = 100 } = {}) {
  const [opsLogs, setOpsLogs] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [opsLogsFilter, setOpsLogsFilter] = useState("all");

  const filteredOpsLogs = useMemo(() => {
    const list = Array.isArray(opsLogs) ? opsLogs : [];
    if (opsLogsFilter === "all") return list;

    const selected = normalizeNonEmptyString(opsLogsFilter);
    if (!selected) return list;

    return list.filter((l) => (l?.entity || inferEntityFromAction(l?.action)) === selected);
  }, [opsLogs, opsLogsFilter]);

  function pushLog(entry) {
    const base = entry ?? {};
    const entity = normalizeNonEmptyString(base?.entity) || inferEntityFromAction(base?.action);
    const enriched = { at: formatNowPtBr(), entity, ...base };
    setOpsLogs((prev) => {
      const next = [enriched, ...(Array.isArray(prev) ? prev : [])].slice(0, maxEntries);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  return {
    opsLogs,
    setOpsLogs,
    opsLogsFilter,
    setOpsLogsFilter,
    filteredOpsLogs,
    pushLog,
  };
}

