import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CompanySettings {
  id: string;
  logo_url: string | null;
  signature_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      console.error("Error fetching company settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("company-logos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("company-logos")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "Gagal mengupload logo",
        variant: "destructive",
      });
      return null;
    }
  };

  const uploadSignature = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `signature-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("company-signatures")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("company-signatures")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading signature:", error);
      toast({
        title: "Error",
        description: "Gagal mengupload tanda tangan",
        variant: "destructive",
      });
      return null;
    }
  };

  const saveSettings = async (logoUrl: string | null, signatureUrl: string | null) => {
    try {
      if (settings) {
        // Update existing
        const { data, error } = await supabase
          .from("company_settings")
          .update({ logo_url: logoUrl, signature_url: signatureUrl })
          .eq("id", settings.id)
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("company_settings")
          .insert({ logo_url: logoUrl, signature_url: signatureUrl })
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
      }

      toast({
        title: "Berhasil",
        description: "Pengaturan berhasil disimpan",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    uploadLogo,
    uploadSignature,
    saveSettings,
    refetch: fetchSettings,
  };
};
