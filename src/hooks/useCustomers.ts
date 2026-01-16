import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Customer {
  id: string;
  name: string;
  pic_name: string;
  phones: string[];
  city: string;
  address: string | null;
  status: "prospek" | "aktif" | "selesai";
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  name: string;
  pic_name: string;
  phones: string[];
  city: string;
  address: string;
  status: "prospek" | "aktif" | "selesai";
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data as Customer[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data pelanggan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (formData: CustomerFormData) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .insert({
          name: formData.name,
          pic_name: formData.pic_name,
          phones: formData.phones.filter(p => p.trim() !== ""),
          city: formData.city,
          address: formData.address || null,
          status: formData.status,
        })
        .select()
        .single();

      if (error) throw error;
      setCustomers(prev => [data as Customer, ...prev]);
      toast({
        title: "Berhasil",
        description: "Pelanggan baru berhasil ditambahkan",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menambahkan pelanggan",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Berhasil",
        description: "Pelanggan berhasil dihapus",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus pelanggan",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, addCustomer, deleteCustomer, refetch: fetchCustomers };
};
