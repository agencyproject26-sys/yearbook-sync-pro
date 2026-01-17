import { Users, Package, FileText, Wallet, AlertCircle, Calendar } from "lucide-react";
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

  return (
    <MainLayout>
      <Header 
        title="Dashboard" 
        subtitle={`Selamat datang kembali${user?.email ? `, ${user.email.split('@')[0]}` : ''}!`}
      />

      <div className="p-6">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 stagger-children">
          <StatCard
            title="Total Pelanggan"
            value={loading ? "-" : stats.totalCustomers}
            subtitle="dari bulan lalu"
            icon={Users}
            variant="primary"
            trend={stats.customerGrowth !== 0 ? { value: Math.abs(stats.customerGrowth), isPositive: stats.customerGrowth > 0 } : undefined}
          />
          <StatCard
            title="Order Aktif"
            value={loading ? "-" : stats.activeOrders}
            subtitle="sedang berjalan"
            icon={Package}
            variant="info"
          />
          <StatCard
            title="Jadwal Terdekat"
            value={loading ? "-" : stats.upcomingSchedules}
            subtitle="minggu ini"
            icon={Calendar}
            variant="success"
          />
          <StatCard
            title="Invoice Belum Dibayar"
            value={loading ? "-" : stats.unpaidInvoices}
            subtitle="menunggu"
            icon={AlertCircle}
            variant="warning"
          />
          <StatCard
            title="Total Pemasukan"
            value={loading ? "-" : formatShortCurrency(stats.totalIncome)}
            subtitle={currentMonth}
            icon={Wallet}
            variant="success"
            trend={stats.incomeGrowth !== 0 ? { value: Math.abs(stats.incomeGrowth), isPositive: stats.incomeGrowth > 0 } : undefined}
          />
          <StatCard
            title="Total Gaji"
            value={loading ? "-" : formatShortCurrency(stats.totalSalaries)}
            subtitle={currentMonth}
            icon={FileText}
            variant="default"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - 2/3 width */}
          <div className="space-y-6 lg:col-span-2">
            <RecentOrders />
            <UpcomingSchedule />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <MiniCalendar />
            <QuickStats
              income={stats.totalIncome}
              expenses={stats.totalSalaries}
              profit={stats.totalIncome - stats.totalSalaries}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
