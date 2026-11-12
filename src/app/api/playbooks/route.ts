import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { savedPlaybooks } from "@/db/schema";
import { playbooks } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!playbooks.some(p => p.id === body?.id) || typeof body?.saved !== "boolean") return NextResponse.json({ error: "Choose a valid playbook." }, { status: 400 });
    if (body.saved) await db.insert(savedPlaybooks).values({ id: body.id }).onConflictDoNothing();
    else await db.delete(savedPlaybooks).where(eq(savedPlaybooks.id, body.id));
    return NextResponse.json({ id: body.id, saved: body.saved });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    console.error("Bookmark update failed", error);
    return NextResponse.json({ error: "We couldn’t update this bookmark." }, { status: 500 });
  }
}
