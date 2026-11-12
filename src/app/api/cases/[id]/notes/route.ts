import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cases, notes, activities } from "@/db/schema";
import { getCase } from "@/lib/store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (typeof body?.content !== "string" || !body.content.trim() || body.content.length > 5000) return NextResponse.json({ error: "Write a note between 1 and 5,000 characters." }, { status: 400 });
    const result = await getCase(id);
    if (!result) return NextResponse.json({ error: "Case not found." }, { status: 404 });
    const note = await db.transaction(async tx => {
      const [row] = await tx.insert(notes).values({ id: randomUUID(), caseId: id, author: "Aisyah Rahman", kind: "note", content: body.content.trim() }).returning();
      await tx.update(cases).set({ updatedAt: new Date() }).where(eq(cases.id, id));
      await tx.insert(activities).values({ id: randomUUID(), caseId: id, kind: "note", content: `You added context to ${result.case.customerName.split(" ")[0]}’s case` });
      return row;
    });
    return NextResponse.json({ note: { ...note, createdAt: note.createdAt.toISOString() } }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    console.error("Note creation failed", error);
    return NextResponse.json({ error: "We couldn’t save your note. Please try again." }, { status: 500 });
  }
}
