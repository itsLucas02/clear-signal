"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BookOpen, ChartNoAxesCombined, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, Command, FileText, Flag, Headphones, LayoutGrid, LoaderCircle, MapPin, Menu, MessageSquare, MoreHorizontal, Plus, RadioTower, Search, Settings2, Signal, Smartphone, Sparkles, Sun, Ticket, UserRound, Users, Wifi, X } from "lucide-react";
import CaseTable from "@/components/case-table";
import CaseDrawer from "@/components/case-drawer";
import CreateCaseDialog from "@/components/create-case-dialog";
import { CustomersView, InsightsView, NetworkView, PlaybooksView } from "@/components/views";
import { Avatar, ConnectedFooter, ConnectionIllustration, Dialog, EmptyState, Logo, NetworkMap, Sparkline, StatusBadge } from "@/components/ui";
import { api } from "@/lib/client";
import { timeAgo, type Activity, type CaseItem, type Category, type View, type WorkspaceData } from "@/lib/types";

const navigation = [
  { id: "overview" as View, label: "Overview", Icon: LayoutGrid },
  { id: "cases" as View, label: "Cases", Icon: Ticket },
  { id: "customers" as View, label: "Customers", Icon: Users },
  { id: "network" as View, label: "Network status", Icon: RadioTower },
];
const resources = [
  { id: "playbooks" as View, label: "Playbooks", Icon: BookOpen },
  { id: "insights" as View, label: "Insights", Icon: ChartNoAxesCombined },
];
const pageNames: Record<View, string> = { overview: "Overview", cases: "Cases", customers: "Customers", network: "Network status", playbooks: "Playbooks", insights: "Insights" };
const pageCopy: Record<View, { title: string; description: string }> = {
  overview: { title: "Good morning, Aisyah", description: "Let’s make better connections, one customer at a time." },
  cases: { title: "Every case. A clearer picture.", description: "Bring the story together and find the next right step." },
  customers: { title: "People, not just account numbers.", description: "A little understanding goes a long way toward a better connection." },
  network: { title: "See beyond the single signal.", description: "Connect customer reports with what’s happening on the network." },
  playbooks: { title: "A helping hand, when you need one.", description: "Tried-and-clear guidance for the conversations that matter." },
  insights: { title: "Small steps. Meaningful progress.", description: "See how your team is turning connectivity issues into better days." },
};

function ActivityIcon({ kind }: { kind: string }) {
  return <span className={`activity-icon activity-${kind}`}>{kind === "resolved" ? <Check size={13}/> : kind === "network" ? <RadioTower size={13}/> : kind === "note" ? <MessageSquare size={12}/> : kind === "assigned" ? <UserRound size={12}/> : <Ticket size={12}/>}</span>;
}

export default function Workspace({ initialData }: { initialData: WorkspaceData }) {
  const [data, setData] = useState(initialData);
  const [view, setView] = useState<View>("overview");
  const [caseQuery, setCaseQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newCategory, setNewCategory] = useState<Category>("Broadband");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [available, setAvailable] = useState(true);
  const [lastRead, setLastRead] = useState("");
  const [toast, setToast] = useState<{ message: string; error: boolean; id: number } | null>(null);
  const notify = useCallback((message: string, error = false) => setToast({ message, error, id: Date.now() }), []);
  const active = data.cases.filter(item => item.status !== "resolved");
  const mine = active.filter(item => item.assignee === "Aisyah Rahman");
  const attention = active.filter(item => item.priority === "high" || item.priority === "urgent");
  const todayResolved = data.cases.filter(item => item.resolvedAt && new Date(item.resolvedAt).toDateString() === new Date().toDateString());
  const avgMinutes = todayResolved.length ? Math.round(todayResolved.reduce((sum,item) => sum + (new Date(item.resolvedAt!).getTime() - new Date(item.createdAt).getTime()) / 60000, 0) / todayResolved.length) : 0;
  const selectedCase = data.cases.find(item => item.id === selectedId);
  const activeIncidents = data.incidents.filter(incident => !["Scheduled", "Resolved"].includes(incident.status));
  const unread = !!data.activities.length && lastRead !== data.activities[0].id;

  useEffect(() => {
    function syncLocation() { const params = new URLSearchParams(window.location.search); const next = params.get("view"); if (next && next in pageNames) setView(next as View); else setView("overview"); setCaseQuery(params.get("q") || ""); }
    syncLocation();
    setLastRead(localStorage.getItem("clearsignal-last-read") || "");
    setAvailable(localStorage.getItem("clearsignal-available") !== "false");
    window.addEventListener("popstate", syncLocation);
    function keyboard(event: KeyboardEvent) { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(value => !value); } if (event.key === "Escape") { setSidebarOpen(false); setNotificationsOpen(false); } }
    window.addEventListener("keydown", keyboard);
    return () => { window.removeEventListener("popstate", syncLocation); window.removeEventListener("keydown", keyboard); };
  }, []);
  useEffect(() => { if (!toast) return; const timeout = setTimeout(() => setToast(null), 4500); return () => clearTimeout(timeout); }, [toast]);
  const refresh = useCallback(async () => { const next = await api<WorkspaceData>("/api/workspace"); setData(next); }, []);
  function navigate(next: View, query = "") {
    setView(next); setCaseQuery(query); setSidebarOpen(false); setSelectedId(null); setNotificationsOpen(false); setHelpOpen(false);
    const params = new URLSearchParams(); if (next !== "overview") params.set("view", next); if (query) params.set("q", query);
    const suffix = params.toString(); window.history.pushState(null, "", suffix ? `?${suffix}` : window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openCase(id: string) { setSelectedId(id); setNotificationsOpen(false); setSearchOpen(false); setActivityOpen(false); setHelpOpen(false); }
  function newCase(category: Category = "Broadband") { setNewCategory(category); setCreating(true); }
  async function onCreated(item: CaseItem) {
    setData(previous => ({ ...previous, cases: [item, ...previous.cases] }));
    setCreating(false); setSelectedId(item.id); notify("New case created. Let’s connect the dots.");
    try { await refresh(); } catch { notify("Case saved. Refresh the page to load the latest activity."); }
  }
  async function updateCase(id: string, changes: Partial<CaseItem>) {
    const result = await api<{ case: CaseItem }>(`/api/cases/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
    setData(previous => ({ ...previous, cases: previous.cases.map(item => item.id === id ? result.case : item) }));
    await refresh();
  }
  async function toggleSaved(id: string) {
    const saved = !data.savedPlaybooks.includes(id);
    try {
      await api("/api/playbooks", { method: "POST", body: JSON.stringify({ id, saved }) });
      setData(previous => ({ ...previous, savedPlaybooks: saved ? [...previous.savedPlaybooks, id] : previous.savedPlaybooks.filter(value => value !== id) }));
      notify(saved ? "Playbook saved. A little know-how, close at hand." : "Playbook removed from saved.");
    } catch (error) { notify(error instanceof Error ? error.message : "Couldn’t update your saved playbooks.", true); }
  }
  function openActivity(activity: Activity) { if (activity.caseId) openCase(activity.caseId); else { setActivityOpen(false); navigate("network"); } }
  function markRead() { const id = data.activities[0]?.id || ""; setLastRead(id); localStorage.setItem("clearsignal-last-read", id); }
  const searchResults = useMemo(() => data.cases.filter(item => `${item.customerName} ${item.email} ${item.title} ${item.id} ${item.location}`.toLowerCase().includes(search.toLowerCase())).slice(0, 8), [data.cases, search]);
  const metrics = [
    { label: "Open cases", value: active.length, note: `${mine.length} assigned to you`, Icon: Ticket, tone: "orange", variant: 0 },
    { label: "Needs attention", value: attention.length, note: "Let’s give these a little care", Icon: Flag, tone: "purple", variant: 1 },
    { label: "Resolved today", value: todayResolved.length, note: "Better days, made possible", Icon: CheckCircle2, tone: "green", variant: 2 },
    { label: "Avg. resolution", value: avgMinutes, unit: "min", note: "For today’s resolved cases", Icon: Clock3, tone: "blue", variant: 3 },
  ];
  return <div className="app-shell">
    {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}/>}
    <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
      <button className="brand-button" onClick={() => navigate("overview")} aria-label="ClearSignal overview"><Logo/></button>
      <button className="workspace-switcher" onClick={() => setProfileOpen(true)}><span className="workspace-icon"><Headphones size={13}/></span><span>Support workspace</span><ChevronDown size={13}/></button>
      <div className="nav-section-label">WORKSPACE</div>
      <nav aria-label="Main navigation"><div className="nav-group">{navigation.map(({ id, label, Icon }) => <button key={id} className={`nav-item ${view === id ? "active" : ""}`} onClick={() => navigate(id)} aria-current={view === id ? "page" : undefined} title={label}><Icon size={18}/><span>{label}</span>{id === "cases" && <span className="nav-count">{active.length}</span>}{id === "network" && <i className="nav-status-dot"/>}</button>)}</div><div className="nav-section-label knowledge-label">A LITTLE KNOW-HOW</div><div className="nav-group">{resources.map(({ id, label, Icon }) => <button key={id} className={`nav-item ${view === id ? "active" : ""}`} onClick={() => navigate(id)} aria-current={view === id ? "page" : undefined} title={label}><Icon size={18}/><span>{label}</span>{id === "playbooks" && <span className="nav-new">NEW</span>}</button>)}</div></nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><div className="note-illustration"><span/><span/><span/><Wifi size={21}/><i><Check size={10}/></i></div><h3>Good connections<br/>start with you.</h3><p>A little clarity can make<br/>a big difference.</p><button onClick={() => setHelpOpen(true)}>Meet your workspace<ArrowUpRight size={14}/></button></div><button className="sidebar-help" onClick={() => setHelpOpen(true)}><CircleHelp size={17}/><span>A little help?</span><ArrowUpRight size={13}/></button><div className="demo-workspace-label"><span/>Shared demo workspace</div></div>
      <button className="sidebar-profile" onClick={() => setProfileOpen(true)}><span className="profile-avatar"><Avatar name="Aisyah Rahman" color="sage"/><i className={available ? "" : "away"}/></span><span className="profile-name"><strong>Aisyah Rahman</strong><small>Support agent</small></span><MoreHorizontal size={18}/></button>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={20}/></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={13}/><strong>{pageNames[view]}</strong></div></div><div className="topbar-actions"><button className="global-search" onClick={() => { setSearch(""); setSearchOpen(true); }}><Search size={16}/><span>Search anything...</span><kbd><Command size={10}/>K</kbd></button><span className="topbar-divider"/><button className="icon-button header-help" onClick={() => setHelpOpen(true)} aria-label="Workspace help"><CircleHelp size={19}/></button><div className="popover-anchor"><button className={`icon-button notification-button ${notificationsOpen ? "selected" : ""}`} onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label={unread ? "Notifications, new updates" : "Notifications"} aria-expanded={notificationsOpen}><Bell size={19}/>{unread && <i/>}</button>{notificationsOpen && <><button className="popup-dismiss" aria-label="Close notifications" onClick={() => setNotificationsOpen(false)}/><div className="notifications-popover floating-panel"><div className="notification-heading"><h3>A little update</h3><button className="text-link" onClick={markRead}>{unread ? "Mark all read" : "All caught up"}</button></div>{data.activities.slice(0, 5).map(activity => <button className="notification-row" key={activity.id} onClick={() => openActivity(activity)}><ActivityIcon kind={activity.kind}/><span><strong>{activity.content}</strong><small>{timeAgo(activity.createdAt)}</small></span><ChevronRight size={13}/></button>)}{!data.activities.length && <p className="notification-empty">You’re all caught up.</p>}<button className="notification-footer" onClick={() => { setNotificationsOpen(false); setActivityOpen(true); }}>See all workspace activity<ArrowRight size={14}/></button></div></>}</div><button className="topbar-avatar" onClick={() => setProfileOpen(true)} aria-label="Your profile"><Avatar name="Aisyah Rahman" color="sage" size="small"/></button></div></header>
      <main className="main-content"><div className="page-heading"><div><h1>{pageCopy[view].title}{view === "overview" && <Sun className="greeting-sun" size={28} strokeWidth={1.6}/>}</h1><p>{pageCopy[view].description}</p></div><div className="page-heading-actions">{view === "overview" && <button className="button button-secondary" onClick={() => navigate("insights")}><ChartNoAxesCombined size={15}/>View reports</button>}<button className="button button-primary" onClick={() => newCase()}><Plus size={17}/>New case</button></div></div>
        {view === "overview" && <>
          <section className="welcome-banner"><div className="banner-copy"><div className="banner-eyebrow"><Sparkles size={12}/>A LITTLE CLARITY GOES A LONG WAY</div><h2>Less searching. More solving.</h2><p>Every report, conversation, and next step. Finally, in one place.</p></div><ConnectionIllustration/></section>
          <section className="metrics-grid" aria-label="Your workspace at a glance">{metrics.map(({ label,value,note,Icon,tone,variant,unit }) => <article key={label} className="metric-card panel"><div className="metric-top"><span>{label}</span><span className={`metric-icon metric-icon-${tone}`}><Icon size={16}/></span></div><div className="metric-value-row"><strong>{value}{unit && <small>{unit}</small>}</strong><Sparkline tone={tone} variant={variant}/></div><div className={`metric-note metric-note-${tone}`}>{tone === "green" ? <ArrowUpRight size={12}/> : tone === "blue" ? <Clock3 size={11}/> : <span className="tiny-dot"/>}{note}</div></article>)}</section>
          <div className="dashboard-grid"><CaseTable cases={data.cases} compact onOpen={openCase} onViewAll={() => navigate("cases")}/><div className="dashboard-aside"><section className="panel network-pulse"><div className="small-panel-heading"><h2>Network pulse</h2><span className="demo-chip">DEMO</span></div><div className="network-health"><span className="health-dot"/><strong>{activeIncidents.length ? "Mostly clear skies" : "All signals looking good"}</strong><span>{4 - new Set(activeIncidents.map(i => i.service)).size}/4 services healthy</span></div><div className="mini-map"><NetworkMap/><span className="mini-map-label"><MapPin size={10}/>Klang Valley</span></div><div className="network-alert"><span className="warning-dot"/><span>{activeIncidents.length ? `${activeIncidents.length} area needs a little attention` : "No active network incidents"}</span><ChevronRight size={13}/></div><button className="panel-bottom-link" onClick={() => navigate("network")}>View network status<ArrowRight size={14}/></button></section><section className="panel recent-activity"><div className="small-panel-heading"><h2>Recent activity</h2><button className="icon-button" onClick={() => setActivityOpen(true)} aria-label="View all recent activity"><MoreHorizontal size={17}/></button></div><div className="activity-list">{data.activities.slice(0, 4).map(activity => <button key={activity.id} className="activity-row" onClick={() => openActivity(activity)}><ActivityIcon kind={activity.kind}/><span><strong>{activity.content}</strong><small>{timeAgo(activity.createdAt)}</small></span></button>)}</div></section></div></div>
          <section className="quick-guides"><div className="quick-guides-heading"><h2>A little know-how goes a long way<span>Good guidance, right when you need it.</span></h2><button className="text-link" onClick={() => navigate("playbooks")}>Explore playbooks<ArrowRight size={14}/></button></div><div className="quick-guide-grid"><button className="panel quick-guide" onClick={() => navigate("playbooks", "broadband-basics")}><span className="quick-guide-icon guide-orange"><Wifi size={20}/></span><span><strong>Bring broadband back online</strong><small>From a dropped signal to a fresh start.</small></span><ArrowUpRight size={17}/></button><button className="panel quick-guide" onClick={() => navigate("playbooks", "mobile-data")}><span className="quick-guide-icon guide-blue"><Smartphone size={20}/></span><span><strong>Get mobile data moving</strong><small>A clear path back to connected.</small></span><ArrowUpRight size={17}/></button><button className="panel quick-guide" onClick={() => navigate("playbooks", "billing-clarity")}><span className="quick-guide-icon guide-purple"><FileText size={20}/></span><span><strong>Make sense of a confusing bill</strong><small>A little explanation. A lot of relief.</small></span><ArrowUpRight size={17}/></button></div></section>
        </>}
        {view === "cases" && <CaseTable key={caseQuery} cases={data.cases} onOpen={openCase} onViewAll={() => navigate("cases")} initialQuery={caseQuery}/>}
        {view === "customers" && <CustomersView data={data} onOpenCase={openCase} onNewCase={() => newCase()}/>}
        {view === "network" && <NetworkView data={data} onOpenCase={openCase} onAreaCases={area => navigate("cases", area)}/>}
        {view === "playbooks" && <PlaybooksView key={caseQuery} initialId={caseQuery} saved={data.savedPlaybooks} onToggleSaved={toggleSaved} onNewCase={newCase} notify={notify}/>}
        {view === "insights" && <InsightsView data={data}/>}
        <ConnectedFooter/>
      </main>
    </div>
    {selectedCase && <CaseDrawer key={selectedCase.id} item={selectedCase} incidents={data.incidents} onClose={() => setSelectedId(null)} onUpdate={updateCase} onRefresh={refresh} onNetwork={() => navigate("network")} notify={notify}/>}
    {creating && <CreateCaseDialog category={newCategory} onClose={() => setCreating(false)} onCreated={onCreated}/>}
    {searchOpen && <Dialog title="A little less searching." subtitle="Find a customer, a case, or the next piece of context." onClose={() => setSearchOpen(false)}><div className="command-search"><Search size={20}/><input autoFocus aria-label="Search the workspace" placeholder="Try a name, an issue, or a case ID…" value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && searchResults[0]) openCase(searchResults[0].id); }}/>{search && <button className="icon-button" onClick={() => setSearch("")} aria-label="Clear search"><X size={15}/></button>}</div><div className="search-results-label">{search ? `${searchResults.length} MATCHING CASES` : "RECENT CASES"}</div><div className="command-results">{searchResults.map(item => <button key={item.id} onClick={() => openCase(item.id)}><Avatar name={item.customerName} color={item.avatarColor}/><span><strong>{item.title}</strong><small>{item.customerName}<i>·</i>{item.id}</small></span><StatusBadge status={item.status}/><ChevronRight size={14}/></button>)}</div>{!searchResults.length && <EmptyState title="Nothing on that signal yet" description="Try a customer’s name, a case number, or a different issue."/>}<div className="command-hint"><span><kbd>↵</kbd>Open first result</span><span><kbd>esc</kbd>Close search</span></div></Dialog>}
    {activityOpen && <Dialog title="Little updates. A shared story." subtitle="The latest activity across your support workspace." onClose={() => setActivityOpen(false)}><div className="full-activity-list">{data.activities.map(activity => <button className="full-activity-row" key={activity.id} onClick={() => openActivity(activity)}><ActivityIcon kind={activity.kind}/><span><strong>{activity.content}</strong><small>{activity.caseId || "Network context"}<i>·</i>{timeAgo(activity.createdAt)}</small></span><ArrowUpRight size={15}/></button>)}</div></Dialog>}
    {helpOpen && <Dialog wide title="A clearer picture starts here." subtitle="Built for the people behind the signal." onClose={() => setHelpOpen(false)}><div className="onboarding-flow"><span><MessageSquare size={23}/>The reports</span><ArrowRight size={18}/><span><RadioTower size={23}/>The context</span><ArrowRight size={18}/><span><CheckCircle2 size={23}/>The resolution</span></div><p className="onboarding-intro">When the same customer’s story is scattered across calls, chats, and notes, good support gets harder. ClearSignal brings it all into one case — so you can spend less time piecing things together and more time helping.</p><div className="tour-steps"><button onClick={() => openCase("CS-1048")}><span>01</span><div><strong>Pick up the whole story</strong><p>Meet Sarah. Her broadband keeps dropping, and she’s already contacted support twice.</p></div><ArrowUpRight size={17}/></button><button onClick={() => navigate("network")}><span>02</span><div><strong>See the bigger picture</strong><p>A local network incident could explain the issue — without another router restart.</p></div><ArrowUpRight size={17}/></button><button onClick={() => navigate("playbooks")}><span>03</span><div><strong>Take one useful next step</strong><p>Use a playbook, write a clear update, and leave a handoff the next person can actually use.</p></div><ArrowUpRight size={17}/></button></div><div className="onboarding-note"><ShieldIcon/><div><strong>Demo data. Real, saved workflows.</strong><p>Cases, notes, checklist progress, and saved playbooks are stored in PostgreSQL. Network data is illustrative. Customer drafts are not sent externally.</p></div></div></Dialog>}
    {profileOpen && <Dialog title="Your support workspace" onClose={() => setProfileOpen(false)} footer={<button className="button button-primary" onClick={() => setProfileOpen(false)}>Back to better connections<ArrowRight size={15}/></button>}><div className="customer-profile"><Avatar name="Aisyah Rahman" color="sage" size="large"/><h2>Aisyah Rahman</h2><p>Support agent · ClearSignal</p></div><div className="availability-setting"><div><strong>Your availability</strong><p>{available ? "Ready for your next customer conversation." : "Taking a moment. Your cases will be here."}</p></div><button className={`toggle-switch ${available ? "on" : ""}`} role="switch" aria-checked={available} aria-label="Available for support" onClick={() => { setAvailable(!available); localStorage.setItem("clearsignal-available", String(!available)); }}><span/></button></div><div className="workspace-info"><h3><Users size={17}/>One team. One shared picture.</h3><p>You’re exploring a shared demo as Aisyah. Case owners also include Faizal Rosli and Nurul Huda. Change the owner in any case to hand it over with its complete history.</p><span>Sample accounts · No sign-in required · Changes are saved</span></div></Dialog>}
    {toast && <div className={`toast ${toast.error ? "toast-error" : ""}`} role={toast.error ? "alert" : "status"} key={toast.id}>{toast.error ? <CircleHelp size={19}/> : <CheckCircle2 size={19}/>}<span>{toast.message}</span><button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={15}/></button></div>}
  </div>;
}

function ShieldIcon() { return <span className="onboarding-shield"><CheckCircle2 size={20}/></span>; }
