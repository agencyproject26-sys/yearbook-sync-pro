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

// File validation constants
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'File harus berupa gambar (PNG, JPEG, WebP)' };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Ukuran file maksimal 5MB' };
  }
  
  // Additional: Check file extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
    return { valid: false, error: 'Format file tidak didukung' };
  }
  
  return { valid: true };
};

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
      if (import.meta.env.DEV) {
        console.error("Error fetching company settings:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    // Validate file before upload
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Error",
        description: validation.error,
        variant: "destructive",
      });
      return null;
    }

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("company-logos")
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("company-logos")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error uploading logo:", error);
      }
      toast({
        title: "Error",
        description: "Gagal mengupload logo",
        variant: "destructive",
      });
      return null;
    }
  };

  const uploadSignature = async (file: File): Promise<string | null> => {
    // Validate file before upload
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Error",
        description: validation.error,
        variant: "destructive",
      });
      return null;
    }

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const fileName = `signature-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("company-signatures")
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Store just the file path for private bucket - signed URL will be generated on access
      return fileName;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error uploading signature:", error);
      }
      toast({
        title: "Error",
        description: "Gagal mengupload tanda tangan",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get signed URL for private signature bucket (valid for 1 hour)
  const getSignatureUrl = async (signaturePath: string | null): Promise<string | null> => {
    if (!signaturePath) return null;
    
    // If it's already a full URL (legacy data), return as-is
    if (signaturePath.startsWith('http')) {
      return signaturePath;
    }
    
    try {
      const { data, error } = await supabase.storage
        .from("company-signatures")
        .createSignedUrl(signaturePath, 3600); // 1 hour expiry
      
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error getting signature URL:", error);
      }
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
    getSignatureUrl,
    refetch: fetchSettings,
  };
};
