import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DeletedItem {
  id: string;
  type: "customer" | "order" | "invoice" | "payment" | "calendar_event" | "salary";
  name: string;
  deleted_at: string;
  data: any;
}

export const useRecycleBin = () => {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      const items: DeletedItem[] = [];

      // Fetch deleted customers
      const { data: customers } = await supabase
        .from("customers")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (customers) {
        items.push(...customers.map(c => ({
          id: c.id,
          type: "customer" as const,
          name: c.name,
          deleted_at: c.deleted_at,
          data: c
        })));
      }

      // Fetch deleted orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*, customers(name)")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (orders) {
        items.push(...orders.map(o => ({
          id: o.id,
          type: "order" as const,
          name: `${o.order_number} - ${o.customers?.name || 'Unknown'}`,
          deleted_at: o.deleted_at,
          data: o
        })));
      }

      // Fetch deleted invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select("*, customers(name)")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (invoices) {
        items.push(...invoices.map(i => ({
          id: i.id,
          type: "invoice" as const,
          name: `${i.invoice_number} - ${i.customers?.name || 'Unknown'}`,
          deleted_at: i.deleted_at,
          data: i
        })));
      }

      // Fetch deleted payments
      const { data: payments } = await supabase
        .from("payments")
        .select("*, invoices(invoice_number)")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (payments) {
        items.push(...payments.map(p => ({
          id: p.id,
          type: "payment" as const,
          name: `${p.receipt_number} - ${p.invoices?.invoice_number || 'Unknown'}`,
          deleted_at: p.deleted_at,
          data: p
        })));
      }

      // Fetch deleted calendar events
      const { data: events } = await supabase
        .from("calendar_events")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (events) {
        items.push(...events.map(e => ({
          id: e.id,
          type: "calendar_event" as const,
          name: e.title,
          deleted_at: e.deleted_at,
          data: e
        })));
      }

      // Fetch deleted salaries
      const { data: salaries } = await supabase
        .from("salaries")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (salaries) {
        items.push(...salaries.map(s => ({
          id: s.id,
          type: "salary" as const,
          name: `${s.name} - Rp ${s.amount.toLocaleString('id-ID')}`,
          deleted_at: s.deleted_at,
          data: s
        })));
      }

      // Sort all items by deleted_at
      items.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());
      setDeletedItems(items);
    } catch {
      toast({
        title: "Error",
        description: "Gagal memuat data recycle bin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (item: DeletedItem) => {
    try {
      let error = null;
      
      switch (item.type) {
        case "customer":
          ({ error } = await supabase.from("customers").update({ deleted_at: null }).eq("id", item.id));
          break;
        case "order":
          ({ error } = await supabase.from("orders").update({ deleted_at: null }).eq("id", item.id));
          break;
        case "invoice":
          ({ error } = await supabase.from("invoices").update({ deleted_at: null }).eq("id", item.id));
          break;
        case "payment":
          ({ error } = await supabase.from("payments").update({ deleted_at: null }).eq("id", item.id));
          break;
        case "calendar_event":
          ({ error } = await supabase.from("calendar_events").update({ deleted_at: null }).eq("id", item.id));
          break;
        case "salary":
          ({ error } = await supabase.from("salaries").update({ deleted_at: null }).eq("id", item.id));
          break;
      }

      if (error) throw error;

      setDeletedItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
      toast({
        title: "Berhasil",
        description: "Data berhasil dipulihkan",
      });
      return true;
    } catch {
      toast({
        title: "Error",
        description: "Gagal memulihkan data",
        variant: "destructive",
      });
      return false;
    }
  };

  const permanentDelete = async (item: DeletedItem) => {
    try {
      let error = null;
      
      switch (item.type) {
        case "customer":
          ({ error } = await supabase.from("customers").delete().eq("id", item.id));
          break;
        case "order":
          ({ error } = await supabase.from("orders").delete().eq("id", item.id));
          break;
        case "invoice":
          ({ error } = await supabase.from("invoices").delete().eq("id", item.id));
          break;
        case "payment":
          ({ error } = await supabase.from("payments").delete().eq("id", item.id));
          break;
        case "calendar_event":
          ({ error } = await supabase.from("calendar_events").delete().eq("id", item.id));
          break;
        case "salary":
          ({ error } = await supabase.from("salaries").delete().eq("id", item.id));
          break;
      }

      if (error) throw error;

      setDeletedItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
      toast({
        title: "Berhasil",
        description: "Data berhasil dihapus permanen",
      });
      return true;
    } catch {
      toast({
        title: "Error",
        description: "Gagal menghapus data",
        variant: "destructive",
      });
      return false;
    }
  };

  const emptyRecycleBin = async () => {
    try {
      // Delete from each table separately
      await supabase.from("customers").delete().not("deleted_at", "is", null);
      await supabase.from("orders").delete().not("deleted_at", "is", null);
      await supabase.from("invoices").delete().not("deleted_at", "is", null);
      await supabase.from("payments").delete().not("deleted_at", "is", null);
      await supabase.from("calendar_events").delete().not("deleted_at", "is", null);
      await supabase.from("salaries").delete().not("deleted_at", "is", null);

      setDeletedItems([]);
      toast({
        title: "Berhasil",
        description: "Recycle bin berhasil dikosongkan",
      });
      return true;
    } catch {
      toast({
        title: "Error",
        description: "Gagal mengosongkan recycle bin",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  return { 
    deletedItems, 
    loading, 
    restoreItem, 
    permanentDelete, 
    emptyRecycleBin,
    refetch: fetchDeletedItems 
  };
};
