import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface QuickStatsProps {
  income: number;
  expenses: number;
  profit: number;
  loading?: boolean;
}

export function QuickStats({ income, expenses, profit, loading }: QuickStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const currentMonth = format(new Date(), "MMMM yyyy", { locale: localeId });

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
        <div className="h-6 w-40 bg-muted rounded mb-4" />
        <div className="h-4 w-32 bg-muted rounded mb-6" />
        <div className="space-y-4">
          <div className="h-20 bg-muted rounded-lg" />
          <div className="h-20 bg-muted rounded-lg" />
          <div className="h-12 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Ringkasan Keuangan</h3>
      <p className="mb-6 text-sm text-muted-foreground">Periode: {currentMonth}</p>

      <div className="space-y-4">
        {/* Total Pemasukan */}
        <div className="flex items-center justify-between rounded-lg bg-success/10 p-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Pemasukan</p>
            <p className="text-xl font-bold text-success">{formatCurrency(income)}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Gaji & Biaya</p>
            <p className="text-xl font-bold text-destructive">{formatCurrency(expenses)}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Laba Bersih</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(profit)}</p>
          </div>
        </div>
      </div>

      <Link to="/laporan" className="mt-4 block w-full text-center text-sm font-medium text-primary hover:underline">
        Lihat Laporan Lengkap →
      </Link>
    </div>
  );
}
