"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X, SearchX, Wifi, ArrowRight } from "lucide-react";
import { initials, priorityLabels, statusLabels, type CaseItem } from "@/lib/types";

export function Logo() {
  return <div className="brand"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 24V19" stroke="#F4B18D" strokeWidth="5" strokeLinecap="round"/><path d="M15 24V12" stroke="#F29365" strokeWidth="5" strokeLinecap="round"/><path d="M23 24V5" stroke="#E97746" strokeWidth="5" strokeLinecap="round"/></svg><span>ClearSignal<span className="brand-period">.</span></span></div>;
}

export function Avatar({ name, color = "peach", size = "normal" }: { name: string; color?: string; size?: "small" | "normal" | "large" }) {
  return <span aria-hidden="true" className={`avatar avatar-${color} avatar-${size}`}>{initials(name)}</span>;
}

export function StatusBadge({ status }: { status: CaseItem["status"] }) {
  return <span className={`status-badge status-${status}`}><span />{statusLabels[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: CaseItem["priority"] }) {
  return <span className={`priority-badge priority-${priority}`}><span className="priority-bars"><i /><i /><i /></span>{priorityLabels[priority]}</span>;
}

export function Sparkline({ tone = "orange", variant = 0 }: { tone?: string; variant?: number }) {
  const paths = ["M1 31 L10 27 L19 30 L28 20 L37 23 L46 13 L55 16 L64 8 L74 12 L84 3", "M1 9 L10 14 L19 11 L28 20 L37 17 L46 26 L55 20 L64 24 L74 17 L84 21", "M1 32 L10 29 L19 31 L28 24 L37 25 L46 16 L55 20 L64 12 L74 15 L84 5", "M1 7 L10 12 L19 9 L28 17 L37 15 L46 24 L55 19 L64 27 L74 24 L84 31"];
  return <svg className={`sparkline sparkline-${tone}`} viewBox="0 0 86 37" fill="none" aria-hidden="true"><path d={paths[variant % 4]} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function ConnectionIllustration() {
  return <svg className="connection-illustration" viewBox="0 0 390 160" fill="none" aria-hidden="true">
    <defs><filter id="cardShadow" x="-30%" y="-50%" width="170%" height="220%"><feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#B86837" floodOpacity=".09"/></filter></defs>
    <circle cx="286" cy="105" r="132" stroke="#F5D8C6" strokeWidth="1"/><circle cx="286" cy="105" r="103" stroke="#F3CFB8" strokeWidth="1"/><circle cx="286" cy="105" r="74" stroke="#EFC5AB" strokeWidth="1"/><circle cx="286" cy="105" r="45" fill="#F7DBCA" fillOpacity=".5"/>
    <path d="M67 111H122Q137 111 137 96V78Q137 63 152 63H267" stroke="#DFA583" strokeWidth="1.5" strokeDasharray="4 5"/>
    <circle cx="65" cy="111" r="5" fill="#E8B495" stroke="#FFF4EA" strokeWidth="4"/><circle cx="348" cy="42" r="5" fill="#EAC4AB"/><circle cx="192" cy="139" r="4" fill="#E8B495"/>
    <g transform="rotate(-7 179 83)" filter="url(#cardShadow)"><rect x="99" y="54" width="156" height="63" rx="11" fill="white"/><rect x="112" y="68" width="32" height="32" rx="9" fill="#FDF0E7"/><path d="M120 82a12 12 0 0 1 16 0m-13 4a7 7 0 0 1 10 0" stroke="#DB8659" strokeWidth="1.8" strokeLinecap="round"/><circle cx="128" cy="90" r="1.5" fill="#DB8659"/><rect x="154" y="73" width="72" height="5" rx="2.5" fill="#70716A" fillOpacity=".72"/><rect x="154" y="86" width="51" height="4" rx="2" fill="#D6D7D0"/><rect x="154" y="95" width="64" height="4" rx="2" fill="#E4E5DF"/></g>
    <g transform="rotate(9 295 59)" filter="url(#cardShadow)"><rect x="264" y="28" width="62" height="62" rx="17" fill="#E98450"/><path d="M278 52a25 25 0 0 1 34 0m-28 8a16 16 0 0 1 22 0m-16 7a7 7 0 0 1 10 0" stroke="white" strokeWidth="3.2" strokeLinecap="round"/><circle cx="295" cy="75" r="2.2" fill="white"/></g>
    <g filter="url(#cardShadow)"><rect x="245" y="111" width="111" height="30" rx="15" fill="white"/><circle cx="262" cy="126" r="7" fill="#E4F0E8"/><path d="m259 126 2 2 4-4" stroke="#609675" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><text x="275" y="130" fontSize="11" fontFamily="DM Sans, sans-serif" fontWeight="600" fill="#5E7562">Connected</text></g>
  </svg>;
}

export function NetworkMap({ large = false }: { large?: boolean }) {
  return <svg className={`network-map ${large ? "network-map-large" : ""}`} viewBox="0 0 420 190" fill="none" role="img" aria-label="Illustrative Klang Valley network map. A broadband incident is highlighted in Petaling Jaya.">
    <defs><pattern id="mapGrid" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)"><rect width="22" height="22" fill="#F3F5EF"/><path d="M0 0H22V22" stroke="white" strokeWidth="3"/></pattern></defs>
    <rect width="420" height="190" fill="#EAF0EE"/><path d="M0 0H121L183 43 181 75 151 102 130 129 97 190H0Z" fill="url(#mapGrid)"/><path d="M160 0H190L234 30 238 48 224 67 203 94 180 127 153 156 138 151 159 108 180 66 180 43Z" fill="url(#mapGrid)"/><path d="M217 0H420V190H183L185 164 215 139 230 111 248 94 246 75 271 41Z" fill="url(#mapGrid)"/>
    <path d="M20 62 148 127m40-70 75 42m-97 43 63 25m45-111 111 63" stroke="#DFE3D5" strokeWidth="4"/><path d="m31 160 79-106m155 121 88-125" stroke="#E5DBBD" strokeWidth="3"/>
    <path d="m207 77 69 47 62-44M276 124l-35 47M207 77l-80 7" stroke="#9BBAA6" strokeWidth="1.3" strokeDasharray="4 5"/>
    <text x="151" y="67" transform="rotate(-56 151 67)" fill="#9CA49D" fontSize="8" fontFamily="DM Sans, sans-serif" letterSpacing="1.6">KUALA LUMPUR</text><text x="319" y="45" fill="#9CA49D" fontSize="8" fontFamily="DM Sans, sans-serif" letterSpacing="1.6">SUBANG JAYA</text><text x="280" y="172" fill="#9CA49D" fontSize="8" fontFamily="DM Sans, sans-serif" letterSpacing="1.6">PETALING JAYA</text>
    {[ [127,84], [207,77], [338,80], [241,171] ].map(([x,y]) => <g key={`${x}-${y}`}><circle cx={x} cy={y} r="9" fill="#D8E8DA" fillOpacity=".8"/><circle cx={x} cy={y} r="4" fill="#7BA789" stroke="white" strokeWidth="2"/></g>)}
    <circle cx="276" cy="124" r="23" fill="#EFAE78" fillOpacity=".15"/><circle cx="276" cy="124" r="14" fill="#EFAE78" fillOpacity=".23"/><circle cx="276" cy="124" r="5" fill="#DC9358" stroke="white" strokeWidth="2"/>
    {large && <g><rect x="201" y="83" width="150" height="28" rx="7" fill="white"/><text x="213" y="101" fontSize="10" fill="#A36B42" fontFamily="DM Sans, sans-serif">Petaling Jaya · Investigating</text></g>}
  </svg>;
}

export function Dialog({ title, subtitle, children, onClose, wide = false, side = false, footer }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void; wide?: boolean; side?: boolean; footer?: ReactNode }) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const target = ref.current?.querySelector<HTMLElement>("input:not([disabled]), textarea:not([disabled]), select:not([disabled])") ?? ref.current?.querySelector<HTMLElement>("button");
    target?.focus({ preventScroll: true });
    function keyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab" || !ref.current) return;
      const focusable = Array.from(ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", keyDown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", keyDown); previous?.focus(); };
  }, []);
  return <div className={`dialog-overlay ${side ? "drawer-overlay" : ""}`} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} className={`dialog ${wide ? "dialog-wide" : ""} ${side ? "drawer" : ""}`}><div className="dialog-header"><div><h2 id={id}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19}/></button></div><div className="dialog-content">{children}</div>{footer && <div className="dialog-footer">{footer}</div>}</div></div>;
}

export function EmptyState({ title, description, onReset }: { title: string; description: string; onReset?: () => void }) {
  return <div className="empty-state"><span><SearchX size={25}/></span><h3>{title}</h3><p>{description}</p>{onReset && <button className="button button-secondary" onClick={onReset}>Clear filters</button>}</div>;
}

export function ConnectedFooter() {
  return <div className="connected-footer"><span><Wifi size={13}/> A little clarity. A better connection.</span><span>Made for the people behind the signal <span className="footer-dot">✳</span></span></div>;
}

export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="text-link" onClick={onClick}>{children}<ArrowRight size={14}/></button>;
}
