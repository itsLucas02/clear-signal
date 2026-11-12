import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getWorkspace());
  } catch (error) {
    console.error("Workspace load failed", error);
    return NextResponse.json({ error: "We couldn’t load your workspace. Please try again." }, { status: 500 });
  }
}
