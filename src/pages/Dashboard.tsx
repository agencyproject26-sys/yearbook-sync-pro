import { Users, Package, FileText, Wallet, AlertCircle, Calendar } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { UpcomingSchedule } from "@/components/dashboard/UpcomingSchedule";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";
import { QuickStats } from "@/components/dashboard/QuickStats";

export default function Dashboard() {
  return (
    <MainLayout>
      <Header 
        title="Dashboard" 
        subtitle="Selamat datang kembali, Sofyan!"
      />

      <div className="p-6">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 stagger-children">
          <StatCard
            title="Total Pelanggan"
            value={124}
            subtitle="dari bulan lalu"
            icon={Users}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Order Aktif"
            value={18}
            subtitle="sedang berjalan"
            icon={Package}
            variant="info"
          />
          <StatCard
            title="Jadwal Terdekat"
            value={5}
            subtitle="minggu ini"
            icon={Calendar}
            variant="success"
          />
          <StatCard
            title="Invoice Belum Dibayar"
            value={8}
            subtitle="menunggu"
            icon={AlertCircle}
            variant="warning"
          />
          <StatCard
            title="Total Pemasukan"
            value="Rp 245M"
            subtitle="Januari 2026"
            icon={Wallet}
            variant="success"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Gaji"
            value="Rp 48M"
            subtitle="Januari 2026"
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
              income={245000000}
              expenses={48000000}
              profit={197000000}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
