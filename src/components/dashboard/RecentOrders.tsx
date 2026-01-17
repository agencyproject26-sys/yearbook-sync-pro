import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRecentOrders } from "@/hooks/useDashboardStats";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const statusConfig: Record<string, { label: string; className: string }> = {
  proses: { label: "Proses", className: "bg-info/15 text-info hover:bg-info/20" },
  desain: { label: "Desain", className: "bg-warning/15 text-warning hover:bg-warning/20" },
  cetak: { label: "Cetak", className: "bg-accent/15 text-accent hover:bg-accent/20" },
  selesai: { label: "Selesai", className: "bg-success/15 text-success hover:bg-success/20" },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function RecentOrders() {
  const { orders, loading } = useRecentOrders();

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-1 h-4 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="mt-1 h-4 w-20" />
                </div>
                <Skeleton className="h-6 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">Order Terbaru</h3>
          <p className="text-sm text-muted-foreground">Daftar order yang sedang berjalan</p>
        </div>
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground">Belum ada order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">Order Terbaru</h3>
        <p className="text-sm text-muted-foreground">Daftar order yang sedang berjalan</p>
      </div>
      <div className="divide-y divide-border">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.proses;
          const schoolName = order.customers?.name || "Unknown";
          const customerName = order.customers?.pic_name || "-";
          const formattedDate = format(parseISO(order.created_at), "d MMM yyyy", { locale: localeId });
          
          return (
            <div
              key={order.id}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-xs font-semibold text-primary">
                    {schoolName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{schoolName}</p>
                  <p className="text-sm text-muted-foreground">{customerName} • {order.order_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatCurrency(order.value)}</p>
                  <p className="text-sm text-muted-foreground">{formattedDate}</p>
                </div>
                <Badge className={cn("font-medium", status.className)}>
                  {status.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border px-6 py-3">
        <Link to="/order" className="text-sm font-medium text-primary hover:underline">
          Lihat Semua Order →
        </Link>
      </div>
    </div>
  );
}
