"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, CheckCheck, CheckCircle2, ChevronDown, ChevronUp, Circle, Clipboard, Download, LoaderCircle, Mail, MapPin, MessageSquare, Phone, RadioTower, Send, Sparkles, UserRound, Wifi } from "lucide-react";
import { Avatar, Dialog, StatusBadge } from "@/components/ui";
import { api, downloadText } from "@/lib/client";
import { playbooks, priorityLabels, statusLabels, timeAgo, type CaseItem, type Incident, type Note } from "@/lib/types";

type Props = { item: CaseItem; incidents: Incident[]; onClose: () => void; onUpdate: (id: string, changes: Partial<CaseItem>) => Promise<void>; onRefresh: () => Promise<void>; onNetwork: () => void; notify: (message: string, error?: boolean) => void };

export default function CaseDrawer({ item, incidents, onClose, onUpdate, onRefresh, onNetwork, notify }: Props) {
  const [messages, setMessages] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState("overview");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [draftOpen, setDraftOpen] = useState(false);
  const book = playbooks.find(p => p.category === item.category)!;
  const [draft, setDraft] = useState(book.customerUpdate);
  const linkedIncident = incidents.find(incident => item.location.toLowerCase().includes(incident.area.toLowerCase()) && incident.status !== "Scheduled");
  useEffect(() => {
    let alive = true;
    setLoading(true); setLoadError("");
    api<{ notes: Note[] }>(`/api/cases/${item.id}`).then(result => { if (alive) setMessages(result.notes); }).catch(error => { if (alive) setLoadError(error.message); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [item.id]);
  async function update(changes: Partial<CaseItem>) {
    setBusy(true);
    try {
      await onUpdate(item.id, changes);
      const result = await api<{ notes: Note[] }>(`/api/cases/${item.id}`);
      setMessages(result.notes);
      if (changes.status) notify(changes.status === "resolved" ? "Case resolved. One better connection." : "Case status updated.");
    } catch (error) { notify(error instanceof Error ? error.message : "Couldn’t save your changes.", true); }
    finally { setBusy(false); }
  }
  async function addNote(event: FormEvent) {
    event.preventDefault();
    if (!note.trim()) return;
    setBusy(true);
    try {
      const result = await api<{ note: Note }>(`/api/cases/${item.id}/notes`, { method: "POST", body: JSON.stringify({ content: note }) });
      setMessages(previous => [result.note, ...previous]); setNote("");
      await onRefresh(); notify("Note saved. The whole team is in the loop.");
    } catch (error) { notify(error instanceof Error ? error.message : "Couldn’t save this note.", true); }
    finally { setBusy(false); }
  }
  async function copyDraft() {
    try { await navigator.clipboard.writeText(draft); notify("Customer update copied to your clipboard."); }
    catch { notify("Clipboard unavailable. Select and copy the draft below.", true); }
  }
  function exportHandoff() {
    const text = [`CLEARSIGNAL · CASE HANDOFF`, `${item.id} — ${item.title}`, `Customer: ${item.customerName} (${item.email})`, `Area: ${item.location}`, `Plan: ${item.plan}`, `Service: ${item.category}`, `Status: ${statusLabels[item.status]} | Priority: ${priorityLabels[item.priority]}`, `Owner: ${item.assignee}`, `\nCUSTOMER REPORT\n${item.description}`, linkedIncident ? `\nRELATED NETWORK CONTEXT (${linkedIncident.id})\n${linkedIncident.summary}` : "", `\nTROUBLESHOOTING\n${book.steps.map((step, index) => `${item.completedSteps.includes(String(index)) ? "[x]" : "[ ]"} ${step}`).join("\n")}`, `\nCONVERSATION & NOTES\n${messages.map(message => `${new Date(message.createdAt).toLocaleString()} — ${message.author} (${message.kind})\n${message.content}`).join("\n\n")}`, "\nDemo workspace · No customer messages were sent by ClearSignal."].filter(Boolean).join("\n");
    downloadText(text, `${item.id}-handoff.txt`); notify("Case handoff downloaded.");
  }
  return <Dialog side title={item.id} subtitle={`Opened ${new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${item.channel}`} onClose={onClose} footer={<><button className="button button-secondary" onClick={exportHandoff} disabled={loading || !!loadError}><Download size={15}/>Export handoff</button><button className={`button ${item.status === "resolved" ? "button-secondary" : "button-primary"}`} disabled={busy} onClick={() => update({ status: item.status === "resolved" ? "open" : "resolved" })}>{busy ? <LoaderCircle size={16} className="spin"/> : <CheckCheck size={17}/>} {item.status === "resolved" ? "Reopen case" : "Mark as resolved"}</button></>}>
    <div className="case-detail-title"><div className="eyebrow">{item.category.toUpperCase()} SUPPORT</div><h2>{item.title}</h2><StatusBadge status={item.status}/></div>
    <div className="detail-customer"><Avatar name={item.customerName} color={item.avatarColor} size="large"/><div><h3>{item.customerName}</h3><span><Mail size={12}/>{item.email}</span><span><MapPin size={12}/>{item.location}<i>·</i>{item.plan}</span></div></div>
    <div className="detail-selects"><label>Status<select value={item.status} disabled={busy} onChange={event => update({ status: event.target.value as CaseItem["status"] })}>{Object.entries(statusLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Priority<select value={item.priority} disabled={busy} onChange={event => update({ priority: event.target.value as CaseItem["priority"] })}>{Object.entries(priorityLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Case owner<select value={item.assignee} disabled={busy} onChange={event => update({ assignee: event.target.value })}>{["Aisyah Rahman", "Faizal Rosli", "Nurul Huda"].map(name => <option key={name}>{name}</option>)}</select></label></div>
    <div className="detail-tabs" role="tablist" aria-label="Case details"><button role="tab" aria-selected={tab === "overview"} className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}><Sparkles size={14}/>The full picture</button><button role="tab" aria-selected={tab === "conversation"} className={tab === "conversation" ? "active" : ""} onClick={() => setTab("conversation")}><MessageSquare size={14}/>Conversation <span>{messages.length}</span></button></div>
    {tab === "overview" ? <>
      <section className="detail-section"><h3>The customer’s story</h3><div className="customer-quote">“{item.description}”</div><div className="context-caption"><CheckCircle2 size={13}/>One shared view. No need to ask them to start over.</div></section>
      {linkedIncident && <section className="incident-callout"><span className="incident-callout-icon"><RadioTower size={18}/></span><div><h4>There may be a bigger picture</h4><p>{linkedIncident.area} has a reported {linkedIncident.service.toLowerCase()} issue. Check the network context before repeating device troubleshooting.</p><button className="text-link" onClick={onNetwork}>View network context<ArrowRight size={13}/></button></div></section>}
      <section className="detail-section"><div className="section-title-row"><h3>Suggested next steps</h3><span>{item.completedSteps.length} of {book.steps.length} complete</span></div><div className="checklist-progress"><span style={{ width: `${item.completedSteps.length / book.steps.length * 100}%` }}/></div><div className="checklist">{book.steps.map((step, index) => { const checked = item.completedSteps.includes(String(index)); return <label key={step} className={checked ? "checked" : ""}><input type="checkbox" checked={checked} disabled={busy} onChange={() => update({ completedSteps: checked ? item.completedSteps.filter(value => value !== String(index)) : [...item.completedSteps, String(index)] })}/><span className="custom-check">{checked && <Check size={12}/>}</span><span>{step}</span></label>; })}</div><div className="playbook-source"><Wifi size={12}/>From “{book.title}”</div></section>
      <section className="draft-section"><button className="draft-toggle" onClick={() => setDraftOpen(!draftOpen)}><span><Sparkles size={16}/>A clearer customer update</span>{draftOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>{draftOpen && <div className="draft-content"><p>A starting point from your playbook. Review and personalize before sharing.</p><textarea value={draft} onChange={event => setDraft(event.target.value)} rows={5} aria-label="Customer update draft"/><div><span>Draft only · not sent to the customer</span><button className="button button-secondary button-small" onClick={copyDraft}><Clipboard size={13}/>Copy update</button></div></div>}</section>
    </> : <section className="detail-section conversation-section"><div className="section-title-row"><h3>Every touchpoint, together</h3><span>{messages.length} updates</span></div>{loading ? <div className="loading-state"><LoaderCircle className="spin" size={22}/>Bringing the story together…</div> : loadError ? <div className="inline-error">{loadError}</div> : messages.length === 0 ? <p className="muted">No notes yet. Add the first piece of context below.</p> : <div className="conversation-timeline">{messages.map(message => <article key={message.id} className={`conversation-message message-${message.kind}`}><div className="message-icon">{message.kind === "phone" ? <Phone size={14}/> : message.kind === "email" ? <Mail size={14}/> : message.kind === "system" ? <Check size={14}/> : message.kind === "note" ? <UserRound size={14}/> : <MessageSquare size={14}/>}</div><div><div className="message-heading"><strong>{message.author}</strong><span>{timeAgo(message.createdAt)}</span></div><span className="message-channel">{message.kind === "note" ? "Internal note" : message.kind === "system" ? "Case update" : `${message.kind} conversation`}</span><p>{message.content}</p></div></article>)}</div>}</section>}
    <section className="detail-section add-note-section"><h3>Keep the next person in the loop</h3><form onSubmit={addNote}><textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Add an internal note. What should the team know?" rows={3} maxLength={5000} aria-label="Internal note"/><div className="note-form-footer"><span><Circle size={7} fill="currentColor"/>Visible to your support team</span><button className="button button-primary button-small" type="submit" disabled={busy || !note.trim()}>{busy ? <LoaderCircle size={14} className="spin"/> : <Send size={13}/>}Save note</button></div></form></section>
  </Dialog>;
}
