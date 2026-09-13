import { NextResponse } from "next/server";
import { fail, type ApiFailure } from "@/lib/api/response";
import type { ZodError } from "zod";

export function statusForAuthError(error: string): number {
  if (error === "unauthenticated") {
    return 401;
  }
  return 403;
}

export function jsonError(error: string, status: number) {
  return NextResponse.json(fail(error), { status });
}

export function fromApiFailure(result: ApiFailure) {
  return jsonError(result.error, statusForAuthError(result.error));
}

export function fromZodError(error: ZodError) {
  return jsonError(error.issues.map((issue) => issue.message).join("; "), 400);
}
