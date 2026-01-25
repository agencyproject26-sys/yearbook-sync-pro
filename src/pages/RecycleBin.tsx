import { useState } from "react";
import { Trash2, RotateCcw, Loader2, Users, Package, FileText, Receipt, Calendar, Wallet, AlertTriangle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useRecycleBin, type DeletedItem } from "@/hooks/useRecycleBin";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const typeConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  customer: { label: "Pelanggan", icon: Users, className: "bg-blue-500/15 text-blue-500" },
  order: { label: "Order", icon: Package, className: "bg-green-500/15 text-green-500" },
  invoice: { label: "Invoice", icon: FileText, className: "bg-purple-500/15 text-purple-500" },
  payment: { label: "Pembayaran", icon: Receipt, className: "bg-orange-500/15 text-orange-500" },
  calendar_event: { label: "Jadwal", icon: Calendar, className: "bg-cyan-500/15 text-cyan-500" },
  salary: { label: "Gaji", icon: Wallet, className: "bg-pink-500/15 text-pink-500" },
};

export default function RecycleBin() {
  const { deletedItems, loading, restoreItem, permanentDelete, emptyRecycleBin } = useRecycleBin();
  const [selectedItem, setSelectedItem] = useState<DeletedItem | null>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEmptyDialogOpen, setIsEmptyDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRestore = async () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    await restoreItem(selectedItem);
    setIsProcessing(false);
    setIsRestoreDialogOpen(false);
    setSelectedItem(null);
  };

  const handlePermanentDelete = async () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    await permanentDelete(selectedItem);
    setIsProcessing(false);
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleEmptyRecycleBin = async () => {
    setIsProcessing(true);
    await emptyRecycleBin();
    setIsProcessing(false);
    setIsEmptyDialogOpen(false);
  };

  const formatDeletedAt = (dateString: string) => {
    return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: id });
  };

  if (loading) {
    return (
      <MainLayout>
        <Header 
          title="Recycle Bin" 
          subtitle="Pulihkan data yang telah dihapus"
          showSearch={false}
          showNotifications={false}
        />
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header 
        title="Recycle Bin" 
        subtitle="Pulihkan data yang telah dihapus"
        showSearch={false}
        showNotifications={false}
      />

      <div className="p-6">
        {/* Empty Recycle Bin Button */}
        {deletedItems.length > 0 && (
          <div className="mb-4 flex justify-end">
            <Button 
              variant="destructive" 
              onClick={() => setIsEmptyDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Kosongkan Recycle Bin
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border border-border bg-card">
          {deletedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Trash2 className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Recycle Bin kosong</p>
              <p className="text-sm">Tidak ada data yang dihapus</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Dihapus Pada</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deletedItems.map((item) => {
                  const config = typeConfig[item.type];
                  const IconComponent = config.icon;
                  return (
                    <TableRow key={`${item.type}-${item.id}`}>
                      <TableCell>
                        <Badge variant="secondary" className={config.className}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDeletedAt(item.deleted_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsRestoreDialogOpen(true);
                            }}
                            className="gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Pulihkan
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Hapus Permanen
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Restore Dialog */}
      <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pulihkan Data</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin memulihkan "{selectedItem?.name}"? 
              Data akan dikembalikan ke daftar utama.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memulihkan...
                </>
              ) : (
                "Pulihkan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Hapus Permanen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "{selectedItem?.name}" secara permanen? 
              <strong className="text-destructive"> Tindakan ini tidak dapat dibatalkan.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePermanentDelete} 
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus Permanen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty Recycle Bin Dialog */}
      <AlertDialog open={isEmptyDialogOpen} onOpenChange={setIsEmptyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Kosongkan Recycle Bin
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus semua {deletedItems.length} item di recycle bin secara permanen? 
              <strong className="text-destructive"> Tindakan ini tidak dapat dibatalkan.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEmptyRecycleBin} 
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengosongkan...
                </>
              ) : (
                "Kosongkan Semua"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
