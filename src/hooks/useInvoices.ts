import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PaymentTerm {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  date: string | null;
  paid: boolean;
}

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
  payment_terms: PaymentTerm[];
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
  payment_terms: PaymentTerm[];
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
      const mappedData = (data || []).map(inv => ({
        ...inv,
        payment_terms: (inv.payment_terms as unknown as PaymentTerm[]) || [],
      })) as Invoice[];
      setInvoices(mappedData);
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
          items: formData.items as any,
          payment_terms: formData.payment_terms as any,
          status: "draft",
        })
        .select(`*, customers(name, pic_name)`)
        .single();

      if (error) throw error;
      const mappedData = {
        ...data,
        payment_terms: (data.payment_terms as unknown as PaymentTerm[]) || [],
      } as Invoice;
      setInvoices(prev => [mappedData, ...prev]);
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

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const dbUpdates: any = { ...updates };
      if (updates.payment_terms) {
        dbUpdates.payment_terms = updates.payment_terms as any;
      }
      
      const { data, error } = await supabase
        .from("invoices")
        .update(dbUpdates)
        .eq("id", id)
        .select(`*, customers(name, pic_name)`)
        .single();

      if (error) throw error;
      const mappedData = {
        ...data,
        payment_terms: (data.payment_terms as unknown as PaymentTerm[]) || [],
      } as Invoice;
      setInvoices(prev => prev.map(inv => inv.id === id ? mappedData : inv));
      toast({
        title: "Berhasil",
        description: "Invoice berhasil diperbarui",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memperbarui invoice",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return { invoices, loading, addInvoice, updateInvoice, refetch: fetchInvoices };
};
