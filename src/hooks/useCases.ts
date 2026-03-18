import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Case {
  id: string;
  customer_id: string | null;
  order_id: string | null;
  case_number: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  deleted_at: string | null;
  customers?: { name: string } | null;
  orders?: { order_number: string } | null;
}

export function useCases() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const casesQuery = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('*, customers(name), orders(order_number)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as Case[];
    },
  });

  const createCase = useMutation({
    mutationFn: async (newCase: {
      case_number: string;
      title: string;
      description?: string;
      customer_id?: string;
      order_id?: string;
      priority?: string;
      assigned_to?: string;
    }) => {
      const { data, error } = await supabase
        .from('cases')
        .insert(newCase)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({ title: 'Case berhasil dibuat' });
    },
    onError: (error: Error) => {
      toast({ title: 'Gagal membuat case', description: error.message, variant: 'destructive' });
    },
  });

  const updateCase = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({ title: 'Case berhasil diperbarui' });
    },
    onError: (error: Error) => {
      toast({ title: 'Gagal memperbarui case', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCase = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cases')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({ title: 'Case berhasil dihapus' });
    },
    onError: (error: Error) => {
      toast({ title: 'Gagal menghapus case', description: error.message, variant: 'destructive' });
    },
  });

  const generateCaseNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `CASE-${year}${month}-${rand}`;
  };

  return {
    cases: casesQuery.data || [],
    isLoading: casesQuery.isLoading,
    createCase,
    updateCase,
    deleteCase,
    generateCaseNumber,
  };
}
