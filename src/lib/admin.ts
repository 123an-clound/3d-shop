import "server-only";
import { createSupabaseServer } from "./supabase/server";

/** Returns an RLS-bound client only if the caller is a confirmed admin. Use at the top of every admin action. */
export async function requireAdmin() {
  const supabase = await createSupabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) throw new Error("UNAUTHENTICATED");
  const { data: isAdmin, error } = await supabase.rpc("shop3d_is_admin");
  if (error || !isAdmin) throw new Error("FORBIDDEN");
  return { supabase, email: (claims.claims.email as string | undefined) ?? "" };
}
