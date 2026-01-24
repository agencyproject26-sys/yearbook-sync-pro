import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAddClick?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
}

export function Header({ 
  title, 
  subtitle, 
  showAddButton, 
  addButtonLabel = "Tambah Baru",
  onAddClick,
  showSearch = true,
  showNotifications = true
}: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border bg-card px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
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

        {/* Notifications */}
        {showNotifications && (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              3
            </span>
          </Button>
        )}

        {/* Add Button */}
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
