import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Shield, Crown, UserCog, Calendar } from "lucide-react";

type AppRole = 'admin' | 'owner' | 'staff' | 'calendar_only';

const roleConfig: Record<AppRole, { label: string; icon: typeof Shield; color: string; description: string }> = {
  admin: { 
    label: "Admin", 
    icon: Shield, 
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    description: "Akses penuh ke semua fitur dan manajemen user"
  },
  owner: { 
    label: "Owner", 
    icon: Crown, 
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Akses ke data finansial dan pengaturan perusahaan"
  },
  staff: { 
    label: "Staff", 
    icon: UserCog, 
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "Akses ke CRM (pelanggan, order, invoice, pembayaran)"
  },
  calendar_only: { 
    label: "Kalender Only", 
    icon: Calendar, 
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Hanya akses ke menu kalender"
  },
};

export function RoleLegendCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Daftar Role & Hak Akses
        </CardTitle>
        <CardDescription>
          Penjelasan setiap role dan akses yang diberikan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(roleConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className={`rounded-lg border p-4 ${config.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5" />
                  <span className="font-semibold">{config.label}</span>
                </div>
                <p className="text-sm opacity-80">{config.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
