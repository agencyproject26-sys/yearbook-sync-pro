import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { PendingUsersCard } from "@/components/settings/PendingUsersCard";
import { RoleManagementCard } from "@/components/settings/RoleManagementCard";
import { RoleLegendCard } from "@/components/settings/RoleLegendCard";
import { DataMigrationCard } from "@/components/settings/DataMigrationCard";

export default function Pengaturan() {
  const { hasRole } = useAuth();

  // Check if current user is admin
  const isAdmin = hasRole('admin');

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
            <p className="text-muted-foreground">Kelola role dan hak akses pengguna</p>
          </div>
        </div>

        {/* Role Legend */}
        <RoleLegendCard />

        {/* Pending Users / New Registrations */}
        <PendingUsersCard />

        {/* Role Management */}
        <RoleManagementCard />

        {/* Data Migration */}
        <DataMigrationCard />
      </div>
    </MainLayout>
  );
}
