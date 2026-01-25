import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PIC {
  name: string;
  phones: string[];
}

export interface Customer {
  id: string;
  name: string;
  pic_name: string;
  phones: string[];
  pics: PIC[];
  city: string;
  kecamatan: string | null;
  kelurahan: string | null;
  address: string | null;
  status: "prospek" | "aktif" | "selesai";
  sph_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  name: string;
  pics: PIC[];
  city: string;
  kecamatan: string;
  kelurahan: string;
  address: string;
  status: "prospek" | "aktif" | "selesai";
}

export const updateCustomerSphLink = async (supabase: any, id: string, sph_link: string) => {
  const { error } = await supabase
    .from("customers")
    .update({ sph_link })
    .eq("id", id);
  return !error;
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform data to ensure pics is always an array
      const transformedData = (data || []).map((customer: any) => ({
        ...customer,
        pics: Array.isArray(customer.pics) && customer.pics.length > 0 
          ? customer.pics 
          : customer.pic_name 
            ? [{ name: customer.pic_name, phones: customer.phones || [] }]
            : []
      }));
      
      setCustomers(transformedData as Customer[]);
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
      // Get the first PIC for backward compatibility
      const firstPic = formData.pics[0] || { name: "", phones: [] };
      
      const { data, error } = await supabase
        .from("customers")
        .insert({
          name: formData.name,
          pic_name: firstPic.name,
          phones: firstPic.phones.filter(p => p.trim() !== ""),
          pics: formData.pics.map(pic => ({
            name: pic.name,
            phones: pic.phones.filter(p => p.trim() !== "")
          })),
          city: formData.city,
          kecamatan: formData.kecamatan || null,
          kelurahan: formData.kelurahan || null,
          address: formData.address || null,
          status: formData.status,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newCustomer = {
        ...data,
        pics: formData.pics
      } as Customer;
      
      setCustomers(prev => [newCustomer, ...prev]);
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
      // Soft delete - set deleted_at timestamp
      const { error } = await supabase
        .from("customers")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Berhasil",
        description: "Pelanggan berhasil dihapus (dapat dipulihkan di Recycle Bin)",
      });
    } catch {
      toast({
        title: "Error",
        description: "Gagal menghapus pelanggan",
        variant: "destructive",
      });
    }
  };

  const updateCustomer = async (id: string, formData: CustomerFormData) => {
    try {
      // Get the first PIC for backward compatibility
      const firstPic = formData.pics[0] || { name: "", phones: [] };
      
      const { data, error } = await supabase
        .from("customers")
        .update({
          name: formData.name,
          pic_name: firstPic.name,
          phones: firstPic.phones.filter(p => p.trim() !== ""),
          pics: formData.pics.map(pic => ({
            name: pic.name,
            phones: pic.phones.filter(p => p.trim() !== "")
          })),
          city: formData.city,
          kecamatan: formData.kecamatan || null,
          kelurahan: formData.kelurahan || null,
          address: formData.address || null,
          status: formData.status,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedCustomer = {
        ...data,
        pics: formData.pics
      } as Customer;
      
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      toast({
        title: "Berhasil",
        description: "Pelanggan berhasil diperbarui",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memperbarui pelanggan",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, addCustomer, deleteCustomer, updateCustomer, refetch: fetchCustomers };
};
