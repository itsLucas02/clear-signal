import type { CaseItem } from "@/lib/types";

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
  return result as T;
}

export function downloadText(content: string, filename: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportCases(items: CaseItem[]) {
  const escape = (value: string) => `"${(/^[=+\-@]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
  const lines = [ ["Case ID", "Customer", "Email", "Issue", "Service", "Priority", "Status", "Assignee", "Location", "Created", "Resolved"], ...items.map(c => [c.id, c.customerName, c.email, c.title, c.category, c.priority, c.status, c.assignee, c.location, c.createdAt, c.resolvedAt || ""]) ];
  downloadText(lines.map(row => row.map(escape).join(",")).join("\r\n"), `clearsignal-cases-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8");
}
