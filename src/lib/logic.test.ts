import { describe, expect, it } from "vitest";
import { filterProducts, parseCatalogQuery } from "./catalog";
import { discountPercent, normalizeText, slugify } from "./format";
import { calcShippingFee } from "./shipping";
import { safeHref } from "./url";
import { checkoutSchema } from "./order-schema";
import type { ProductWithCategory } from "./types";

const p = (over: Partial<ProductWithCategory>): ProductWithCategory => ({
  id: crypto.randomUUID(), slug: "x", name: "X", category_id: null, short_description: "", description: "",
  price: 100, compare_at_price: null, stock: 1, images: [], specs: [], is_published: true, is_featured: false,
  sold_count: 0, created_at: "2026-01-01", updated_at: "2026-01-01", category: null, ...over,
});

describe("catalog", () => {
  const items = [
    p({ name: "Rồng khớp động", price: 189000, category: { slug: "mo-hinh", name: "Mô hình" }, created_at: "2026-01-02", sold_count: 5 }),
    p({ name: "Máy in 3D Prusa", price: 15900000, category: { slug: "may-in", name: "Máy in" }, created_at: "2026-01-03" }),
    p({ name: "Đầu phun", price: 159000, stock: 0, created_at: "2026-01-01", sold_count: 9 }),
  ];

  it("searches without diacritics", () => {
    expect(filterProducts(items, { q: "rong" }).map((x) => x.name)).toEqual(["Rồng khớp động"]);
    expect(filterProducts(items, { q: "dau phun" })).toHaveLength(1);
  });
  it("filters by category, price and stock", () => {
    expect(filterProducts(items, { category: "may-in" })).toHaveLength(1);
    expect(filterProducts(items, { min: 160000, max: 200000 })).toHaveLength(1);
    expect(filterProducts(items, { inStock: true })).toHaveLength(2);
  });
  it("sorts", () => {
    expect(filterProducts(items, { sort: "gia-tang" })[0].name).toBe("Đầu phun");
    expect(filterProducts(items, { sort: "ban-chay" })[0].name).toBe("Đầu phun");
    expect(filterProducts(items, {})[0].name).toBe("Máy in 3D Prusa");
  });
  it("parses Vietnamese query params and ignores junk", () => {
    expect(parseCatalogQuery({ "danh-muc": "may-in", "gia-tu": "abc", "gia-den": "500", "con-hang": "1" })).toMatchObject({
      category: "may-in", min: undefined, max: 500, inStock: true,
    });
  });
});

describe("format & money", () => {
  it("normalizes and slugifies Vietnamese", () => {
    expect(normalizeText("Đồ Chơi IN 3D")).toBe("do choi in 3d");
    expect(slugify("Máy in 3D — Prusa i3!")).toBe("may-in-3d-prusa-i3");
  });
  it("computes discount and shipping", () => {
    expect(discountPercent(75, 100)).toBe(25);
    expect(discountPercent(100, null)).toBe(0);
    const ship = { flat_fee: 30000, free_threshold: 1000000 };
    expect(calcShippingFee(0, ship)).toBe(0);
    expect(calcShippingFee(999999, ship)).toBe(30000);
    expect(calcShippingFee(1000000, ship)).toBe(0);
  });
});

describe("security helpers", () => {
  it("only allows relative or http(s) links", () => {
    expect(safeHref("/san-pham")).toBe("/san-pham");
    expect(safeHref("javascript:alert(1)")).toBe("/");
    expect(safeHref("//evil.com")).toBe("/");
    expect(safeHref("https://zalo.me/1")).toBe("https://zalo.me/1");
  });
  it("validates checkout input", () => {
    const base = { name: "An", phone: "0901234567", email: "", address: "12 Lê Lợi, Q1", note: "", payment_method: "cod", items: [{ product_id: crypto.randomUUID(), quantity: 1 }] };
    expect(checkoutSchema.safeParse(base).success).toBe(true);
    expect(checkoutSchema.safeParse({ ...base, phone: "12345" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, items: [] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, items: [{ product_id: "x", quantity: 1 }] }).success).toBe(false);
  });
});
