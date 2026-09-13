import { NextResponse } from "next/server";
import { fail, ok } from "@/lib/api/response";
import { getListingForViewer } from "@/lib/listings/queries";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json(fail("invalid_listing_id"), { status: 400 });
  }

  const listing = await getListingForViewer(id);
  if (!listing) {
    return NextResponse.json(fail("listing_not_found"), { status: 404 });
  }

  return NextResponse.json(ok(listing));
}
