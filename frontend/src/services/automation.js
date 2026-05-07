import { apiPost } from "./http.js";

export async function runAutomation({ date, dryRun = true } = {}) {
  const body = {
    ...(date ? { date } : null),
    ...(dryRun ? { dryRun: true } : null),
  };
  const data = await apiPost("/api/automation/run", body);
  return data;
}

