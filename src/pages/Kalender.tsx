import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Camera, Palette, Printer, Users } from "lucide-react";
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

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

interface CalendarEvent {
  id: string;
  title: string;
  school: string;
  date: string;
  time: string;
  type: "meeting" | "photo" | "design" | "print";
}

const typeConfig = {
  meeting: { icon: Users, label: "Meeting", className: "bg-primary/15 text-primary" },
  photo: { icon: Camera, label: "Pemotretan", className: "bg-success/15 text-success" },
  design: { icon: Palette, label: "Desain", className: "bg-warning/15 text-warning" },
  print: { icon: Printer, label: "Cetak", className: "bg-info/15 text-info" },
};

const mockEvents: CalendarEvent[] = [
  { id: "1", title: "Meeting Proposal", school: "SMA Negeri 1 Jakarta", date: "2026-01-16", time: "10:00", type: "meeting" },
  { id: "2", title: "Pemotretan Kelas XII", school: "SMP Islam Al-Azhar", date: "2026-01-17", time: "08:00", type: "photo" },
  { id: "3", title: "Deadline Layout", school: "SD Tarakanita", date: "2026-01-18", time: "23:59", type: "design" },
  { id: "4", title: "Kirim ke Percetakan", school: "SMA Gonzaga", date: "2026-01-20", time: "09:00", type: "print" },
  { id: "5", title: "Meeting Review Desain", school: "SMA Negeri 1 Jakarta", date: "2026-01-20", time: "14:00", type: "meeting" },
  { id: "6", title: "Pemotretan Guru", school: "SD Tarakanita", date: "2026-01-22", time: "09:00", type: "photo" },
  { id: "7", title: "Deadline Final", school: "SMA Gonzaga", date: "2026-01-25", time: "23:59", type: "design" },
];

export default function Kalender() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 16));
  const [view, setView] = useState<"month" | "week">("month");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevPeriod = () => {
    if (view === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    }
  };

  const nextPeriod = () => {
    if (view === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    }
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
    mockEvents.filter((event) => event.date === dateKey);

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleDateClick = (day: number) => {
    const dateKey = getDateKey(day);
    setSelectedDate(dateKey);
  };

  return (
    <MainLayout>
      <Header
        title="Kalender"
        subtitle="Jadwal meeting, pemotretan, dan deadline"
        showAddButton
        addButtonLabel="Tambah Jadwal"
        onAddClick={() => setIsDialogOpen(true)}
      />

      <div className="p-6">
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
              variant={view === "week" ? "default" : "outline"}
              onClick={() => setView("week")}
            >
              Mingguan
            </Button>
          </div>
        </div>

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
                  const events = day ? getEventsForDate(dateKey) : [];
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
                            {events.slice(0, 2).map((event) => {
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
                            {events.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{events.length - 2} lainnya
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

          {/* Sidebar - Event Details */}
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
                              <p className="text-sm text-muted-foreground">{event.school}</p>
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
                {mockEvents.slice(0, 4).map((event) => {
                  const config = typeConfig[event.type];
                  return (
                    <div key={event.id} className="flex items-center gap-3">
                      <Badge className={config.className}>{config.label}</Badge>
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Add Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Jadwal Baru</DialogTitle>
              <DialogDescription>
                Buat jadwal meeting, pemotretan, atau deadline baru.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul</Label>
                <Input id="title" placeholder="Contoh: Meeting Proposal" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipe</Label>
                <Select>
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
                  <Label htmlFor="date">Tanggal</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Waktu</Label>
                  <Input id="time" type="time" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="school">Pelanggan (Opsional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sekolah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sma1">SMA Negeri 1 Jakarta</SelectItem>
                    <SelectItem value="smpazhar">SMP Islam Al-Azhar</SelectItem>
                    <SelectItem value="sdtar">SD Tarakanita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea id="notes" placeholder="Catatan tambahan" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Simpan Jadwal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
