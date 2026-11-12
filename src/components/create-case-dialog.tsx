"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
import { Dialog } from "@/components/ui";
import { api } from "@/lib/client";
import type { CaseItem, Category } from "@/lib/types";

export default function CreateCaseDialog({ category = "Broadband", onClose, onCreated }: { category?: Category; onClose: () => void; onCreated: (item: CaseItem) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    setBusy(true); setError("");
    try {
      const result = await api<{ case: CaseItem }>("/api/cases", { method: "POST", body: JSON.stringify(values) });
      await onCreated(result.case);
    } catch (error) { setError(error instanceof Error ? error.message : "Couldn’t create this case."); }
    finally { setBusy(false); }
  }
  return <Dialog title="Start with the whole story" subtitle="A new case. A clearer path to getting connected." wide onClose={() => { if (!busy) onClose(); }} footer={<><span className="form-footer-hint"><LockKeyhole size={13}/>Saved to your workspace</span><button className="button button-secondary" onClick={onClose} disabled={busy}>Cancel</button><button type="submit" form="new-case-form" className="button button-primary" disabled={busy}>{busy ? <LoaderCircle size={16} className="spin"/> : null}{busy ? "Creating case…" : "Create case"}{!busy && <ArrowRight size={15}/>}</button></>}>
    <form id="new-case-form" onSubmit={submit} className="case-form"><div className="form-section-label">THE PERSON BEHIND THE CASE</div><div className="form-grid"><label>Customer name <span>*</span><input autoFocus name="customerName" required maxLength={100} placeholder="e.g. Sarah Chen" autoComplete="name"/></label><label>Email address <span>*</span><input name="email" type="email" required maxLength={150} placeholder="sarah@example.com" autoComplete="email"/></label></div><div className="form-section-label second-section">LET’S CONNECT THE DOTS</div><label>What’s the issue? <span>*</span><input name="title" required maxLength={160} placeholder="A short, clear summary of the problem"/></label><div className="form-grid form-grid-three"><label>Service<select name="category" defaultValue={category}>{["Broadband", "Mobile", "Billing", "Installation"].map(value => <option key={value}>{value}</option>)}</select></label><label>Priority<select name="priority" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label>First contact<select name="channel" defaultValue="Chat">{["Chat", "Phone", "Email", "App"].map(value => <option key={value}>{value}</option>)}</select></label></div><label>The customer’s story <span>*</span><textarea name="description" required maxLength={5000} rows={4} placeholder="What happened? What has already been tried? What would a useful outcome look like?"/></label><label>Service area<input name="location" maxLength={120} placeholder="e.g. Petaling Jaya, Selangor"/></label><div className="form-note">You’ll be assigned as the case owner. This is a shared demo workspace — please use sample customer details.</div>{error && <div className="inline-error" role="alert">{error}</div>}</form>
  </Dialog>;
}
