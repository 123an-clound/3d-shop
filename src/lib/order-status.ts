import type { OrderStatus } from "./types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "bg-hot/15 text-hot",
  confirmed: "bg-accent/15 text-accent",
  shipping: "bg-violet-400/15 text-violet-300",
  completed: "bg-success/15 text-success",
  cancelled: "bg-muted/15 text-muted",
};
