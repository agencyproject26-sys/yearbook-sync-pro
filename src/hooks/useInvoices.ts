import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  amount: number;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue";
  items: any[];
  dp_date: string | null;
  dp_amount: number | null;
  pelunasan_date: string | null;
  pelunasan_amount: number | null;
  created_at: string;
  customers?: {
    name: string;
    pic_name: string;
  };
}

export interface InvoiceFormData {
  customer_id: string;
  due_date: string;
  items: { description: string; qty: number; price: number }[];
  dp_date: string;
  dp_amount: number;
  pelunasan_date: string;
  pelunasan_amount: number;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    return `INV-${year}-${random}`;
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`*, customers(name, pic_name)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data as Invoice[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addInvoice = async (formData: InvoiceFormData) => {
    try {
      const totalAmount = formData.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
      
      const { data, error } = await supabase
        .from("invoices")
        .insert({
          invoice_number: generateInvoiceNumber(),
          customer_id: formData.customer_id,
          amount: totalAmount,
          due_date: formData.due_date,
          items: formData.items,
          dp_date: formData.dp_date || null,
          dp_amount: formData.dp_amount || null,
          pelunasan_date: formData.pelunasan_date || null,
          pelunasan_amount: formData.pelunasan_amount || null,
          status: "draft",
        })
        .select(`*, customers(name, pic_name)`)
        .single();

      if (error) throw error;
      setInvoices(prev => [data as Invoice, ...prev]);
      toast({
        title: "Berhasil",
        description: "Invoice baru berhasil dibuat",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal membuat invoice",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return { invoices, loading, addInvoice, refetch: fetchInvoices };
};
