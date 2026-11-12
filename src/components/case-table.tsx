"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Filter, Search, Download, MoreHorizontal, X } from "lucide-react";
import { Avatar, EmptyState, PriorityBadge, StatusBadge } from "@/components/ui";
import { exportCases } from "@/lib/client";
import { priorityLabels, statusLabels, type CaseItem } from "@/lib/types";

type Props = { cases: CaseItem[]; compact?: boolean; onOpen: (id: string) => void; onViewAll: () => void; initialQuery?: string };

export default function CaseTable({ cases, compact = false, onOpen, onViewAll, initialQuery = "" }: Props) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState(initialQuery);
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("active");
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(!compact || !!initialQuery);
  const [page, setPage] = useState(1);
  const active = cases.filter(c => c.status !== "resolved");
  const mine = active.filter(c => c.assignee === "Aisyah Rahman");
  const urgent = active.filter(c => c.priority === "high" || c.priority === "urgent");
  const filtered = useMemo(() => cases.filter(c => {
    if (tab === "mine" && c.assignee !== "Aisyah Rahman") return false;
    if (tab === "attention" && !["high", "urgent"].includes(c.priority)) return false;
    if (status === "active" && c.status === "resolved") return false;
    if (status !== "active" && status !== "all" && c.status !== status) return false;
    if (priority !== "all" && c.priority !== priority) return false;
    return `${c.customerName} ${c.email} ${c.id} ${c.title} ${c.location} ${c.category}`.toLowerCase().includes(query.toLowerCase());
  }), [cases, tab, status, priority, query]);
  const size = compact ? 5 : 9;
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * size, currentPage * size);
  const hasFilters = priority !== "all" || status !== "active";
  const reset = () => { setQuery(""); setPriority("all"); setStatus("active"); setTab("all"); setPage(1); };
  return <section className={`panel case-panel ${compact ? "case-panel-compact" : ""}`}>
    <div className="panel-heading"><div><h2>{compact ? "Your case queue" : "All customer cases"}<span className="subtle-count">{active.length}</span></h2><p>{compact ? "The whole story. The right next step." : "Every conversation, connected in one place."}</p></div><div className="panel-actions"><div className="popover-anchor"><button className={`button button-filter ${hasFilters ? "filter-active" : ""}`} onClick={() => setFilterOpen(!filterOpen)} aria-expanded={filterOpen}><Filter size={14}/>Filters{hasFilters && <span className="filter-count">{Number(priority !== "all") + Number(status !== "active")}</span>}</button>{filterOpen && <><button className="popup-dismiss" aria-label="Close filters" onClick={() => setFilterOpen(false)}/><div className="filter-popover floating-panel"><h3>Find the right cases</h3><label>Priority<select value={priority} onChange={event => { setPriority(event.target.value); setPage(1); }}><option value="all">All priorities</option>{Object.entries(priorityLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Status<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="active">All open cases</option><option value="all">Include resolved cases</option>{Object.entries(statusLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="filter-footer"><button className="text-link" onClick={reset}>Reset</button><button className="button button-primary button-small" onClick={() => setFilterOpen(false)}>Done</button></div></div></>}</div><div className="popover-anchor"><button className="icon-button" aria-label="More case actions" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={18}/></button>{menuOpen && <><button className="popup-dismiss" aria-label="Close actions" onClick={() => setMenuOpen(false)}/><div className="action-popover floating-panel"><button onClick={() => { exportCases(filtered); setMenuOpen(false); }}><Download size={15}/>Export filtered cases</button></div></>}</div></div></div>
    <div className="case-tabs-row"><div className="case-tabs" role="tablist" aria-label="Case queue"><button role="tab" aria-selected={tab === "all"} className={tab === "all" ? "active" : ""} onClick={() => { setTab("all"); setPage(1); }}>All cases<span>{active.length}</span></button><button role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "active" : ""} onClick={() => { setTab("mine"); setPage(1); }}>Assigned to me<span>{mine.length}</span></button><button role="tab" aria-selected={tab === "attention"} className={tab === "attention" ? "active" : ""} onClick={() => { setTab("attention"); setPage(1); }}>Needs attention<span>{urgent.length}</span></button></div>{compact && <button className={`icon-button queue-search-toggle ${searchOpen ? "selected" : ""}`} onClick={() => setSearchOpen(!searchOpen)} aria-label="Search case queue"><Search size={16}/></button>}</div>
    {searchOpen && <div className="case-search-row"><div className="input-with-icon"><Search size={16}/><input value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Search by customer, issue, case ID, or area…" aria-label="Search cases"/>{query && <button className="icon-button" aria-label="Clear search" onClick={() => setQuery("")}><X size={14}/></button>}</div>{hasFilters && <button className="text-link" onClick={reset}>Clear filters<X size={13}/></button>}</div>}
    <div className="table-scroll"><table className="case-table"><thead><tr><th>Customer</th><th>Issue</th><th>Priority</th><th>Status</th><th><span className="sr-only">Open case</span></th></tr></thead><tbody>{visible.map(item => <tr key={item.id} onClick={() => onOpen(item.id)}><td><button className="customer-cell" onClick={event => { event.stopPropagation(); onOpen(item.id); }}><Avatar name={item.customerName} color={item.avatarColor}/><span><strong>{item.customerName}</strong><small>{item.id}</small></span></button></td><td><div className="issue-cell"><span title={item.title}>{item.title}</span><small><i className={`category-dot category-${item.category.toLowerCase()}`}/>{item.category}<span className="cell-divider">·</span>{item.channel}</small></div></td><td><PriorityBadge priority={item.priority}/></td><td><StatusBadge status={item.status}/></td><td><ChevronRight size={15} className="row-chevron"/></td></tr>)}</tbody></table></div>
    {!visible.length && <EmptyState title="A little room to breathe" description="No cases match these filters. Try a different search or clear your filters." onReset={reset}/>}
    <div className="table-footer"><span>{filtered.length ? `Showing ${(currentPage - 1) * size + 1}–${Math.min(currentPage * size, filtered.length)} of ${filtered.length} cases` : "No matching cases"}</span>{compact ? <button className="text-link" onClick={onViewAll}>View all cases<ArrowRight size={14}/></button> : <div className="pagination"><button className="icon-button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page"><ChevronLeft size={16}/></button><span>Page {currentPage} of {pages}</span><button className="icon-button" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)} aria-label="Next page"><ChevronRight size={16}/></button></div>}</div>
  </section>;
}
