import { NextResponse } from "next/server";
import { fail, ok } from "@/lib/api/response";
import { getSessionProfile } from "@/lib/auth/session";

export async function GET() {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json(fail("unauthenticated"), { status: 401 });
  }

  return NextResponse.json(ok(profile));
}
