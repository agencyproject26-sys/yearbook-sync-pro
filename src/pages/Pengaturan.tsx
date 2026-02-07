import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Shield, Calendar, Crown, UserCog, Loader2, Plus, Trash2, Settings } from "lucide-react";
import { Navigate } from "react-router-dom";

type AppRole = 'admin' | 'owner' | 'staff' | 'calendar_only';

interface UserWithRoles {
  id: string;
  email: string;
  roles: AppRole[];
}

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

export default function Pengaturan() {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState<AppRole | "">("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; role: AppRole } | null>(null);

  // Check if current user is admin
  const isAdmin = hasRole('admin');

  // Fetch users directly with roles
  const { data: usersWithRoles = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['all-users-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (error) throw error;
      
      // Group roles by user
      const userMap = new Map<string, AppRole[]>();
      data?.forEach(r => {
        const roles = userMap.get(r.user_id) || [];
        roles.push(r.role as AppRole);
        userMap.set(r.user_id, roles);
      });
      
      // Get unique user IDs and create user list
      const result: UserWithRoles[] = [];
      
      // Add users with roles
      userMap.forEach((roles, id) => {
        result.push({
          id,
          email: id === user?.id ? (user?.email || 'Current User') : `User: ${id.substring(0, 8)}...`,
          roles
        });
      });
      
      // Mark current user's email
      if (user?.id && userMap.has(user.id)) {
        const idx = result.findIndex(u => u.id === user.id);
        if (idx >= 0) {
          result[idx].email = user.email || result[idx].email;
        }
      }
      
      return result;
    },
    enabled: isAdmin
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users-roles'] });
      toast({ title: "Role berhasil ditambahkan" });
      setIsAddRoleOpen(false);
      setNewRole("");
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Gagal menambahkan role", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users-roles'] });
      toast({ title: "Role berhasil dihapus" });
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Gagal menghapus role", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleAddRole = () => {
    if (selectedUser && newRole) {
      addRoleMutation.mutate({ userId: selectedUser.id, role: newRole as AppRole });
    }
  };

  const handleRemoveRole = () => {
    if (deleteConfirm) {
      removeRoleMutation.mutate(deleteConfirm);
    }
  };

  const getRoleBadge = (role: AppRole) => {
    const config = roleConfig[role];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

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

        {/* Users & Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manajemen Role Pengguna
            </CardTitle>
            <CardDescription>
              Tambah atau hapus role untuk setiap pengguna
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : usersWithRoles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada user dengan role yang terdaftar
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email / User ID</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersWithRoles.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.email}
                        {u.id === user?.id && (
                          <Badge variant="secondary" className="ml-2">Anda</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {u.roles.map((role) => (
                            <div key={role} className="flex items-center gap-1">
                              {getRoleBadge(role)}
                              {/* Don't allow admin to remove their own admin role */}
                              {!(u.id === user?.id && role === 'admin') && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteConfirm({ userId: u.id, role })}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(u);
                            setIsAddRoleOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Tambah Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Role Dialog */}
        <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Role</DialogTitle>
              <DialogDescription>
                Tambahkan role baru untuk {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleConfig)
                    .filter(([key]) => !selectedUser?.roles.includes(key as AppRole))
                    .map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleAddRole} 
                disabled={!newRole || addRoleMutation.isPending}
              >
                {addRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Tambah
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Role</DialogTitle>
              <DialogDescription>
                Yakin ingin menghapus role {deleteConfirm?.role}? User tidak akan bisa mengakses fitur yang terkait dengan role ini.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Batal
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRemoveRole}
                disabled={removeRoleMutation.isPending}
              >
                {removeRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
