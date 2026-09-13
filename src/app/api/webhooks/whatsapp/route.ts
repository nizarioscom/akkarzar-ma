import { NextResponse } from "next/server";
import { ok, fail } from "@/lib/api/response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(fail("forbidden"), { status: 403 });
}

export async function POST(request: Request) {
  await request.json().catch(() => null);
  return NextResponse.json(ok({ received: true }));
}
