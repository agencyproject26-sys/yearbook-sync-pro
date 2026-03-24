import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Camera, Palette, Printer, Users, Loader2, Share2, Copy, Check } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCalendarEvents, CalendarEvent, EventFormData } from "@/hooks/useCalendarEvents";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";
import { EventPopover } from "@/components/calendar/EventPopover";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";

const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAYS_FULL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const typeColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  meeting: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300", border: "border-l-blue-500", dot: "bg-blue-500" },
  photo: { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-700 dark:text-green-300", border: "border-l-green-500", dot: "bg-green-500" },
  design: { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300", border: "border-l-amber-500", dot: "bg-amber-500" },
  print: { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300", border: "border-l-purple-500", dot: "bg-purple-500" },
};

const typeConfig = {
  meeting: { icon: Users, label: "Meeting" },
  photo: { icon: Camera, label: "Pemotretan" },
  design: { icon: Palette, label: "Desain" },
  print: { icon: Printer, label: "Cetak" },
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const emptyFormData: EventFormData = {
  title: "",
  type: "meeting",
  date: "",
  time: "",
  customer_id: "",
  notes: "",
};

function formatTime(time: string) {
  const [h, m] = time.split(":");
  return `${h}:${m}`;
}

function getDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function Kalender() {
  const { events, loading, addEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { customers } = useCustomers();
  const { toast } = useToast();
  const { roles, hasRole } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("week");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({ ...emptyFormData });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  const isCalendarOnly = roles.length === 1 && hasRole('calendar_only');
  const canModify = !isCalendarOnly;

  const today = new Date();

  // Scroll to current hour on mount
  useEffect(() => {
    if (scrollRef.current && (view === "week" || view === "day")) {
      const hourNow = new Date().getHours();
      const scrollTo = Math.max(0, (hourNow - 1) * 60);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, [view]);

  // Navigation
  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + 7 * dir);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  // Header title
  const getTitle = () => {
    if (view === "month") return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (view === "day") {
      return `${DAYS_FULL[currentDate.getDay()]}, ${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    // week
    const weekDates = getWeekDates(currentDate);
    const start = weekDates[0];
    const end = weekDates[6];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${MONTHS[start.getMonth()].slice(0, 3)} - ${end.getDate()} ${MONTHS[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
  };

  // Events helpers
  const getEventsForDate = (dateKey: string) =>
    events.filter((event) => event.date === dateKey).sort((a, b) => a.time.localeCompare(b.time));

  // Quick add event
  const handleQuickAdd = (date: string, hour: number) => {
    if (!canModify) return;
    setFormData({
      ...emptyFormData,
      date,
      time: `${String(hour).padStart(2, "0")}:00`,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.type || !formData.date || !formData.time) return;
    setIsSubmitting(true);
    const success = await addEvent(formData);
    setIsSubmitting(false);
    if (success) {
      setFormData({ ...emptyFormData });
      setIsDialogOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setFormData({ ...emptyFormData });
  };

  const getShareUrl = () => `${window.location.origin}/kalender-publik`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    toast({ title: "Link disalin", description: "Link kalender publik berhasil disalin ke clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  // Mini calendar
  const miniYear = miniCalendarDate.getFullYear();
  const miniMonth = miniCalendarDate.getMonth();
  const miniFirstDay = new Date(miniYear, miniMonth, 1).getDay();
  const miniDaysInMonth = new Date(miniYear, miniMonth + 1, 0).getDate();
  const miniDays: (number | null)[] = [];
  for (let i = 0; i < miniFirstDay; i++) miniDays.push(null);
  for (let i = 1; i <= miniDaysInMonth; i++) miniDays.push(i);

  const handleMiniDateClick = (day: number) => {
    const d = new Date(miniYear, miniMonth, day);
    setCurrentDate(d);
    if (view === "month") setView("day");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // ---- RENDER WEEK VIEW ----
  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    return (
      <div className="flex flex-col h-[calc(100vh-220px)] rounded-xl border border-border bg-card overflow-hidden">
        {/* All-day / header row */}
        <div className="flex border-b border-border bg-muted/30 shrink-0">
          <div className="w-16 shrink-0 border-r border-border" />
          {weekDates.map((d, i) => {
            const isT = isSameDay(d, today);
            const dateKey = getDateStr(d);
            const allDayEvents = getEventsForDate(dateKey);
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 border-r border-border last:border-r-0 text-center py-2 px-1",
                  isT && "bg-primary/5"
                )}
              >
                <div className="text-xs text-muted-foreground">{DAYS_SHORT[d.getDay()]}</div>
                <div
                  className={cn(
                    "mx-auto mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold cursor-pointer hover:bg-muted transition-colors",
                    isT && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => { setCurrentDate(d); setView("day"); }}
                >
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        {/* Time grid */}
        <div className="flex-1 overflow-auto" ref={scrollRef}>
          <div className="relative flex min-h-[1440px]">
            {/* Time labels */}
            <div className="w-16 shrink-0 border-r border-border">
              {HOURS.map((h) => (
                <div key={h} className="h-[60px] relative">
                  <span className="absolute -top-2 right-2 text-[10px] text-muted-foreground">
                    {h === 0 ? "" : `${String(h).padStart(2, "0")}:00`}
                  </span>
                </div>
              ))}
            </div>
            {/* Day columns */}
            {weekDates.map((d, colIdx) => {
              const dateKey = getDateStr(d);
              const dayEvents = getEventsForDate(dateKey);
              const isT = isSameDay(d, today);
              return (
                <div key={colIdx} className={cn("flex-1 border-r border-border last:border-r-0 relative", isT && "bg-primary/[0.02]")}>
                  {/* Hour grid lines */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="h-[60px] border-b border-border/50 cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => handleQuickAdd(dateKey, h)}
                    />
                  ))}
                  {/* Current time indicator */}
                  {isT && (
                    <div
                      className="absolute left-0 right-0 z-10 pointer-events-none"
                      style={{ top: `${(today.getHours() * 60 + today.getMinutes())}px` }}
                    >
                      <div className="flex items-center">
                        <div className="h-3 w-3 -ml-1.5 rounded-full bg-destructive" />
                        <div className="flex-1 h-[2px] bg-destructive" />
                      </div>
                    </div>
                  )}
                  {/* Events */}
                  {dayEvents.map((event) => {
                    const [eh, em] = event.time.split(":").map(Number);
                    const topPx = eh * 60 + em;
                    const colors = typeColors[event.type] || typeColors.meeting;
                    return (
                      <EventPopover
                        key={event.id}
                        event={event}
                        customers={customers}
                        onUpdate={updateEvent}
                        onDelete={deleteEvent}
                        readOnly={!canModify}
                      >
                        <div
                          className={cn(
                            "absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 text-[11px] leading-tight cursor-pointer border-l-[3px] z-[5] hover:shadow-md transition-shadow min-h-[22px]",
                            colors.bg, colors.text, colors.border
                          )}
                          style={{ top: `${topPx}px` }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="opacity-75 truncate">{formatTime(event.time)}</div>
                        </div>
                      </EventPopover>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ---- RENDER DAY VIEW ----
  const renderDayView = () => {
    const dateKey = getDateStr(currentDate);
    const dayEvents = getEventsForDate(dateKey);
    const isT = isSameDay(currentDate, today);

    return (
      <div className="flex flex-col h-[calc(100vh-220px)] rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex border-b border-border bg-muted/30 shrink-0">
          <div className="w-16 shrink-0 border-r border-border" />
          <div className={cn("flex-1 text-center py-3", isT && "bg-primary/5")}>
            <div className="text-xs text-muted-foreground">{DAYS_FULL[currentDate.getDay()]}</div>
            <div className={cn(
              "mx-auto mt-0.5 flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold",
              isT && "bg-primary text-primary-foreground"
            )}>
              {currentDate.getDate()}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto" ref={scrollRef}>
          <div className="relative flex min-h-[1440px]">
            <div className="w-16 shrink-0 border-r border-border">
              {HOURS.map((h) => (
                <div key={h} className="h-[60px] relative">
                  <span className="absolute -top-2 right-2 text-[10px] text-muted-foreground">
                    {h === 0 ? "" : `${String(h).padStart(2, "0")}:00`}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex-1 relative">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="h-[60px] border-b border-border/50 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => handleQuickAdd(dateKey, h)}
                />
              ))}
              {isT && (
                <div
                  className="absolute left-0 right-0 z-10 pointer-events-none"
                  style={{ top: `${(today.getHours() * 60 + today.getMinutes())}px` }}
                >
                  <div className="flex items-center">
                    <div className="h-3 w-3 -ml-1.5 rounded-full bg-destructive" />
                    <div className="flex-1 h-[2px] bg-destructive" />
                  </div>
                </div>
              )}
              {dayEvents.map((event) => {
                const [eh, em] = event.time.split(":").map(Number);
                const topPx = eh * 60 + em;
                const colors = typeColors[event.type] || typeColors.meeting;
                return (
                  <EventPopover
                    key={event.id}
                    event={event}
                    customers={customers}
                    onUpdate={updateEvent}
                    onDelete={deleteEvent}
                    readOnly={!canModify}
                  >
                    <div
                      className={cn(
                        "absolute left-1 right-4 rounded-md px-3 py-1.5 text-sm cursor-pointer border-l-[3px] z-[5] hover:shadow-md transition-shadow min-h-[28px]",
                        colors.bg, colors.text, colors.border
                      )}
                      style={{ top: `${topPx}px` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="opacity-75 text-xs">
                        {formatTime(event.time)}
                        {event.customers?.name && ` · ${event.customers.name}`}
                      </div>
                    </div>
                  </EventPopover>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---- RENDER MONTH VIEW ----
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    const cells: { day: number; isCurrentMonth: boolean; dateKey: string }[] = [];
    // fill previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const dt = new Date(year, month - 1, d);
      cells.push({ day: d, isCurrentMonth: false, dateKey: getDateStr(dt) });
    }
    // current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dt = new Date(year, month, i);
      cells.push({ day: i, isCurrentMonth: true, dateKey: getDateStr(dt) });
    }
    // fill next month
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const dt = new Date(year, month + 1, i);
      cells.push({ day: i, isCurrentMonth: false, dateKey: getDateStr(dt) });
    }

    const weeks: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {DAYS_SHORT.map((d) => (
            <div key={d} className="px-2 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        <div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
              {week.map((cell, ci) => {
                const dayEvents = getEventsForDate(cell.dateKey);
                const isT = cell.isCurrentMonth && isSameDay(new Date(cell.dateKey), today);
                return (
                  <div
                    key={ci}
                    className={cn(
                      "min-h-[110px] border-r border-border last:border-r-0 p-1 transition-colors cursor-pointer hover:bg-muted/20",
                      !cell.isCurrentMonth && "bg-muted/10 opacity-50"
                    )}
                    onClick={() => {
                      setCurrentDate(new Date(cell.dateKey));
                      setView("day");
                    }}
                  >
                    <div className={cn(
                      "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium mx-auto",
                      isT && "bg-primary text-primary-foreground"
                    )}>
                      {cell.day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((event) => {
                        const colors = typeColors[event.type] || typeColors.meeting;
                        return (
                          <EventPopover
                            key={event.id}
                            event={event}
                            customers={customers}
                            onUpdate={updateEvent}
                            onDelete={deleteEvent}
                            readOnly={!canModify}
                          >
                            <div
                              className={cn(
                                "flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity truncate",
                                colors.bg, colors.text
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", colors.dot)} />
                              <span className="truncate">{formatTime(event.time)} {event.title}</span>
                            </div>
                          </EventPopover>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-muted-foreground pl-1">
                          +{dayEvents.length - 3} lainnya
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <Header
        title="Kalender"
        subtitle={isCalendarOnly ? "Lihat jadwal meeting, pemotretan, dan deadline" : "Jadwal meeting, pemotretan, dan deadline"}
        showAddButton={false}
        showSearch={false}
        showNotifications={false}
      />

      <div className="p-4 sm:p-6">
        {/* Google Calendar-style toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToday} className="font-medium">
              Hari Ini
            </Button>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-lg font-semibold ml-1">{getTitle()}</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["day", "week", "month"] as const).map((v) => (
                <Button
                  key={v}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-none border-r border-border last:border-r-0 px-3 text-xs font-medium",
                    view === v && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  )}
                  onClick={() => setView(v)}
                >
                  {v === "day" ? "Hari" : v === "week" ? "Minggu" : "Bulan"}
                </Button>
              ))}
            </div>
            {canModify && (
              <Button size="sm" onClick={() => {
                setFormData({ ...emptyFormData, date: getDateStr(currentDate) });
                setIsDialogOpen(true);
              }}>
                <Plus className="mr-1 h-4 w-4" />
                Tambah
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsShareDialogOpen(true)}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Left sidebar - mini calendar + legend (hidden on small screens) */}
          <div className="hidden lg:block w-56 shrink-0 space-y-4">
            {/* Mini Calendar */}
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{MONTHS[miniMonth].slice(0, 3)} {miniYear}</span>
                <div className="flex">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMiniCalendarDate(new Date(miniYear, miniMonth - 1, 1))}>
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMiniCalendarDate(new Date(miniYear, miniMonth + 1, 1))}>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-0">
                {DAYS_SHORT.map((d) => (
                  <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d.charAt(0)}</div>
                ))}
                {miniDays.map((day, i) => {
                  const isT = day !== null && isSameDay(new Date(miniYear, miniMonth, day), today);
                  const isCurrent = day !== null && isSameDay(new Date(miniYear, miniMonth, day), currentDate);
                  const dateKey = day !== null ? getDateStr(new Date(miniYear, miniMonth, day)) : "";
                  const hasEvents = day !== null && events.some(e => e.date === dateKey);
                  return (
                    <div
                      key={i}
                      className={cn(
                        "text-center text-xs py-1 cursor-pointer rounded-full hover:bg-muted transition-colors relative",
                        !day && "invisible",
                        isT && !isCurrent && "text-primary font-bold",
                        isCurrent && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      onClick={() => day && handleMiniDateClick(day)}
                    >
                      {day}
                      {hasEvents && !isCurrent && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="rounded-xl border border-border bg-card p-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Keterangan</h3>
              <div className="space-y-1.5">
                {Object.entries(typeConfig).map(([key, config]) => {
                  const colors = typeColors[key];
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-sm", colors.dot)} />
                      <span className="text-xs">{config.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming */}
            <div className="rounded-xl border border-border bg-card p-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Jadwal Terdekat</h3>
              <div className="space-y-2">
                {events
                  .filter(e => e.date >= getDateStr(today))
                  .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
                  .slice(0, 5)
                  .map((event) => {
                    const colors = typeColors[event.type];
                    return (
                      <div key={event.id} className="flex items-start gap-2">
                        <span className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", colors.dot)} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{event.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(event.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} · {formatTime(event.time)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {events.filter(e => e.date >= getDateStr(today)).length === 0 && (
                  <p className="text-xs text-muted-foreground">Tidak ada jadwal</p>
                )}
              </div>
            </div>
          </div>

          {/* Main calendar area */}
          <div className="flex-1 min-w-0">
            {view === "week" && renderWeekView()}
            {view === "day" && renderDayView()}
            {view === "month" && renderMonthView()}
          </div>
        </div>

        {/* Add Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Jadwal Baru</DialogTitle>
              <DialogDescription>Buat jadwal meeting, pemotretan, atau deadline baru.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul *</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Meeting Proposal"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipe *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "meeting" | "photo" | "design" | "print") =>
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe jadwal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="photo">Pemotretan</SelectItem>
                    <SelectItem value="design">Deadline Desain</SelectItem>
                    <SelectItem value="print">Cetak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Tanggal *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Waktu *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer">Pelanggan (Opsional)</Label>
                <Select
                  value={formData.customer_id || undefined}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sekolah" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan tambahan"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>Batal</Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.type || !formData.date || !formData.time || isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Tambah Jadwal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Bagikan Kalender</DialogTitle>
              <DialogDescription>Bagikan link kalender publik ke klien atau sekolah.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Link Kalender Publik</Label>
                <div className="flex gap-2">
                  <Input value={getShareUrl()} readOnly className="bg-muted" />
                  <Button variant="outline" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Link ini dapat diakses oleh siapa saja. Pengguna hanya dapat melihat jadwal tanpa bisa mengubah.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsShareDialogOpen(false)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
