import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserPlus, Loader2, Check, X, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  is_approved: boolean;
  created_at: string;
}

export function PendingUsersCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectConfirm, setRejectConfirm] = useState<Profile | null>(null);

  // Fetch pending users
  const { data: pendingUsers = [], isLoading } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Profile[];
    }
  });

  // Approve user mutation - calls edge function to confirm email + approve
  const approveMutation = useMutation({
    mutationFn: async (profile: Profile) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error("Not authenticated");
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ user_id: profile.user_id })
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to approve user");
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-users-roles'] });
      toast({ title: "User berhasil di-approve", description: "User sekarang bisa login" });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal approve user",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Reject user mutation (delete profile and auth user via edge function would be needed)
  // For now, we just mark as rejected or admin can manually handle
  const rejectMutation = useMutation({
    mutationFn: async (profile: Profile) => {
      // Delete the profile (the auth user remains but can't access app)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      toast({ title: "User berhasil ditolak" });
      setRejectConfirm(null);
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menolak user",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Pendaftaran Akun Baru
            {pendingUsers.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingUsers.length} pending
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Approve atau tolak akun yang baru mendaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Tidak ada pendaftaran yang menunggu approval</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.email}
                      {profile.full_name && (
                        <span className="text-muted-foreground text-sm block">
                          {profile.full_name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(profile.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => approveMutation.mutate(profile)}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setRejectConfirm(profile)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject Confirmation Dialog */}
      <Dialog open={!!rejectConfirm} onOpenChange={() => setRejectConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pendaftaran</DialogTitle>
            <DialogDescription>
              Yakin ingin menolak pendaftaran dari <strong>{rejectConfirm?.email}</strong>? 
              User ini tidak akan bisa mengakses aplikasi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectConfirm(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectConfirm && rejectMutation.mutate(rejectConfirm)}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
