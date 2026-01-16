import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  customer: string;
  school: string;
  status: "proses" | "desain" | "cetak" | "selesai";
  value: string;
  date: string;
}

const statusConfig = {
  proses: { label: "Proses", className: "bg-info/15 text-info hover:bg-info/20" },
  desain: { label: "Desain", className: "bg-warning/15 text-warning hover:bg-warning/20" },
  cetak: { label: "Cetak", className: "bg-accent/15 text-accent hover:bg-accent/20" },
  selesai: { label: "Selesai", className: "bg-success/15 text-success hover:bg-success/20" },
};

const mockOrders: Order[] = [
  { id: "ORD-001", customer: "Bpk. Ahmad", school: "SMA Negeri 1 Jakarta", status: "desain", value: "Rp 45.000.000", date: "15 Jan 2026" },
  { id: "ORD-002", customer: "Ibu Sari", school: "SMP Islam Al-Azhar", status: "proses", value: "Rp 32.000.000", date: "14 Jan 2026" },
  { id: "ORD-003", customer: "Bpk. Budi", school: "SD Tarakanita", status: "cetak", value: "Rp 28.000.000", date: "12 Jan 2026" },
  { id: "ORD-004", customer: "Ibu Dewi", school: "SMA Gonzaga", status: "selesai", value: "Rp 52.000.000", date: "10 Jan 2026" },
];

export function RecentOrders() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">Order Terbaru</h3>
        <p className="text-sm text-muted-foreground">Daftar order yang sedang berjalan</p>
      </div>
      <div className="divide-y divide-border">
        {mockOrders.map((order) => {
          const status = statusConfig[order.status];
          return (
            <div
              key={order.id}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-xs font-semibold text-primary">
                    {order.school.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{order.school}</p>
                  <p className="text-sm text-muted-foreground">{order.customer} • {order.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-foreground">{order.value}</p>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
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
        <button className="text-sm font-medium text-primary hover:underline">
          Lihat Semua Order →
        </button>
      </div>
    </div>
  );
}
