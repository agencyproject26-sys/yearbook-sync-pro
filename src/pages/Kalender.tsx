import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Camera, Palette, Printer, Users, Loader2, Share2, Copy, Check, Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useCalendarEvents, EventFormData, CalendarEvent } from "@/hooks/useCalendarEvents";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const typeConfig = {
  meeting: { icon: Users, label: "Meeting", className: "bg-primary/15 text-primary" },
  photo: { icon: Camera, label: "Pemotretan", className: "bg-success/15 text-success" },
  design: { icon: Palette, label: "Desain", className: "bg-warning/15 text-warning" },
  print: { icon: Printer, label: "Cetak", className: "bg-info/15 text-info" },
};

const emptyFormData: EventFormData = {
  title: "",
  type: "meeting",
  date: "",
  time: "",
  customer_id: "",
  notes: "",
};

export default function Kalender() {
  const { events, loading, addEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { customers } = useCustomers();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "agenda">("month");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // View/Edit/Delete state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editFormData, setEditFormData] = useState<EventFormData>(emptyFormData);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  const handleSubmit = async () => {
    if (!formData.title || !formData.type || !formData.date || !formData.time) {
      return;
    }

    setIsSubmitting(true);
    const success = await addEvent(formData);
    setIsSubmitting(false);

    if (success) {
      setFormData(emptyFormData);
      setIsDialogOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setFormData(emptyFormData);
    }
  };

  // View event
  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  // Edit event
  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditFormData({
      title: event.title,
      type: event.type,
      date: event.date,
      time: event.time,
      customer_id: event.customer_id || "",
      notes: event.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedEvent || !editFormData.title || !editFormData.type || !editFormData.date || !editFormData.time) {
      return;
    }

    setIsSubmitting(true);
    const success = await updateEvent(selectedEvent.id, editFormData);
    setIsSubmitting(false);

    if (success) {
      setEditFormData(emptyFormData);
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  // Delete event
  const handleDeleteEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;

    setIsSubmitting(true);
    const success = await deleteEvent(selectedEvent.id);
    setIsSubmitting(false);

    if (success) {
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  // Get share URL (would be the public calendar URL in production)
  const getShareUrl = () => {
    return `${window.location.origin}/kalender-publik`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    toast({
      title: "Link disalin",
      description: "Link kalender publik berhasil disalin ke clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
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
      <MainLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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
              variant={view === "agenda" ? "default" : "outline"}
              onClick={() => setView("agenda")}
            >
              Agenda
            </Button>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(true)}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
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
                                {event.customers?.name && (
                                  <p className="text-sm text-muted-foreground">{event.customers.name}</p>
                                )}
                                <p className="mt-1 text-sm text-muted-foreground">{event.time}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewEvent(event)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Lihat Detail
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteEvent(event)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                        {event.customers?.name && (
                          <p className="text-sm text-muted-foreground">{event.customers.name}</p>
                        )}
                      </div>
                      <div className="text-right mr-2">
                        <p className="font-medium">
                          {new Date(event.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                        <p className="text-sm text-muted-foreground">{event.time}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewEvent(event)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteEvent(event)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Camera className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">Belum ada jadwal</h3>
                  <p className="text-sm text-muted-foreground">Klik tombol "Tambah Jadwal" untuk menambahkan jadwal baru.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Jadwal Baru</DialogTitle>
              <DialogDescription>
                Buat jadwal meeting, pemotretan, atau deadline baru.
              </DialogDescription>
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
                  value={formData.customer_id} 
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
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Batal
              </Button>
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

        {/* View Event Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detail Jadwal</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const config = typeConfig[selectedEvent.type];
                    const Icon = config.icon;
                    return (
                      <>
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.className)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge className={config.className}>{config.label}</Badge>
                      </>
                    );
                  })()}
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Judul</Label>
                    <p className="font-medium">{selectedEvent.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Tanggal</Label>
                      <p className="font-medium">
                        {new Date(selectedEvent.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Waktu</Label>
                      <p className="font-medium">{selectedEvent.time}</p>
                    </div>
                  </div>
                  {selectedEvent.customers?.name && (
                    <div>
                      <Label className="text-muted-foreground">Pelanggan</Label>
                      <p className="font-medium">{selectedEvent.customers.name}</p>
                    </div>
                  )}
                  {selectedEvent.notes && (
                    <div>
                      <Label className="text-muted-foreground">Catatan</Label>
                      <p className="whitespace-pre-wrap">{selectedEvent.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Tutup
              </Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedEvent) handleEditEvent(selectedEvent);
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditFormData(emptyFormData);
            setSelectedEvent(null);
          }
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Jadwal</DialogTitle>
              <DialogDescription>
                Ubah detail jadwal yang sudah ada.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Judul *</Label>
                <Input 
                  id="edit-title" 
                  placeholder="Contoh: Meeting Proposal" 
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Tipe *</Label>
                <Select 
                  value={editFormData.type} 
                  onValueChange={(value: "meeting" | "photo" | "design" | "print") => 
                    setEditFormData(prev => ({ ...prev, type: value }))
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
                  <Label htmlFor="edit-date">Tanggal *</Label>
                  <Input 
                    id="edit-date" 
                    type="date" 
                    value={editFormData.date}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-time">Waktu *</Label>
                  <Input 
                    id="edit-time" 
                    type="time" 
                    value={editFormData.time}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-customer">Pelanggan (Opsional)</Label>
                <Select 
                  value={editFormData.customer_id} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, customer_id: value }))}
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
                <Label htmlFor="edit-notes">Catatan</Label>
                <Textarea 
                  id="edit-notes" 
                  placeholder="Catatan tambahan" 
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleEditSubmit} 
                disabled={!editFormData.title || !editFormData.type || !editFormData.date || !editFormData.time || isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Jadwal?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus jadwal "{selectedEvent?.title}"? 
                Jadwal akan dipindahkan ke Recycle Bin dan dapat dipulihkan nanti.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Share Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Bagikan Kalender</DialogTitle>
              <DialogDescription>
                Bagikan link kalender publik ke klien atau sekolah. Mereka hanya bisa melihat tanpa bisa mengedit.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Link Kalender Publik</Label>
                <div className="flex gap-2">
                  <Input 
                    value={getShareUrl()}
                    readOnly
                    className="bg-muted"
                  />
                  <Button variant="outline" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Link ini dapat diakses oleh siapa saja yang memilikinya. Pengguna hanya dapat melihat jadwal tanpa bisa mengubah.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsShareDialogOpen(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
