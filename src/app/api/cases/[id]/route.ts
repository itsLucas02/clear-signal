import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cases, activities, notes } from "@/db/schema";
import { getCase, serializeCase } from "@/lib/store";
import { statusLabels, type CaseStatus } from "@/lib/types";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const result = await getCase(id);
    return result ? NextResponse.json(result) : NextResponse.json({ error: "Case not found." }, { status: 404 });
  } catch (error) {
    console.error("Case load failed", error);
    return NextResponse.json({ error: "We couldn’t load this case." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid update." }, { status: 400 });
    const result = await getCase(id);
    if (!result) return NextResponse.json({ error: "Case not found." }, { status: 404 });
    const updates: Partial<typeof cases.$inferInsert> = { updatedAt: new Date() };
    if (body.status !== undefined) {
      if (!["open", "in_progress", "waiting", "resolved"].includes(body.status)) return NextResponse.json({ error: "Invalid case status." }, { status: 400 });
      updates.status = body.status;
      updates.resolvedAt = body.status === "resolved" ? new Date() : null;
    }
    if (body.priority !== undefined) {
      if (!["urgent", "high", "medium", "low"].includes(body.priority)) return NextResponse.json({ error: "Invalid priority." }, { status: 400 });
      updates.priority = body.priority;
    }
    if (body.assignee !== undefined) {
      if (!["Aisyah Rahman", "Faizal Rosli", "Nurul Huda"].includes(body.assignee)) return NextResponse.json({ error: "Invalid assignee." }, { status: 400 });
      updates.assignee = body.assignee;
    }
    if (body.completedSteps !== undefined) {
      if (!Array.isArray(body.completedSteps) || body.completedSteps.length > 5 || !body.completedSteps.every((s: unknown) => typeof s === "string" && /^[0-4]$/.test(s))) return NextResponse.json({ error: "Invalid checklist steps." }, { status: 400 });
      updates.completedSteps = [...new Set<string>(body.completedSteps)];
    }
    if (Object.keys(updates).length === 1) return NextResponse.json({ error: "No changes provided." }, { status: 400 });
    const updated = await db.transaction(async tx => {
      const [row] = await tx.update(cases).set(updates).where(eq(cases.id, id)).returning();
      if (updates.status && updates.status !== result.case.status) {
        const isResolved = updates.status === "resolved";
        const content = isResolved ? `You resolved ${row.customerName.split(" ")[0]}’s case` : `${row.id} moved to ${statusLabels[updates.status as CaseStatus].toLowerCase()}`;
        await tx.insert(activities).values({ id: randomUUID(), caseId: id, kind: isResolved ? "resolved" : "updated", content });
        await tx.insert(notes).values({ id: randomUUID(), caseId: id, author: "Aisyah Rahman", kind: "system", content: `Status changed from ${statusLabels[result.case.status]} to ${statusLabels[updates.status as CaseStatus]}.` });
      }
      if (updates.assignee && updates.assignee !== result.case.assignee) await tx.insert(activities).values({ id: randomUUID(), caseId: id, kind: "assigned", content: `${id} assigned to ${updates.assignee}` });
      return row;
    });
    return NextResponse.json({ case: serializeCase(updated) });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    console.error("Case update failed", error);
    return NextResponse.json({ error: "We couldn’t save your changes. Please try again." }, { status: 500 });
  }
}
