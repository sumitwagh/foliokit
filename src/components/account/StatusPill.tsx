import type { OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  paid: "bg-ok-bg text-ok",
  pending: "bg-warn-bg text-warn",
  failed: "bg-danger-bg text-danger",
  refunded: "bg-lilac text-plum",
  cancelled: "bg-paper text-muted",
};
const LABELS: Record<OrderStatus, string> = { paid: "Paid", pending: "Awaiting payment", failed: "Payment failed", refunded: "Refunded", cancelled: "Cancelled" };

export function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[13px] font-semibold ${STYLES[status]}`}>{LABELS[status]}</span>;
}
