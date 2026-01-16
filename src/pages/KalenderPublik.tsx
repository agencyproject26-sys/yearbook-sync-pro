import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Camera, Palette, Printer, Users, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface CalendarEvent {
  id: string;
  title: string;
  type: "meeting" | "photo" | "design" | "print";
  date: string;
  time: string;
  notes: string | null;
  created_at: string;
}

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const typeConfig = {
  meeting: { icon: Users, label: "Meeting", className: "bg-primary/15 text-primary" },
  photo: { icon: Camera, label: "Pemotretan", className: "bg-green-500/15 text-green-600" },
  design: { icon: Palette, label: "Desain", className: "bg-amber-500/15 text-amber-600" },
  print: { icon: Printer, label: "Cetak", className: "bg-blue-500/15 text-blue-600" },
};

export default function KalenderPublik() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "agenda">("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch only calendar_events without customer join (public access)
        const { data, error } = await supabase
          .from("calendar_events")
          .select(`id, title, type, date, time, notes, created_at`)
          .order("date", { ascending: true });

        if (error) throw error;
        setEvents(data as CalendarEvent[]);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevPeriod = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextPeriod = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getDateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getEventsForDate = (dateKey: string) =>
    events.filter((event) => event.date === dateKey);

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleDateClick = (day: number) => {
    const dateKey = getDateKey(day);
    setSelectedDate(dateKey);
  };

  // Sort events by date for agenda view
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Filter upcoming events (today and future)
  const upcomingEvents = sortedEvents.filter(event => {
    const eventDate = new Date(event.date);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return eventDate >= todayStart;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Kalender Jadwal</h1>
              <p className="text-sm text-muted-foreground">Lihat jadwal meeting, pemotretan, dan deadline</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevPeriod}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="min-w-[180px] text-center text-xl font-semibold">
                {MONTHS[month]} {year}
              </h2>
              <Button variant="outline" size="icon" onClick={nextPeriod}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Hari Ini
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={view === "month" ? "default" : "outline"}
              onClick={() => setView("month")}
            >
              Bulanan
            </Button>
            <Button
              variant={view === "agenda" ? "default" : "outline"}
              onClick={() => setView("agenda")}
            >
              Agenda
            </Button>
          </div>
        </div>

        {view === "month" ? (
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Calendar Grid */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-border bg-muted/50">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="px-2 py-3 text-center text-sm font-semibold text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                  {days.map((day, index) => {
                    const dateKey = day ? getDateKey(day) : "";
                    const dayEvents = day ? getEventsForDate(dateKey) : [];
                    const isSelected = selectedDate === dateKey;

                    return (
                      <div
                        key={index}
                        onClick={() => day && handleDateClick(day)}
                        className={cn(
                          "min-h-[100px] border-b border-r border-border p-2 transition-colors",
                          day && "cursor-pointer hover:bg-muted/30",
                          isSelected && "bg-primary/5",
                          !day && "bg-muted/20"
                        )}
                      >
                        {day && (
                          <>
                            <div
                              className={cn(
                                "mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                                isToday(day) && "bg-primary text-primary-foreground"
                              )}
                            >
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map((event) => {
                                const config = typeConfig[event.type];
                                return (
                                  <div
                                    key={event.id}
                                    className={cn(
                                      "truncate rounded px-1.5 py-0.5 text-xs font-medium",
                                      config.className
                                    )}
                                  >
                                    {event.title}
                                  </div>
                                );
                              })}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{dayEvents.length - 2} lainnya
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Legend */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 font-semibold">Keterangan</h3>
                <div className="space-y-2">
                  {Object.entries(typeConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <div className={cn("flex h-6 w-6 items-center justify-center rounded", config.className)}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm">{config.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Date Events */}
              {selectedDate && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="mb-3 font-semibold">
                    {new Date(selectedDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </h3>
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).length > 0 ? (
                      getEventsForDate(selectedDate).map((event) => {
                        const config = typeConfig[event.type];
                        const Icon = config.icon;
                        return (
                          <div
                            key={event.id}
                            className="rounded-lg border border-border p-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", config.className)}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{event.title}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{event.time}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">Tidak ada jadwal</p>
                    )}
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 font-semibold">Jadwal Terdekat</h3>
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 5).map((event) => {
                    const config = typeConfig[event.type];
                    return (
                      <div key={event.id} className="flex items-center gap-3">
                        <Badge className={config.className}>{config.label}</Badge>
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {event.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {upcomingEvents.length === 0 && (
                    <p className="text-sm text-muted-foreground">Tidak ada jadwal mendatang</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Agenda View */
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="divide-y divide-border">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => {
                  const config = typeConfig[event.type];
                  const Icon = config.icon;
                  return (
                    <div key={event.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.className)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Date(event.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                        <p className="text-sm text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">Belum ada jadwal</h3>
                  <p className="text-sm text-muted-foreground">Tidak ada jadwal yang tersedia saat ini.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Kalender ini hanya untuk dilihat. Untuk melakukan perubahan, silakan hubungi admin.</p>
        </div>
      </div>
    </div>
  );
}
