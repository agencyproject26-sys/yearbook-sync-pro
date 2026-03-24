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
  issue_date: string | null;
  company_logo_url: string | null;
  status: "draft" | "sent" | "paid" | "overdue";
  items: any[];
  dp_date: string | null;
  dp_amount: number | null;
  pelunasan_date: string | null;
  pelunasan_amount: number | null;
  payment_terms: PaymentTerm[];
  mou_link: string | null;
  created_at: string;
  customers?: {
    name: string;
    pic_name: string;
  };
}

export interface InvoiceFormData {
  customer_id: string;
  order_id?: string;
  issue_date: string;
  items: { description: string; qty: number; price: number }[];
  payment_terms: PaymentTerm[];
  company_logo_url?: string;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const generateInvoiceNumber = async () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    
    // Get the count of invoices this year to generate sequential number
    const { count, error } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .like("invoice_number", `INV/${year}%`);
    
    if (error) {
      console.error("Error counting invoices:", error);
      // Fallback to timestamp-based number
      const fallbackNum = Date.now().toString().slice(-4);
      return `INV/${year}/${month}/${fallbackNum}`;
    }
    
    const nextNumber = String((count || 0) + 1).padStart(4, "0");
    return `INV/${year}/${month}/${nextNumber}`;
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`*, customers(name, pic_name)`)
        .is("deleted_at", null)
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
      const invoiceNumber = await generateInvoiceNumber();
      
      const { data, error } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          customer_id: formData.customer_id,
          order_id: formData.order_id || null,
          amount: totalAmount,
          issue_date: formData.issue_date,
          due_date: formData.issue_date, // Keep for backward compatibility
          items: formData.items as any,
          payment_terms: formData.payment_terms as any,
          company_logo_url: formData.company_logo_url || null,
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

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      toast({
        title: "Berhasil",
        description: "Invoice berhasil dihapus",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus invoice",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return { invoices, loading, addInvoice, updateInvoice, deleteInvoice, refetch: fetchInvoices };
};
