import { useState, useEffect } from "react";
import { Users, Package, FileText, Wallet, AlertCircle, Calendar, SlidersHorizontal } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { UpcomingSchedule } from "@/components/dashboard/UpcomingSchedule";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const WIDGET_KEYS = [
  { key: "totalPelanggan", label: "Total Pelanggan" },
  { key: "orderAktif", label: "Order Aktif" },
  { key: "jadwalTerdekat", label: "Jadwal Terdekat" },
  { key: "invoiceBelumDibayar", label: "Invoice Belum Dibayar" },
  { key: "totalPemasukan", label: "Total Pemasukan" },
  { key: "totalGaji", label: "Total Gaji" },
  { key: "recentOrders", label: "Order Terbaru" },
  { key: "upcomingSchedule", label: "Jadwal Mendatang" },
  { key: "miniCalendar", label: "Mini Kalender" },
  { key: "quickStats", label: "Ringkasan Keuangan" },
] as const;

type WidgetKey = typeof WIDGET_KEYS[number]["key"];

const DEFAULT_VISIBILITY: Record<WidgetKey, boolean> = Object.fromEntries(
  WIDGET_KEYS.map(w => [w.key, true])
) as Record<WidgetKey, boolean>;

const STORAGE_KEY = "dashboard-widget-visibility";

const formatShortCurrency = (value: number) => {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `Rp ${Math.round(value / 1000000)}jt`;
  if (value >= 1000) return `Rp ${Math.round(value / 1000)}rb`;
  return `Rp ${value}`;
};

export default function Dashboard() {
  const { stats, loading } = useDashboardStats();
  const { user } = useAuth();
  const currentMonth = format(new Date(), "MMMM yyyy", { locale: localeId });

  const [visibility, setVisibility] = useState<Record<WidgetKey, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_VISIBILITY, ...JSON.parse(saved) } : DEFAULT_VISIBILITY;
    } catch {
      return DEFAULT_VISIBILITY;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
  }, [visibility]);

  const toggle = (key: WidgetKey) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const show = (key: WidgetKey) => visibility[key];

  const statCards = [
    { key: "totalPelanggan" as WidgetKey, title: "Total Pelanggan", value: loading ? "-" : stats.totalCustomers, subtitle: "dari bulan lalu", icon: Users, variant: "primary" as const, trend: stats.customerGrowth !== 0 ? { value: Math.abs(stats.customerGrowth), isPositive: stats.customerGrowth > 0 } : undefined },
    { key: "orderAktif" as WidgetKey, title: "Order Aktif", value: loading ? "-" : stats.activeOrders, subtitle: "sedang berjalan", icon: Package, variant: "info" as const },
    { key: "jadwalTerdekat" as WidgetKey, title: "Jadwal Terdekat", value: loading ? "-" : stats.upcomingSchedules, subtitle: "minggu ini", icon: Calendar, variant: "success" as const },
    { key: "invoiceBelumDibayar" as WidgetKey, title: "Invoice Belum Dibayar", value: loading ? "-" : stats.unpaidInvoices, subtitle: "menunggu", icon: AlertCircle, variant: "warning" as const },
    { key: "totalPemasukan" as WidgetKey, title: "Total Pemasukan", value: loading ? "-" : formatShortCurrency(stats.totalIncome), subtitle: currentMonth, icon: Wallet, variant: "success" as const, trend: stats.incomeGrowth !== 0 ? { value: Math.abs(stats.incomeGrowth), isPositive: stats.incomeGrowth > 0 } : undefined },
    { key: "totalGaji" as WidgetKey, title: "Total Gaji", value: loading ? "-" : formatShortCurrency(stats.totalSalaries), subtitle: currentMonth, icon: FileText, variant: "default" as const },
  ];

  const visibleStatCards = statCards.filter(c => show(c.key));

  return (
    <MainLayout>
      <Header 
        title="Dashboard" 
        subtitle={`Selamat datang kembali${user?.email ? `, ${user.email.split('@')[0]}` : ''}!`}
      />

      <div className="p-6">
        {/* Filter Toggle */}
        <div className="mb-4 flex justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Tampilkan Widget</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="end">
              <p className="mb-3 text-sm font-semibold text-foreground">Pilih Widget</p>
              <div className="space-y-2.5">
                {WIDGET_KEYS.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{label}</span>
                    <Switch
                      checked={visibility[key]}
                      onCheckedChange={() => toggle(key)}
                    />
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Stats Grid */}
        {visibleStatCards.length > 0 && (
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 stagger-children">
            {visibleStatCards.map(card => (
              <StatCard
                key={card.key}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={card.icon}
                variant={card.variant}
                trend={card.trend}
              />
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {show("recentOrders") && <RecentOrders />}
            {show("upcomingSchedule") && <UpcomingSchedule />}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {show("miniCalendar") && <MiniCalendar />}
            {show("quickStats") && (
              <QuickStats
                income={stats.totalIncome}
                expenses={stats.totalSalaries}
                profit={stats.totalIncome - stats.totalSalaries}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
