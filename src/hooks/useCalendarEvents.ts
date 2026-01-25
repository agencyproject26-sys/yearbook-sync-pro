import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CalendarEvent {
  id: string;
  title: string;
  type: "meeting" | "photo" | "design" | "print";
  date: string;
  time: string;
  customer_id: string | null;
  notes: string | null;
  created_at: string;
  customers?: {
    name: string;
  };
}

export interface EventFormData {
  title: string;
  type: "meeting" | "photo" | "design" | "print";
  date: string;
  time: string;
  customer_id: string;
  notes: string;
}

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select(`*, customers(name)`)
        .is("deleted_at", null)
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data as CalendarEvent[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data jadwal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (formData: EventFormData) => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          title: formData.title,
          type: formData.type,
          date: formData.date,
          time: formData.time,
          customer_id: formData.customer_id || null,
          notes: formData.notes || null,
        })
        .select(`*, customers(name)`)
        .single();

      if (error) throw error;
      setEvents(prev => [...prev, data as CalendarEvent]);
      toast({
        title: "Berhasil",
        description: "Jadwal baru berhasil ditambahkan",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menambahkan jadwal",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, addEvent, refetch: fetchEvents };
};
