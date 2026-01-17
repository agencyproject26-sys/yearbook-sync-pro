import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, parseISO, isAfter, isBefore } from "date-fns";

export interface DashboardStats {
  totalCustomers: number;
  activeOrders: number;
  upcomingSchedules: number;
  unpaidInvoices: number;
  totalIncome: number;
  totalSalaries: number;
  customerGrowth: number;
  incomeGrowth: number;
}

export interface MonthlyData {
  month: string;
  monthNum: number;
  year: number;
  income: number;
  expenses: number;
}

export interface ExpenseBreakdown {
  name: string;
  value: number;
  color: string;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeOrders: 0,
    upcomingSchedules: 0,
    unpaidInvoices: 0,
    totalIncome: 0,
    totalSalaries: 0,
    customerGrowth: 0,
    incomeGrowth: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date();
  const currentMonthStart = startOfMonth(currentMonth);
  const currentMonthEnd = endOfMonth(currentMonth);
  const currentWeekStart = startOfWeek(currentMonth, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(currentMonth, { weekStartsOn: 1 });

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        customersRes,
        ordersRes,
        invoicesRes,
        paymentsRes,
        salariesRes,
        eventsRes,
      ] = await Promise.all([
        supabase.from("customers").select("id, status, created_at"),
        supabase.from("orders").select("id, status, value, created_at, customers(name, pic_name)").order("created_at", { ascending: false }),
        supabase.from("invoices").select("id, status, amount, payment_terms, created_at"),
        supabase.from("payments").select("id, amount, payment_date, created_at"),
        supabase.from("salaries").select("id, amount, category, payment_date, created_at"),
        supabase.from("calendar_events").select("id, date, time").gte("date", format(currentWeekStart, "yyyy-MM-dd")).lte("date", format(currentWeekEnd, "yyyy-MM-dd")),
      ]);

      const customers = customersRes.data || [];
      const orders = ordersRes.data || [];
      const invoices = invoicesRes.data || [];
      const payments = paymentsRes.data || [];
      const salaries = salariesRes.data || [];
      const events = eventsRes.data || [];

      // Calculate stats
      const totalCustomers = customers.length;
      const activeOrders = orders.filter(o => o.status !== "selesai").length;
      const upcomingSchedules = events.length;
      const unpaidInvoices = invoices.filter(i => i.status !== "paid").length;

      // Filter payments for current month
      const currentMonthPayments = payments.filter(p => {
        const paymentDate = parseISO(p.payment_date);
        return !isBefore(paymentDate, currentMonthStart) && !isAfter(paymentDate, currentMonthEnd);
      });
      const totalIncome = currentMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      // Filter salaries for current month
      const currentMonthSalaries = salaries.filter(s => {
        const salaryDate = parseISO(s.payment_date);
        return !isBefore(salaryDate, currentMonthStart) && !isAfter(salaryDate, currentMonthEnd);
      });
      const totalSalaries = currentMonthSalaries.reduce((sum, s) => sum + Number(s.amount), 0);

      // Calculate previous month data for growth
      const prevMonthStart = startOfMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
      const prevMonthEnd = endOfMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

      const prevMonthCustomers = customers.filter(c => {
        const createdAt = parseISO(c.created_at);
        return isBefore(createdAt, currentMonthStart);
      }).length;

      const prevMonthPayments = payments.filter(p => {
        const paymentDate = parseISO(p.payment_date);
        return !isBefore(paymentDate, prevMonthStart) && !isAfter(paymentDate, prevMonthEnd);
      });
      const prevMonthIncome = prevMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      const customerGrowth = prevMonthCustomers > 0
        ? Math.round(((totalCustomers - prevMonthCustomers) / prevMonthCustomers) * 100)
        : 0;
      
      const incomeGrowth = prevMonthIncome > 0
        ? Math.round(((totalIncome - prevMonthIncome) / prevMonthIncome) * 100)
        : 0;

      setStats({
        totalCustomers,
        activeOrders,
        upcomingSchedules,
        unpaidInvoices,
        totalIncome,
        totalSalaries,
        customerGrowth,
        incomeGrowth,
      });

      // Calculate monthly data for last 6 months + current month
      const monthlyStats: MonthlyData[] = [];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
      
      for (let i = 6; i >= 0; i--) {
        const targetMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i);
        const monthStart = startOfMonth(targetMonth);
        const monthEnd = endOfMonth(targetMonth);

        const monthIncome = payments.filter(p => {
          const paymentDate = parseISO(p.payment_date);
          return !isBefore(paymentDate, monthStart) && !isAfter(paymentDate, monthEnd);
        }).reduce((sum, p) => sum + Number(p.amount), 0);

        const monthExpenses = salaries.filter(s => {
          const salaryDate = parseISO(s.payment_date);
          return !isBefore(salaryDate, monthStart) && !isAfter(salaryDate, monthEnd);
        }).reduce((sum, s) => sum + Number(s.amount), 0);

        monthlyStats.push({
          month: monthNames[targetMonth.getMonth()],
          monthNum: targetMonth.getMonth() + 1,
          year: targetMonth.getFullYear(),
          income: monthIncome,
          expenses: monthExpenses,
        });
      }

      setMonthlyData(monthlyStats);

      // Calculate expense breakdown for current month
      const categoryColors: Record<string, string> = {
        photographer: "hsl(160, 84%, 39%)",
        design: "hsl(38, 92%, 50%)",
        print: "hsl(199, 89%, 48%)",
        other: "hsl(0, 72%, 51%)",
      };

      const categoryNames: Record<string, string> = {
        photographer: "Photographer",
        design: "Design",
        print: "Percetakan",
        other: "Lainnya",
      };

      const breakdown: Record<string, number> = {
        photographer: 0,
        design: 0,
        print: 0,
        other: 0,
      };

      currentMonthSalaries.forEach(s => {
        const cat = s.category as string;
        if (breakdown[cat] !== undefined) {
          breakdown[cat] += Number(s.amount);
        } else {
          breakdown.other += Number(s.amount);
        }
      });

      const expenseData: ExpenseBreakdown[] = Object.entries(breakdown)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => ({
          name: categoryNames[key] || key,
          value,
          color: categoryColors[key] || "hsl(0, 0%, 50%)",
        }));

      setExpenseBreakdown(expenseData);

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    monthlyData,
    expenseBreakdown,
    loading,
    refetch: fetchStats,
  };
};

export const useRecentOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, customers(name, pic_name)`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, refetch: fetchOrders };
};
