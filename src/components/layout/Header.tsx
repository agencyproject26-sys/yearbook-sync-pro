import { Bell, Search, Plus, FileText, CreditCard, Package, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAddClick?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
}

const notifIcon: Record<Notification["type"], React.ReactNode> = {
  invoice_overdue: <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />,
  invoice_due_soon: <Clock className="h-4 w-4 text-yellow-500 shrink-0" />,
  payment_received: <CreditCard className="h-4 w-4 text-green-500 shrink-0" />,
  order_status: <Package className="h-4 w-4 text-primary shrink-0" />,
};

export function Header({ 
  title, 
  subtitle, 
  showAddButton, 
  addButtonLabel = "Tambah Baru",
  onAddClick,
  showSearch = true,
  showNotifications = true
}: HeaderProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotifClick = (notif: Notification) => {
    markAsRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    if (days < 7) return `${days} hari lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-card px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showSearch && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari..."
              className="w-64 pl-9"
            />
          </div>
        )}

        {showNotifications && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">Notifikasi</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs text-muted-foreground" onClick={markAllAsRead}>
                    Tandai semua dibaca
                  </Button>
                )}
              </div>
              <ScrollArea className="max-h-80">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Tidak ada notifikasi</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.slice(0, 20).map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                          !notif.read && "bg-primary/5"
                        )}
                      >
                        <div className="mt-0.5">{notifIcon[notif.type]}</div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm", !notif.read ? "font-semibold text-foreground" : "text-muted-foreground")}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{notif.description}</p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5">{formatDate(notif.date)}</p>
                        </div>
                        {!notif.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )}

        {showAddButton && (
          <Button onClick={onAddClick} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{addButtonLabel}</span>
          </Button>
        )}
      </div>
    </header>
  );
}
