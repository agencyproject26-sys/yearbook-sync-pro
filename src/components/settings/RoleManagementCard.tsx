import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Shield, Calendar, Crown, UserCog, Loader2, Plus, Trash2 } from "lucide-react";

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

export function RoleManagementCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState<AppRole | "">("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; role: AppRole } | null>(null);

  // Fetch users with roles (approved users only)
  const { data: usersWithRoles = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['all-users-roles'],
    queryFn: async () => {
      // Get all approved profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email')
        .eq('is_approved', true);
      
      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;
      
      // Group roles by user
      const roleMap = new Map<string, AppRole[]>();
      roles?.forEach(r => {
        const userRoles = roleMap.get(r.user_id) || [];
        userRoles.push(r.role as AppRole);
        roleMap.set(r.user_id, userRoles);
      });
      
      // Create user list from approved profiles
      const result: UserWithRoles[] = profiles?.map(p => ({
        id: p.user_id,
        email: p.email,
        roles: roleMap.get(p.user_id) || []
      })) || [];
      
      return result;
    }
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manajemen Role Pengguna
          </CardTitle>
          <CardDescription>
            Tambah atau hapus role untuk setiap pengguna yang sudah di-approve
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : usersWithRoles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada user yang sudah di-approve
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
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
                        {u.roles.length === 0 ? (
                          <span className="text-muted-foreground text-sm">Belum ada role</span>
                        ) : (
                          u.roles.map((role) => (
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
                          ))
                        )}
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
    </>
  );
}

export { roleConfig };
