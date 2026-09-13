import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { listPublicOpportunities } from "@/lib/listings/queries";

export async function GET() {
  const listings = await listPublicOpportunities();
  return NextResponse.json(ok(listings));
}
