import { z } from "zod";

/** Client + server validation for guest checkout; mirrors the checks inside shop3d_place_order. */
export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên").max(100),
  phone: z.string().trim().regex(/^0\d{9}$/, "Số điện thoại gồm 10 số, bắt đầu bằng 0"),
  email: z.union([z.literal(""), z.email("Email không hợp lệ").max(200)]),
  address: z.string().trim().min(5, "Vui lòng nhập địa chỉ nhận hàng").max(300),
  note: z.string().trim().max(500),
  payment_method: z.enum(["cod", "bank_transfer"]),
  items: z
    .array(z.object({ product_id: z.uuid(), quantity: z.number().int().min(1).max(50) }))
    .min(1, "Giỏ hàng trống")
    .max(50),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
