"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { CATALOG_TAG } from "@/lib/data";
import { categorySchema, productSchema, settingsSchemas } from "@/lib/admin-schemas";
import type { OrderStatus, SettingsKey } from "@/lib/types";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

/** Maps Postgres/auth errors to admin-facing messages without leaking internals. */
function fail(error: unknown): { ok: false; error: string } {
  const message = error instanceof Error ? error.message : String((error as { message?: string })?.message ?? error);
  const code = (error as { code?: string })?.code;
  if (message === "UNAUTHENTICATED" || message === "FORBIDDEN") return { ok: false, error: "Bạn không có quyền thực hiện thao tác này." };
  if (code === "23505") return { ok: false, error: "Slug đã tồn tại, vui lòng chọn slug khác." };
  if (message.includes("INVALID_TRANSITION")) return { ok: false, error: "Đơn đã hoàn tất/hủy, không thể đổi trạng thái." };
  console.error("admin action failed", error);
  return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
}

function invalid(error: z.ZodError): { ok: false; error: string; fieldErrors: Record<string, string[] | undefined> } {
  return { ok: false, error: "Dữ liệu chưa hợp lệ.", fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[] | undefined> };
}

/* ---------------- Products ---------------- */

export async function saveProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const { supabase } = await requireAdmin();
    const { id, ...row } = parsed.data;
    const query = id
      ? supabase.from("shop3d_products").update(row).eq("id", id).select("id").single()
      : supabase.from("shop3d_products").insert(row).select("id").single();
    const { data, error } = await query;
    if (error) return fail(error);
    updateTag(CATALOG_TAG);
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "ID không hợp lệ" };
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("shop3d_products").delete().eq("id", id);
    if (error) return fail(error);
    updateTag(CATALOG_TAG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function toggleProductFlag(id: string, field: "is_published" | "is_featured", value: boolean): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success || !["is_published", "is_featured"].includes(field)) return { ok: false, error: "Dữ liệu không hợp lệ" };
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("shop3d_products").update({ [field]: Boolean(value) }).eq("id", id);
    if (error) return fail(error);
    updateTag(CATALOG_TAG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- Categories ---------------- */

export async function saveCategory(input: unknown): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const { supabase } = await requireAdmin();
    const { id, ...row } = parsed.data;
    const { error } = id
      ? await supabase.from("shop3d_categories").update(row).eq("id", id)
      : await supabase.from("shop3d_categories").insert(row);
    if (error) return fail(error);
    updateTag(CATALOG_TAG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "ID không hợp lệ" };
  try {
    const { supabase } = await requireAdmin();
    // Products keep existing; their category_id becomes null (FK on delete set null).
    const { error } = await supabase.from("shop3d_categories").delete().eq("id", id);
    if (error) return fail(error);
    updateTag(CATALOG_TAG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- Settings ---------------- */

export async function saveSettings(key: SettingsKey, value: unknown): Promise<ActionResult> {
  if (!Object.hasOwn(settingsSchemas, key)) return { ok: false, error: "Khóa cấu hình không hợp lệ" };
  const parsed = settingsSchemas[key].safeParse(value);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("shop3d_settings").upsert({ key, value: parsed.data });
    if (error) return fail(error);
    updateTag(CATALOG_TAG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- Orders ---------------- */

const ORDER_STATUSES = ["pending", "confirmed", "shipping", "completed", "cancelled"] as const;

export async function updateOrder(id: string, status: OrderStatus, isPaid: boolean): Promise<ActionResult> {
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(ORDER_STATUSES), isPaid: z.boolean() })
    .safeParse({ id, status, isPaid });
  if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ" };
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc("shop3d_admin_update_order", {
      p_order_id: parsed.data.id,
      p_status: parsed.data.status,
      p_is_paid: parsed.data.isPaid,
    });
    if (error) return fail(error);
    // Cancelling restores stock, which the storefront shows.
    if (parsed.data.status === "cancelled") updateTag(CATALOG_TAG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
