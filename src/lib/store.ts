import { db } from "@/db";
import { activities, cases, incidents, notes, savedPlaybooks } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type { CaseItem, WorkspaceData } from "@/lib/types";

let seedPromise: Promise<void> | undefined;

async function seed() {
  const existing = await db.select({ id: cases.id }).from(cases).limit(1);
  if (existing.length) return;
  const now = Date.now();
  const ago = (minutes: number) => new Date(now - minutes * 60000);
  const customers = [
    ["CS-1048", "Sarah Chen", "Intermittent broadband connection", "Broadband", "high", "in_progress", "Chat", "Aisyah Rahman", "Petaling Jaya, Selangor", "peach", "My internet keeps dropping during video calls. It has happened several times since this morning. I restarted the router, but the connection still drops every 15–20 minutes. I work from home and need a reliable connection."],
    ["CS-1047", "Ahmad Faiz", "Unexpected roaming charges", "Billing", "medium", "open", "Email", "Aisyah Rahman", "Kuala Lumpur", "lavender", "My latest bill includes RM 48 in roaming charges even though I purchased a travel pass before my trip. I would like to understand the charge and have it reviewed."],
    ["CS-1046", "Lim Wei Jian", "No data after plan upgrade", "Mobile", "high", "open", "Phone", "Aisyah Rahman", "Subang Jaya, Selangor", "blue", "I upgraded my mobile plan yesterday. Calls work, but mobile data has stopped working. I have already restarted my phone and checked that mobile data is enabled."],
    ["CS-1045", "Priya Nair", "Slow speeds during work hours", "Broadband", "medium", "waiting", "Phone", "Aisyah Rahman", "Bangsar, Kuala Lumpur", "pink", "The Wi-Fi speed falls below 15 Mbps during the afternoon on my Fibre 500 plan. The router is in the hallway and several family members are connected."],
    ["CS-1044", "Daniel Tan", "Router installation incomplete", "Installation", "low", "open", "App", "Faizal Rosli", "Johor Bahru, Johor", "sage", "The technician could not access the utility room during the last appointment. The building manager is now available on weekday mornings. I need a new installation visit."],
    ["CS-1043", "Nurul Aisyah", "Calls dropping near home", "Mobile", "urgent", "in_progress", "Chat", "Aisyah Rahman", "Cheras, Kuala Lumpur", "sand", "My calls disconnect after a few minutes when I am at home. This is affecting important calls. The issue occurs on two devices on the same family plan."],
    ["CS-1042", "Siti Aminah", "Charged twice for monthly plan", "Billing", "medium", "open", "Email", "Nurul Huda", "Shah Alam, Selangor", "pink", "Two identical monthly subscription payments appear on my bank statement. Please check whether both payments were collected and help me arrange a refund if appropriate."],
    ["CS-1041", "Arjun Menon", "Complete loss of connection", "Broadband", "high", "in_progress", "Phone", "Aisyah Rahman", "Petaling Jaya, Selangor", "blue", "The broadband light on my router is red and there is no internet on any device. The problem started this morning. Power cycling has not helped."],
    ["CS-1040", "Farah Zulaikha", "Unable to activate eSIM", "Mobile", "medium", "waiting", "Chat", "Faizal Rosli", "Mont Kiara, Kuala Lumpur", "lavender", "The QR code for my new eSIM says the activation code is no longer valid. I have a compatible unlocked phone and am connected to Wi-Fi."],
    ["CS-1039", "Hafiz Rahman", "Moving home service transfer", "Broadband", "low", "open", "Email", "Aisyah Rahman", "Cyberjaya, Selangor", "sand", "I am moving next week and want to transfer my existing fibre plan. The new building already has a fibre connection, but I am unsure whether a visit is needed."],
    ["CS-1038", "Aisha Hassan", "Family plan discount missing", "Billing", "low", "open", "Chat", "Nurul Huda", "Ampang, Selangor", "peach", "I added a third line to my family account, but the promised multi-line discount is not shown on the current bill. Please check that all lines are linked."],
    ["CS-1037", "Tan Wei Ming", "Visual voicemail not syncing", "Mobile", "medium", "in_progress", "App", "Aisyah Rahman", "Puchong, Selangor", "sage", "New voicemails are available when I call the voicemail service, but they do not appear in the visual voicemail app. This started after a device update."],
  ];
  await db.transaction(async tx => {
    await tx.insert(cases).values(customers.map((c, index) => ({
      id: c[0], customerName: c[1], email: `${c[1].toLowerCase().replaceAll(" ", ".")}@example.com`,
      title: c[2], category: c[3], priority: c[4], status: c[5], channel: c[6], assignee: c[7], location: c[8], avatarColor: c[9], description: c[10],
      plan: c[3] === "Broadband" || c[3] === "Installation" ? "Fibre 500" : "Connect Plus",
      completedSteps: index === 0 ? ["1"] : [], createdAt: ago(180 + index * 85), updatedAt: ago(8 + index * 11),
    }))).onConflictDoNothing();
    const resolvedNames = ["Aina Sofea", "Amirul Hakim", "Chloe Wong", "Faris Idris", "Hannah Lim", "Izzat Firdaus", "Jia Hui", "Kumar Raj"];
    const durations = [24, 35, 41, 52, 46, 38, 64, 36];
    await tx.insert(cases).values(resolvedNames.map((name, index) => ({
      id: `CS-${1036 - index}`, customerName: name, email: `${name.toLowerCase().replaceAll(" ", ".")}@example.com`,
      title: ["Router connection restored", "Billing adjustment confirmed", "Mobile data restored", "New router activated"][index % 4],
      description: "The reported issue has been investigated and the customer has confirmed that their service is working as expected.",
      category: ["Broadband", "Billing", "Mobile", "Installation"][index % 4], priority: "medium", status: "resolved", channel: ["Chat", "Phone", "Email"][index % 3],
      assignee: index < 6 ? "Aisyah Rahman" : "Faizal Rosli", location: "Kuala Lumpur", plan: "Connect Plus", avatarColor: ["peach", "sage", "blue", "lavender"][index % 4],
      createdAt: ago(4 + index * 12 + durations[index]), updatedAt: ago(4 + index * 12), resolvedAt: ago(4 + index * 12), completedSteps: ["0", "1", "2", "3", "4"],
    }))).onConflictDoNothing();
    await tx.insert(cases).values(Array.from({ length: 12 }, (_, index) => ({
      id: `CS-${1028 - index}`, customerName: ["Anis Sofia", "Bryan Lee", "Dayang Nur", "Ethan Chua", "Fatin Zahra", "Gopal Krishnan"][index % 6],
      email: `customer${index + 1}@example.com`, title: ["Connection issue resolved", "Plan details clarified", "SIM activation completed"][index % 3],
      description: "Customer contacted support and received a confirmed resolution.", category: ["Broadband", "Billing", "Mobile"][index % 3],
      priority: "low", status: "resolved", channel: ["Chat", "Email", "Phone"][index % 3], assignee: "Aisyah Rahman", location: "Klang Valley", plan: "Connect Plus", avatarColor: "sage",
      createdAt: ago((Math.floor(index / 2) + 1) * 1440 + 50 + index * 2), updatedAt: ago((Math.floor(index / 2) + 1) * 1440), resolvedAt: ago((Math.floor(index / 2) + 1) * 1440), completedSteps: [],
    }))).onConflictDoNothing();
    await tx.insert(notes).values(customers.map((c, index) => ({
      id: `report-${c[0]}`, caseId: c[0], author: c[1], kind: c[6].toLowerCase(), content: c[10], createdAt: ago(180 + index * 85),
    }))).onConflictDoNothing();
    await tx.insert(notes).values([
      { id: "note-sarah-1", caseId: "CS-1048", author: "Faizal Rosli", kind: "phone", content: "Follow-up call: the customer has already restarted the router twice. Drops affect both Wi-Fi and Ethernet. Avoid asking her to repeat these steps.", createdAt: ago(90) },
      { id: "note-sarah-2", caseId: "CS-1048", author: "Aisyah Rahman", kind: "note", content: "The address overlaps with the Petaling Jaya network incident. Checking with the network team before arranging a field visit. Customer prefers an email update.", createdAt: ago(8) },
    ]).onConflictDoNothing();
    await tx.insert(incidents).values([
      { id: "NET-208", title: "Intermittent fibre connectivity", area: "Petaling Jaya", severity: "minor", status: "Investigating", service: "Broadband", summary: "An aggregation link is experiencing intermittent packet loss. The network team is investigating. Customers in Petaling Jaya may see short connection drops. No confirmed restoration time yet; keep routers powered on and avoid unnecessary equipment replacements.", startedAt: ago(78), updatedAt: ago(12) },
      { id: "NET-209", title: "Planned fibre maintenance", area: "Kuala Lumpur", severity: "maintenance", status: "Scheduled", service: "Broadband", summary: "Scheduled equipment maintenance will take place overnight, from 02:00 to 04:00 local time. Brief service interruptions are possible. Customers do not need to change their equipment or settings.", startedAt: new Date(now + 12 * 3600000), updatedAt: ago(120) },
    ]).onConflictDoNothing();
    await tx.insert(activities).values([
      { id: "seed-activity-1", caseId: "CS-1036", kind: "resolved", content: "You resolved Aina’s connection issue", createdAt: ago(4) },
      { id: "seed-activity-2", caseId: "CS-1048", kind: "note", content: "New context added to Sarah’s case", createdAt: ago(8) },
      { id: "seed-activity-3", caseId: null, kind: "network", content: "Petaling Jaya network update", createdAt: ago(12) },
      { id: "seed-activity-4", caseId: "CS-1046", kind: "assigned", content: "Wei Jian’s case was assigned to you", createdAt: ago(24) },
    ]).onConflictDoNothing();
  });
}

export async function ensureSeed() {
  if (!seedPromise) seedPromise = seed().catch(error => { seedPromise = undefined; throw error; });
  await seedPromise;
}

export function serializeCase(row: typeof cases.$inferSelect): CaseItem {
  return { ...row, category: row.category as CaseItem["category"], priority: row.priority as CaseItem["priority"], status: row.status as CaseItem["status"], createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), resolvedAt: row.resolvedAt?.toISOString() ?? null };
}

export async function getWorkspace(): Promise<WorkspaceData> {
  await ensureSeed();
  const [caseRows, incidentRows, activityRows, bookmarks] = await Promise.all([
    db.select().from(cases).orderBy(desc(cases.updatedAt)),
    db.select().from(incidents).orderBy(incidents.startedAt),
    db.select().from(activities).orderBy(desc(activities.createdAt)).limit(30),
    db.select().from(savedPlaybooks),
  ]);
  return {
    cases: caseRows.map(serializeCase),
    incidents: incidentRows.map(row => ({ ...row, startedAt: row.startedAt.toISOString(), updatedAt: row.updatedAt.toISOString() })),
    activities: activityRows.map(row => ({ ...row, createdAt: row.createdAt.toISOString() })),
    savedPlaybooks: bookmarks.map(row => row.id),
  };
}

export async function getCase(id: string) {
  await ensureSeed();
  const [row] = await db.select().from(cases).where(eq(cases.id, id));
  if (!row) return null;
  const messages = await db.select().from(notes).where(eq(notes.caseId, id)).orderBy(desc(notes.createdAt));
  return { case: serializeCase(row), notes: messages.map(note => ({ ...note, createdAt: note.createdAt.toISOString() })) };
}
