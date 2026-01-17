import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Payment {
  id: string;
  receipt_number: string;
  invoice_id: string;
  amount: number;
  description: string | null;
  payment_date: string;
  created_at: string;
  invoices?: {
    invoice_number: string;
    customers: {
      name: string;
      pic_name: string;
    };
  };
}

export interface PaymentFormData {
  receipt_number: string;
  invoice_id: string;
  amount: number;
  description: string;
  payment_date: string;
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();


  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`*, invoices(invoice_number, customers(name, pic_name))`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data as Payment[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data pembayaran",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (formData: PaymentFormData) => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .insert({
          receipt_number: formData.receipt_number,
          invoice_id: formData.invoice_id,
          amount: formData.amount,
          description: formData.description || null,
          payment_date: formData.payment_date,
        })
        .select(`*, invoices(invoice_number, customers(name, pic_name))`)
        .single();

      if (error) throw error;
      setPayments(prev => [data as Payment, ...prev]);
      toast({
        title: "Berhasil",
        description: "Pembayaran berhasil dicatat",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal mencatat pembayaran",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return { payments, loading, addPayment, refetch: fetchPayments };
};
