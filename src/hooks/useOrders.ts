import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type DesignStatus = "belum_mulai" | "proses" | "review" | "selesai";
export type CetakStatus = "belum" | "proses" | "selesai";

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: "proses" | "desain" | "cetak" | "selesai";
  value: number;
  has_mou: boolean;
  has_spreadsheet: boolean;
  has_drive: boolean;
  mou_link: string | null;
  gmail_email: string | null;
  spreadsheet_link: string | null;
  drive_link: string | null;
  google_doc_link: string | null;
  design_cover_link: string | null;
  design_isi_link: string | null;
  design_packaging_link: string | null;
  design_cover_status: DesignStatus;
  design_isi_status: DesignStatus;
  design_packaging_status: DesignStatus;
  cetak_cover_status: CetakStatus;
  cetak_isi_status: CetakStatus;
  cetak_packaging_status: CetakStatus;
  wa_group_link: string | null;
  wa_desc: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
    pic_name: string;
  };
}

export interface OrderFormData {
  customer_id: string;
  order_number?: string;
  value: number;
  wa_desc: string;
  notes: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    return `ORD-${year}-${random}`;
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, customers(name, pic_name)`)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data as Order[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (formData: OrderFormData) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          order_number: formData.order_number?.trim() || generateOrderNumber(),
          customer_id: formData.customer_id,
          value: formData.value,
          wa_desc: formData.wa_desc || null,
          notes: formData.notes || null,
          status: "proses",
        })
        .select(`*, customers(name, pic_name)`)
        .single();

      if (error) throw error;
      setOrders(prev => [data as Order, ...prev]);
      toast({
        title: "Berhasil",
        description: "Order baru berhasil dibuat",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal membuat order",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id)
        .select(`*, customers(name, pic_name)`)
        .single();

      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === id ? data as Order : o));
      toast({
        title: "Berhasil",
        description: "Order berhasil diperbarui",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memperbarui order",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    return updateOrder(id, { status });
  };

  const deleteOrder = async (id: string) => {
    try {
      // Soft delete - set deleted_at timestamp
      const { error } = await supabase
        .from("orders")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== id));
      toast({
        title: "Berhasil",
        description: "Order berhasil dihapus (dapat dipulihkan di Recycle Bin)",
      });
      return true;
    } catch {
      toast({
        title: "Error",
        description: "Gagal menghapus order",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, addOrder, updateOrder, updateOrderStatus, deleteOrder, refetch: fetchOrders };
};
