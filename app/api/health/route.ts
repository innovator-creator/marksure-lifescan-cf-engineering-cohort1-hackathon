import { NextResponse } from "next/server";

const REQUIRED_SUPABASE_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export async function GET() {
  const missing = REQUIRED_SUPABASE_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    return NextResponse.json(
      {
        supabase: "error",
        message: `Missing environment variables: ${missing.join(", ")}`,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ supabase: "ok" });
}
