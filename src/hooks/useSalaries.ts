import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Salary {
  id: string;
  name: string;
  category: "photographer" | "design" | "print" | "other";
  amount: number;
  description: string | null;
  order_id: string | null;
  payment_date: string;
  created_at: string;
  orders?: {
    order_number: string;
  };
}

export interface SalaryFormData {
  name: string;
  category: "photographer" | "design" | "print" | "other";
  amount: number;
  description: string;
  order_id: string;
  payment_date: string;
}

export const useSalaries = () => {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSalaries = async () => {
    try {
      const { data, error } = await supabase
        .from("salaries")
        .select(`*, orders(order_number)`)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSalaries(data as Salary[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data gaji",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSalary = async (formData: SalaryFormData) => {
    try {
      const { data, error } = await supabase
        .from("salaries")
        .insert({
          name: formData.name,
          category: formData.category,
          amount: formData.amount,
          description: formData.description || null,
          order_id: formData.order_id || null,
          payment_date: formData.payment_date,
        })
        .select(`*, orders(order_number)`)
        .single();

      if (error) throw error;
      setSalaries(prev => [data as Salary, ...prev]);
      toast({
        title: "Berhasil",
        description: "Gaji berhasil dicatat",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal mencatat gaji",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateSalary = async (id: string, formData: SalaryFormData) => {
    try {
      const { data, error } = await supabase
        .from("salaries")
        .update({
          name: formData.name,
          category: formData.category,
          amount: formData.amount,
          description: formData.description || null,
          order_id: formData.order_id || null,
          payment_date: formData.payment_date,
        })
        .eq("id", id)
        .select(`*, orders(order_number)`)
        .single();

      if (error) throw error;
      setSalaries(prev => prev.map(s => s.id === id ? (data as Salary) : s));
      toast({
        title: "Berhasil",
        description: "Data gaji berhasil diperbarui",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data gaji",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSalary = async (id: string) => {
    try {
      // Soft delete - set deleted_at timestamp
      const { error } = await supabase
        .from("salaries")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      setSalaries(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Berhasil",
        description: "Data gaji berhasil dihapus (dapat dipulihkan di Recycle Bin)",
      });
      return true;
    } catch {
      toast({
        title: "Error",
        description: "Gagal menghapus data gaji",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  return { salaries, loading, addSalary, updateSalary, deleteSalary, refetch: fetchSalaries };
};
