import { useState, useMemo } from "react";
import { Download, TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatShortCurrency = (value: number) => {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}jt`;
  return formatCurrency(value);
};

export default function Laporan() {
  const [period, setPeriod] = useState("monthly");
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  
  const { monthlyData, expenseBreakdown, loading } = useDashboardStats();

  const currentMonthName = format(new Date(), "MMMM yyyy", { locale: localeId });

  // Calculate summary statistics from real data
  const summaryStats = useMemo(() => {
    if (monthlyData.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        totalProfit: 0,
        profitMargin: "0",
        incomeGrowth: "0",
        avgMonthlyProfit: 0,
      };
    }

    const totalIncome = monthlyData.reduce((sum, d) => sum + d.income, 0);
    const totalExpenses = monthlyData.reduce((sum, d) => sum + d.expenses, 0);
    const totalProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? ((totalProfit / totalIncome) * 100).toFixed(1) : "0";

    const currentMonthData = monthlyData[monthlyData.length - 1];
    const prevMonthData = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : null;
    
    const incomeGrowth = prevMonthData && prevMonthData.income > 0
      ? (((currentMonthData.income - prevMonthData.income) / prevMonthData.income) * 100).toFixed(1)
      : "0";

    const monthsWithData = monthlyData.filter(m => m.income > 0 || m.expenses > 0).length || 1;
    const avgMonthlyProfit = totalProfit / monthsWithData;

    return {
      totalIncome,
      totalExpenses,
      totalProfit,
      profitMargin,
      incomeGrowth,
      avgMonthlyProfit,
    };
  }, [monthlyData]);

  // Chart data with profit calculation
  const chartData = useMemo(() => {
    return monthlyData.map(d => ({
      ...d,
      profit: d.income - d.expenses,
    }));
  }, [monthlyData]);

  if (loading) {
    return (
      <MainLayout>
        <Header
          title="Laporan"
          subtitle="Ringkasan keuangan dan analisis bisnis"
        />
        <div className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header
        title="Laporan"
        subtitle="Ringkasan keuangan dan analisis bisnis"
      />

      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(currentYear)}>{currentYear}</SelectItem>
                <SelectItem value={String(currentYear - 1)}>{currentYear - 1}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pemasukan</p>
                <p className="mt-1 text-2xl font-bold text-success">{formatCurrency(summaryStats.totalIncome)}</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span>{summaryStats.incomeGrowth}% dari bulan lalu</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gaji & Biaya</p>
                <p className="mt-1 text-2xl font-bold text-destructive">{formatCurrency(summaryStats.totalExpenses)}</p>
                <p className="mt-2 text-sm text-muted-foreground">7 bulan terakhir</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Laba Bersih</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(summaryStats.totalProfit)}</p>
                <p className="mt-2 text-sm text-muted-foreground">Margin: {summaryStats.profitMargin}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata Bulanan</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(summaryStats.avgMonthlyProfit)}</p>
                <p className="mt-2 text-sm text-muted-foreground">Laba per bulan</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15">
                <FileText className="h-6 w-6 text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue vs Expenses Chart */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Pemasukan vs Pengeluaran</h3>
            {chartData.length > 0 && chartData.some(d => d.income > 0 || d.expenses > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(value) => formatShortCurrency(value)} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="income" name="Pemasukan" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Pengeluaran" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Belum ada data transaksi
              </div>
            )}
          </div>

          {/* Expense Breakdown */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Rincian Pengeluaran</h3>
            <p className="mb-4 text-sm text-muted-foreground">{currentMonthName}</p>
            {expenseBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {expenseBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                Belum ada data pengeluaran
              </div>
            )}
          </div>
        </div>

        {/* Profit Trend */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Trend Laba Bersih</h3>
          {chartData.length > 0 && chartData.some(d => d.income > 0 || d.expenses > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis tickFormatter={(value) => formatShortCurrency(value)} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Laba Bersih"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground">
              Belum ada data transaksi
            </div>
          )}
        </div>

        {/* Monthly Summary Table */}
        <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold">Ringkasan Bulanan</h3>
          </div>
          {chartData.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th className="text-right">Pemasukan</th>
                  <th className="text-right">Pengeluaran</th>
                  <th className="text-right">Laba Bersih</th>
                  <th className="text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((data) => {
                  const margin = data.income > 0 ? ((data.profit / data.income) * 100).toFixed(1) : "0";
                  return (
                    <tr key={`${data.month}-${data.year}`}>
                      <td className="font-medium">{data.month} {data.year}</td>
                      <td className="text-right text-success">{formatCurrency(data.income)}</td>
                      <td className="text-right text-destructive">{formatCurrency(data.expenses)}</td>
                      <td className="text-right font-semibold">{formatCurrency(data.profit)}</td>
                      <td className={cn("text-right font-medium", parseFloat(margin) > 70 ? "text-success" : data.income > 0 ? "text-warning" : "text-muted-foreground")}>
                        {margin}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-muted/50">
                <tr>
                  <td className="font-semibold">Total</td>
                  <td className="text-right font-bold text-success">{formatCurrency(summaryStats.totalIncome)}</td>
                  <td className="text-right font-bold text-destructive">{formatCurrency(summaryStats.totalExpenses)}</td>
                  <td className="text-right font-bold">{formatCurrency(summaryStats.totalProfit)}</td>
                  <td className="text-right font-bold">{summaryStats.profitMargin}%</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="px-6 py-12 text-center text-muted-foreground">
              Belum ada data transaksi
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
