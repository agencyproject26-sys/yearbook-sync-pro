import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  type: "invoice_overdue" | "invoice_due_soon" | "payment_received" | "order_status";
  title: string;
  description: string;
  date: string;
  read: boolean;
  link?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const today = new Date();
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      const todayStr = today.toISOString().slice(0, 10);
      const threeDaysStr = threeDaysLater.toISOString().slice(0, 10);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

      const [invoicesRes, paymentsRes, ordersRes] = await Promise.all([
        supabase
          .from("invoices")
          .select("id, invoice_number, due_date, status, amount, customers(name)")
          .is("deleted_at", null)
          .neq("status", "paid")
          .lte("due_date", threeDaysStr),
        supabase
          .from("payments")
          .select("id, receipt_number, amount, payment_date, invoices(invoice_number, customers(name))")
          .is("deleted_at", null)
          .gte("payment_date", sevenDaysAgoStr)
          .order("payment_date", { ascending: false })
          .limit(10),
        supabase
          .from("orders")
          .select("id, order_number, status, updated_at, customers(name)")
          .is("deleted_at", null)
          .gte("updated_at", sevenDaysAgo.toISOString())
          .order("updated_at", { ascending: false })
          .limit(10),
      ]);

      const items: Notification[] = [];

      // Invoice overdue
      if (invoicesRes.data) {
        for (const inv of invoicesRes.data) {
          const isOverdue = inv.due_date < todayStr;
          const customerName = (inv.customers as any)?.name || "Unknown";
          items.push({
            id: `inv-${inv.id}`,
            type: isOverdue ? "invoice_overdue" : "invoice_due_soon",
            title: isOverdue ? "Invoice Jatuh Tempo" : "Invoice Segera Jatuh Tempo",
            description: `${inv.invoice_number} - ${customerName}`,
            date: inv.due_date,
            read: false,
            link: "/invoice",
          });
        }
      }

      // Recent payments
      if (paymentsRes.data) {
        for (const pay of paymentsRes.data) {
          const invoiceInfo = pay.invoices as any;
          const customerName = invoiceInfo?.customers?.name || "Unknown";
          items.push({
            id: `pay-${pay.id}`,
            type: "payment_received",
            title: "Pembayaran Diterima",
            description: `${pay.receipt_number} - ${customerName} - Rp ${Number(pay.amount).toLocaleString("id-ID")}`,
            date: pay.payment_date,
            read: false,
            link: "/pembayaran",
          });
        }
      }

      // Order status
      if (ordersRes.data) {
        const statusLabels: Record<string, string> = {
          proses: "Proses",
          desain: "Desain",
          cetak: "Cetak",
          selesai: "Selesai",
        };
        for (const ord of ordersRes.data) {
          const customerName = (ord.customers as any)?.name || "Unknown";
          items.push({
            id: `ord-${ord.id}`,
            type: "order_status",
            title: `Order ${statusLabels[ord.status] || ord.status}`,
            description: `${ord.order_number} - ${customerName}`,
            date: ord.updated_at,
            read: false,
            link: "/order",
          });
        }
      }

      // Sort by date descending
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Load read state from localStorage
      const readIds = JSON.parse(localStorage.getItem("read_notifications") || "[]");
      for (const item of items) {
        if (readIds.includes(item.id)) item.read = true;
      }

      setNotifications(items);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const readIds = JSON.parse(localStorage.getItem("read_notifications") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("read_notifications", JSON.stringify(readIds));
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    localStorage.setItem("read_notifications", JSON.stringify(allIds));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
};
