import { NextResponse } from "next/server";
import { randomUUID, randomInt } from "node:crypto";
import { db } from "@/db";
import { cases, notes, activities } from "@/db/schema";
import { ensureSeed, serializeCase } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Please provide case details." }, { status: 400 });
    const read = (key: string, max: number) => typeof body[key] === "string" ? body[key].trim().slice(0, max) : "";
    const customerName = read("customerName", 100);
    const email = read("email", 150);
    const title = read("title", 160);
    const description = read("description", 5000);
    const category = read("category", 20);
    const priority = read("priority", 20);
    const channel = read("channel", 20);
    if (!customerName || !title || !description || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Add a customer name, valid email, issue, and description." }, { status: 400 });
    if (!["Broadband", "Mobile", "Billing", "Installation"].includes(category) || !["urgent", "high", "medium", "low"].includes(priority) || !["Chat", "Phone", "Email", "App"].includes(channel)) return NextResponse.json({ error: "Choose a valid service, priority, and channel." }, { status: 400 });
    await ensureSeed();
    const id = `CS-${randomInt(2000, 999999)}`;
    const created = await db.transaction(async tx => {
      const [row] = await tx.insert(cases).values({ id, customerName, email, title, description, category, priority, channel, location: read("location", 120) || "Location not provided", assignee: "Aisyah Rahman", plan: category === "Broadband" ? "Fibre 500" : "Connect Plus", avatarColor: ["peach", "blue", "lavender", "sage"][randomInt(0, 4)] }).returning();
      await tx.insert(notes).values({ id: randomUUID(), caseId: id, author: customerName, kind: channel.toLowerCase(), content: description });
      await tx.insert(activities).values({ id: randomUUID(), caseId: id, kind: "created", content: `You opened a case for ${customerName.split(" ")[0]}` });
      return row;
    });
    return NextResponse.json({ case: serializeCase(created) }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    console.error("Case creation failed", error);
    return NextResponse.json({ error: "We couldn’t create the case. Please try again." }, { status: 500 });
  }
}
