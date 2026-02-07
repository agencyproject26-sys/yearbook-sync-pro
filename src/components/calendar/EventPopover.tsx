import { useState } from "react";
import { Pencil, Trash2, X, Camera, Palette, Printer, Users, Clock, Calendar, User, FileText, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import { CalendarEvent, EventFormData } from "@/hooks/useCalendarEvents";
import { useAuth } from "@/hooks/useAuth";

interface Customer {
  id: string;
  name: string;
}

interface EventPopoverProps {
  event: CalendarEvent;
  customers: Customer[];
  onUpdate: (id: string, data: EventFormData) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  children: React.ReactNode;
  readOnly?: boolean;
}

const typeConfig = {
  meeting: { icon: Users, label: "Meeting", className: "bg-primary/15 text-primary" },
  photo: { icon: Camera, label: "Pemotretan", className: "bg-success/15 text-success" },
  design: { icon: Palette, label: "Desain", className: "bg-warning/15 text-warning" },
  print: { icon: Printer, label: "Cetak", className: "bg-info/15 text-info" },
};

export function EventPopover({ event, customers, onUpdate, onDelete, children, readOnly = false }: EventPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: event.title,
    type: event.type,
    date: event.date,
    time: event.time,
    customer_id: event.customer_id || "",
    notes: event.notes || "",
  });

  const config = typeConfig[event.type];
  const Icon = config.icon;

  const handleStartEdit = () => {
    setFormData({
      title: event.title,
      type: event.type,
      date: event.date,
      time: event.time,
      customer_id: event.customer_id || "",
      notes: event.notes || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      title: event.title,
      type: event.type,
      date: event.date,
      time: event.time,
      customer_id: event.customer_id || "",
      notes: event.notes || "",
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.type || !formData.date || !formData.time) {
      return;
    }

    setIsSubmitting(true);
    const success = await onUpdate(event.id, formData);
    setIsSubmitting(false);

    if (success) {
      setIsEditing(false);
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const success = await onDelete(event.id);
    setIsSubmitting(false);

    if (success) {
      setIsDeleteDialogOpen(false);
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setIsEditing(false);
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
          {children}
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0" 
          align="start" 
          side="right"
          onClick={(e) => e.stopPropagation()}
        >
          {isEditing ? (
            // Edit Mode
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Edit Jadwal</h4>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-title" className="text-xs">Judul</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-9"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-type" className="text-xs">Tipe</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "meeting" | "photo" | "design" | "print") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger id="edit-type" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Meeting
                        </div>
                      </SelectItem>
                      <SelectItem value="photo">
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          Pemotretan
                        </div>
                      </SelectItem>
                      <SelectItem value="design">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Desain
                        </div>
                      </SelectItem>
                      <SelectItem value="print">
                        <div className="flex items-center gap-2">
                          <Printer className="h-4 w-4" />
                          Cetak
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="edit-date" className="text-xs">Tanggal</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-time" className="text-xs">Waktu</Label>
                    <Input
                      id="edit-time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="h-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-customer" className="text-xs">Pelanggan</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                  >
                    <SelectTrigger id="edit-customer" className="h-9">
                      <SelectValue placeholder="Pilih pelanggan (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-notes" className="text-xs">Catatan</Label>
                  <Textarea
                    id="edit-notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  Batal
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-1 h-4 w-4" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              {/* Header with colored bar */}
              <div className={cn("h-2 rounded-t-md", config.className.replace("/15", ""))} />
              
              <div className="p-4 space-y-3">
                {/* Title and actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", config.className)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold leading-tight">{event.title}</h4>
                      <span className={cn("text-xs font-medium", config.className)}>{config.label}</span>
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleStartEdit}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive" 
                        onClick={() => setIsDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(event.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  {event.customers?.name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{event.customers.name}</span>
                    </div>
                  )}
                  {event.notes && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4 mt-0.5" />
                      <span className="line-clamp-3">{event.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jadwal?</AlertDialogTitle>
            <AlertDialogDescription>
              Jadwal "{event.title}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
