import { Calendar, Camera, Palette, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleItem {
  id: string;
  title: string;
  school: string;
  date: string;
  time: string;
  type: "meeting" | "photo" | "design" | "print";
}

const typeConfig = {
  meeting: { icon: Calendar, className: "bg-primary/10 text-primary", label: "Meeting" },
  photo: { icon: Camera, className: "bg-success/10 text-success", label: "Foto" },
  design: { icon: Palette, className: "bg-warning/10 text-warning", label: "Desain" },
  print: { icon: Printer, className: "bg-info/10 text-info", label: "Cetak" },
};

const mockSchedule: ScheduleItem[] = [
  { id: "1", title: "Meeting Proposal", school: "SMA Negeri 1 Jakarta", date: "16 Jan", time: "10:00", type: "meeting" },
  { id: "2", title: "Pemotretan Kelas XII", school: "SMP Islam Al-Azhar", date: "17 Jan", time: "08:00", type: "photo" },
  { id: "3", title: "Deadline Layout", school: "SD Tarakanita", date: "18 Jan", time: "23:59", type: "design" },
  { id: "4", title: "Kirim ke Percetakan", school: "SMA Gonzaga", date: "20 Jan", time: "09:00", type: "print" },
];

export function UpcomingSchedule() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">Jadwal Mendatang</h3>
        <p className="text-sm text-muted-foreground">Agenda 7 hari ke depan</p>
      </div>
      <div className="divide-y divide-border">
        {mockSchedule.map((item) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.className)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.school}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">{item.date}</p>
                <p className="text-sm text-muted-foreground">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border px-6 py-3">
        <button className="text-sm font-medium text-primary hover:underline">
          Lihat Kalender →
        </button>
      </div>
    </div>
  );
}
