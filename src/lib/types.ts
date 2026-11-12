export type CaseStatus = "open" | "in_progress" | "waiting" | "resolved";
export type Priority = "urgent" | "high" | "medium" | "low";
export type Category = "Broadband" | "Mobile" | "Billing" | "Installation";
export type View = "overview" | "cases" | "customers" | "network" | "playbooks" | "insights";

export interface CaseItem {
  id: string;
  customerName: string;
  email: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: CaseStatus;
  channel: string;
  assignee: string;
  location: string;
  plan: string;
  avatarColor: string;
  completedSteps: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface Note {
  id: string;
  caseId: string;
  author: string;
  kind: string;
  content: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  area: string;
  severity: string;
  status: string;
  service: string;
  summary: string;
  startedAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  caseId: string | null;
  kind: string;
  content: string;
  createdAt: string;
}

export interface WorkspaceData {
  cases: CaseItem[];
  incidents: Incident[];
  activities: Activity[];
  savedPlaybooks: string[];
}

export interface Playbook {
  id: string;
  title: string;
  description: string;
  category: Category;
  duration: string;
  steps: string[];
  customerUpdate: string;
}

export const statusLabels: Record<CaseStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting: "Waiting",
  resolved: "Resolved",
};
export const priorityLabels: Record<Priority, string> = {
  urgent: "Urgent", high: "High", medium: "Medium", low: "Low",
};

export const playbooks: Playbook[] = [
  {
    id: "broadband-basics", title: "Bring broadband back online", category: "Broadband", duration: "5–8 min",
    description: "From the first line check to a stable connection. A clear path through the most common broadband issues.",
    steps: ["Check for a network incident in the customer's area", "Confirm the router's power and broadband lights", "Ask the customer to restart the router for 30 seconds", "Test a wired connection and record the speed", "Confirm the connection is stable with the customer"],
    customerUpdate: "Thanks for your patience. I’ve brought your reports together and am checking the network in your area. Please keep your router powered on. I’ll share the next update as soon as I have confirmed the cause.",
  },
  {
    id: "mobile-data", title: "Get mobile data moving", category: "Mobile", duration: "4–6 min",
    description: "Work through settings, SIM activation, and coverage to help customers get connected on the go.",
    steps: ["Confirm the plan includes an active mobile data allowance", "Check local mobile coverage and known incidents", "Verify mobile data and the correct SIM are enabled", "Toggle airplane mode, then restart the device", "Test a website with Wi-Fi switched off"],
    customerUpdate: "I’m checking your mobile plan and local coverage together so you don’t have to repeat yourself. Please leave mobile data switched on. We’ll test the connection together before closing your case.",
  },
  {
    id: "billing-clarity", title: "Make a confusing bill make sense", category: "Billing", duration: "6–10 min",
    description: "Trace unexpected charges, explain what changed, and agree on a clear next step.",
    steps: ["Verify the account holder and billing period", "Compare the disputed charge with the plan details", "Review usage, roaming, and any recent plan changes", "Explain the charge or request a billing adjustment", "Confirm the agreed outcome and next bill date"],
    customerUpdate: "I’ve recorded the charge you’re querying and am comparing it with your plan and usage. I’ll explain what happened in plain language and confirm any agreed adjustment before we close the case.",
  },
  {
    id: "installation-ready", title: "Make the first visit count", category: "Installation", duration: "5–7 min",
    description: "Give the field team the access details and equipment context they need before they arrive.",
    steps: ["Confirm the service address and customer contact", "Check the installation order and required equipment", "Record building access and site restrictions", "Agree on a visit window with the field team", "Share the appointment and preparation checklist"],
    customerUpdate: "I’m putting your address, access details, and equipment requirements in one place for our field team. We’ll confirm the visit window and tell you exactly what to expect before the appointment.",
  },
  {
    id: "slow-wifi", title: "Find the Wi-Fi slow spot", category: "Broadband", duration: "5–10 min",
    description: "Separate an in-home Wi-Fi problem from a network issue, without sending the customer in circles.",
    steps: ["Compare Wi-Fi and wired speed test results", "Check router placement and nearby interference", "Check the number of active connected devices", "Test the 5 GHz band close to the router", "Record the improvement and confirm the customer's needs"],
    customerUpdate: "We’re checking whether the slowdown is on the line or inside your home. Comparing a wired test with Wi-Fi will help us choose the right fix, rather than ask you to repeat steps that won’t help.",
  },
  {
    id: "esim-activation", title: "A smoother eSIM setup", category: "Mobile", duration: "4–8 min",
    description: "Help customers activate a new eSIM and keep their number without the setup stress.",
    steps: ["Confirm the device supports eSIM and is unlocked", "Check that the activation code has not expired", "Connect the device to a reliable Wi-Fi network", "Guide the customer through adding a mobile plan", "Test an outgoing call and mobile data"],
    customerUpdate: "I’ll guide you through activating your eSIM one step at a time. Keep your device connected to Wi-Fi, and we’ll make sure calls and data work before we finish.",
  },
];

export function initials(name: string) {
  return name.split(" ").filter(Boolean).map(part => part[0]).slice(0, 2).join("").toUpperCase();
}

export function timeAgo(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}
