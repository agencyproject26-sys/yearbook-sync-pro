import { useState } from "react";
import { Search, Filter, FileText, Link, FolderOpen, Mail, Loader2, Eye, ExternalLink, Trash2, FileTextIcon, Pencil, MessageCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrders, type OrderFormData, type Order, type DesignStatus } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";

const statusConfig = {
  proses: { label: "Proses", className: "bg-info/15 text-info" },
  desain: { label: "Desain", className: "bg-warning/15 text-warning" },
  cetak: { label: "Cetak", className: "bg-accent/15 text-accent" },
  selesai: { label: "Selesai", className: "bg-success/15 text-success" },
};

const designStatusConfig: Record<DesignStatus, { label: string; className: string }> = {
  belum_mulai: { label: "Belum Mulai", className: "bg-muted text-muted-foreground" },
  proses: { label: "Proses", className: "bg-info/15 text-info" },
  review: { label: "Review", className: "bg-warning/15 text-warning" },
  selesai: { label: "Selesai", className: "bg-success/15 text-success" },
};


const emptyFormData: OrderFormData = {
  customer_id: "",
  value: 0,
  wa_desc: "",
  notes: "",
};

export default function Order() {
  const { orders, loading, addOrder, updateOrder, deleteOrder } = useOrders();
  const { customers } = useCustomers();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit dialogs
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isWaGroupDialogOpen, setIsWaGroupDialogOpen] = useState(false);
  const [waGroupLink, setWaGroupLink] = useState("");
  const [isGmailDialogOpen, setIsGmailDialogOpen] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [isSpreadsheetDialogOpen, setIsSpreadsheetDialogOpen] = useState(false);
  const [spreadsheetLink, setSpreadsheetLink] = useState("");
  const [isDriveDialogOpen, setIsDriveDialogOpen] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [docLink, setDocLink] = useState("");
  const [isLinkSubmitting, setIsLinkSubmitting] = useState(false);
  
  // View/Edit dialog for order
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editOrderData, setEditOrderData] = useState<{status: Order["status"]; wa_desc: string; notes: string; value: number}>({status: "proses", wa_desc: "", notes: "", value: 0});
  
  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customers?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  

  const handleSubmit = async () => {
    if (!formData.customer_id || !formData.value) return;
    
    setIsSubmitting(true);
    const success = await addOrder(formData);
    setIsSubmitting(false);
    
    if (success) {
      setFormData(emptyFormData);
      setIsDialogOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setFormData(emptyFormData);
  };


  // WhatsApp Group Dialog handlers
  const handleOpenWaGroupDialog = (order: Order) => {
    setEditingOrder(order);
    setWaGroupLink(order.wa_group_link || "");
    setIsWaGroupDialogOpen(true);
  };

  const handleSaveWaGroupLink = async () => {
    if (!editingOrder) return;
    setIsLinkSubmitting(true);
    await updateOrder(editingOrder.id, { wa_group_link: waGroupLink || null });
    setIsLinkSubmitting(false);
    setIsWaGroupDialogOpen(false);
    setEditingOrder(null);
  };

  // Gmail Dialog handlers
  const handleOpenGmailDialog = (order: Order) => {
    setEditingOrder(order);
    setGmailEmail(order.gmail_email || "");
    setIsGmailDialogOpen(true);
  };

  const handleGmailClick = (order: Order) => {
    // If email exists, open Gmail login directly
    if (order.gmail_email) {
      window.open("https://mail.google.com", "_blank");
    } else {
      handleOpenGmailDialog(order);
    }
  };

  const handleSaveGmail = async () => {
    if (!editingOrder) return;
    setIsLinkSubmitting(true);
    await updateOrder(editingOrder.id, { gmail_email: gmailEmail || null });
    setIsLinkSubmitting(false);
    setIsGmailDialogOpen(false);
    setEditingOrder(null);
  };

  // Spreadsheet Dialog handlers
  const handleOpenSpreadsheetDialog = (order: Order) => {
    setEditingOrder(order);
    setSpreadsheetLink(order.spreadsheet_link || "");
    setIsSpreadsheetDialogOpen(true);
  };

  const handleSaveSpreadsheetLink = async () => {
    if (!editingOrder) return;
    setIsLinkSubmitting(true);
    await updateOrder(editingOrder.id, { spreadsheet_link: spreadsheetLink || null, has_spreadsheet: !!spreadsheetLink });
    setIsLinkSubmitting(false);
    setIsSpreadsheetDialogOpen(false);
    setEditingOrder(null);
  };

  // Drive Dialog handlers
  const handleOpenDriveDialog = (order: Order) => {
    setEditingOrder(order);
    setDriveLink(order.drive_link || "");
    setIsDriveDialogOpen(true);
  };

  const handleSaveDriveLink = async () => {
    if (!editingOrder) return;
    setIsLinkSubmitting(true);
    await updateOrder(editingOrder.id, { drive_link: driveLink || null, has_drive: !!driveLink });
    setIsLinkSubmitting(false);
    setIsDriveDialogOpen(false);
    setEditingOrder(null);
  };

  // Google Doc Dialog handlers
  const handleOpenDocDialog = (order: Order) => {
    setEditingOrder(order);
    setDocLink(order.google_doc_link || "");
    setIsDocDialogOpen(true);
  };

  const handleSaveDocLink = async () => {
    if (!editingOrder) return;
    setIsLinkSubmitting(true);
    await updateOrder(editingOrder.id, { google_doc_link: docLink || null });
    setIsLinkSubmitting(false);
    setIsDocDialogOpen(false);
    setEditingOrder(null);
  };

  // Design Cover Dialog
  const [isDesignCoverDialogOpen, setIsDesignCoverDialogOpen] = useState(false);
  const [designCoverLink, setDesignCoverLink] = useState("");

  const handleOpenDesignCoverDialog = (order: Order) => {
    setEditingOrder(order);
    setDesignCoverLink(order.design_cover_link || "");
    setIsDesignCoverDialogOpen(true);
  };

  const handleSaveDesignCoverLink = async () => {
    if (!editingOrder) return;
    setIsLinkSubmitting(true);
    await updateOrder(editingOrder.id, { design_cover_link: designCoverLink || null });
    setIsLinkSubmitting(false);
    setIsDesignCoverDialogOpen(false);
    setEditingOrder(null);
  };

  // Design Isi Dialog
  const [isDesignIsiDialogOpen, setIsDesignIsiDialogOpen] = useState(false);
  const [designIsiLink, setDesignIsiLink] = useState("");

  const handleOpenDesignIsiDialog = (order: Order) => {
    setEditingOrder(order);
    setDesignIsiLink(order.design_isi_link || "");
    setIsDesignIsiDialogOpen(true);
  };

  const handleSaveDesignIsiLink = async () => {
    if (!editingOrder) return;
    setIsLinkSubmitting(true);
    await updateOrder(editingOrder.id, { design_isi_link: designIsiLink || null });
    setIsLinkSubmitting(false);
    setIsDesignIsiDialogOpen(false);
    setEditingOrder(null);
  };

  // Design Packaging Dialog
  const [isDesignPackagingDialogOpen, setIsDesignPackagingDialogOpen] = useState(false);
  const [designPackagingLink, setDesignPackagingLink] = useState("");

  const handleOpenDesignPackagingDialog = (order: Order) => {
    setEditingOrder(order);
    setDesignPackagingLink(order.design_packaging_link || "");
    setIsDesignPackagingDialogOpen(true);
  };

  const handleSaveDesignPackagingLink = async () => {
    if (!editingOrder) return;
    setIsLinkSubmitting(true);
    await updateOrder(editingOrder.id, { design_packaging_link: designPackagingLink || null });
    setIsLinkSubmitting(false);
    setIsDesignPackagingDialogOpen(false);
    setEditingOrder(null);
  };

  // View Order handlers
  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
    setIsViewDialogOpen(true);
  };

  // Edit Order handlers
  const handleEditOrder = (order: Order) => {
    setViewingOrder(order);
    setEditOrderData({
      status: order.status,
      wa_desc: order.wa_desc || "",
      notes: order.notes || "",
      value: order.value
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEditOrder = async () => {
    if (!viewingOrder) return;
    setIsLinkSubmitting(true);
    await updateOrder(viewingOrder.id, editOrderData);
    setIsLinkSubmitting(false);
    setIsEditDialogOpen(false);
    setViewingOrder(null);
  };

  const openExternalLink = (url: string) => {
    window.open(url, "_blank");
  };

  // Delete handlers
  const handleOpenDeleteDialog = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    await deleteOrder(orderToDelete.id);
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header
        title="Order"
        subtitle="Kelola order dan proyek buku tahunan"
        showAddButton
        addButtonLabel="Buat Order"
        onAddClick={() => setIsDialogOpen(true)}
        showSearch={false}
        showNotifications={false}
      />

      <div className="p-6">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Order</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Sedang Proses</p>
            <p className="text-2xl font-bold text-info">{orders.filter(o => o.status === "proses").length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Tahap Desain</p>
            <p className="text-2xl font-bold text-warning">{orders.filter(o => o.status === "desain").length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Selesai</p>
            <p className="text-2xl font-bold text-success">{orders.filter(o => o.status === "selesai").length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="proses">Proses</SelectItem>
                <SelectItem value="desain">Desain</SelectItem>
                <SelectItem value="cetak">Cetak</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pelanggan</TableHead>
                
                
                <TableHead className="text-center">Grup WhatsApp</TableHead>
                <TableHead className="text-center">Design Cover</TableHead>
                <TableHead className="text-center">Design Isi</TableHead>
                <TableHead className="text-center">Design Packaging</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="w-[100px] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customers?.name}</p>
                        <p className="text-xs text-muted-foreground">{order.order_number}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenWaGroupDialog(order)}
                        >
                          <MessageCircle className="mr-1 h-3 w-3" />
                          {order.wa_group_link ? "Edit" : "Add"}
                        </Button>
                        {order.wa_group_link && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-success"
                            onClick={() => openExternalLink(order.wa_group_link!)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Select
                          value={order.design_cover_status}
                          onValueChange={(value: DesignStatus) => updateOrder(order.id, { design_cover_status: value })}
                        >
                          <SelectTrigger className="h-7 w-[110px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="belum_mulai">Belum Mulai</SelectItem>
                            <SelectItem value="proses">Proses</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="selesai">Selesai</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => handleOpenDesignCoverDialog(order)}
                          >
                            <Link className="mr-1 h-3 w-3" />
                            {order.design_cover_link ? "Edit" : "Add"}
                          </Button>
                          {order.design_cover_link && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-success"
                              onClick={() => openExternalLink(order.design_cover_link!)}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Select
                          value={order.design_isi_status}
                          onValueChange={(value: DesignStatus) => updateOrder(order.id, { design_isi_status: value })}
                        >
                          <SelectTrigger className="h-7 w-[110px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="belum_mulai">Belum Mulai</SelectItem>
                            <SelectItem value="proses">Proses</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="selesai">Selesai</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => handleOpenDesignIsiDialog(order)}
                          >
                            <Link className="mr-1 h-3 w-3" />
                            {order.design_isi_link ? "Edit" : "Add"}
                          </Button>
                          {order.design_isi_link && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-success"
                              onClick={() => openExternalLink(order.design_isi_link!)}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Select
                          value={order.design_packaging_status}
                          onValueChange={(value: DesignStatus) => updateOrder(order.id, { design_packaging_status: value })}
                        >
                          <SelectTrigger className="h-7 w-[110px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="belum_mulai">Belum Mulai</SelectItem>
                            <SelectItem value="proses">Proses</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="selesai">Selesai</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => handleOpenDesignPackagingDialog(order)}
                          >
                            <Link className="mr-1 h-3 w-3" />
                            {order.design_packaging_link ? "Edit" : "Add"}
                          </Button>
                          {order.design_packaging_link && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-success"
                              onClick={() => openExternalLink(order.design_packaging_link!)}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        {order.wa_desc && (
                          <p className="text-xs text-muted-foreground truncate" title={order.wa_desc}>
                            WA: {order.wa_desc}
                          </p>
                        )}
                        {order.notes && (
                          <p className="text-xs text-muted-foreground truncate" title={order.notes}>
                            {order.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewOrder(order)}
                          title="Lihat detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditOrder(order)}
                          title="Edit order"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleOpenDeleteDialog(order)}
                          title="Hapus order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Create Order Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Buat Order Baru</DialogTitle>
              <DialogDescription>
                Buat order baru untuk proyek buku tahunan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Pilih Pelanggan *</Label>
                  <Select value={formData.customer_id} onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih sekolah" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>


              <div className="grid gap-2">
                <Label htmlFor="notes">Catatan Internal</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan tambahan untuk order ini"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.customer_id || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MOU Dialog */}
        <Dialog open={isMouDialogOpen} onOpenChange={(open) => { setIsMouDialogOpen(open); if (!open) setEditingOrder(null); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generate MOU</DialogTitle>
              <DialogDescription>
                MOU untuk {editingOrder?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button variant="outline" className="w-full" onClick={() => openExternalLink("https://www.canva.com/design/new?template=mou")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Buka Template MOU di Canva
              </Button>
              <div className="grid gap-2">
                <Label>Link MOU (Opsional)</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://www.canva.com/design/..." 
                    value={mouLink}
                    onChange={(e) => setMouLink(e.target.value)}
                  />
                  {mouLink && (
                    <Button variant="ghost" size="icon" onClick={() => openExternalLink(mouLink)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMouDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveMouLink} disabled={isLinkSubmitting}>
                {isLinkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Gmail Dialog */}
        <Dialog open={isGmailDialogOpen} onOpenChange={(open) => { setIsGmailDialogOpen(open); if (!open) setEditingOrder(null); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Akun Gmail</DialogTitle>
              <DialogDescription>
                Akun Gmail untuk {editingOrder?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  placeholder="akun@gmail.com" 
                  value={gmailEmail}
                  onChange={(e) => setGmailEmail(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Masukkan alamat email Gmail yang digunakan untuk proyek ini.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGmailDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveGmail} disabled={isLinkSubmitting}>
                {isLinkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* WhatsApp Group Dialog */}
        <Dialog open={isWaGroupDialogOpen} onOpenChange={(open) => { setIsWaGroupDialogOpen(open); if (!open) setEditingOrder(null); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Grup WhatsApp</DialogTitle>
              <DialogDescription>
                Grup WhatsApp untuk {editingOrder?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Link Grup WhatsApp</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://chat.whatsapp.com/..." 
                    value={waGroupLink}
                    onChange={(e) => setWaGroupLink(e.target.value)}
                  />
                  {waGroupLink && (
                    <Button variant="ghost" size="icon" onClick={() => openExternalLink(waGroupLink)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsWaGroupDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveWaGroupLink} disabled={isLinkSubmitting}>
                {isLinkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Spreadsheet Dialog */}
        <Dialog open={isSpreadsheetDialogOpen} onOpenChange={(open) => { setIsSpreadsheetDialogOpen(open); if (!open) setEditingOrder(null); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Spreadsheet</DialogTitle>
              <DialogDescription>
                Spreadsheet untuk {editingOrder?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button variant="outline" className="w-full" onClick={() => openExternalLink("https://docs.google.com/spreadsheets/create")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Buat Spreadsheet Baru
              </Button>
              <div className="grid gap-2">
                <Label>Link Spreadsheet</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://docs.google.com/spreadsheets/..." 
                    value={spreadsheetLink}
                    onChange={(e) => setSpreadsheetLink(e.target.value)}
                  />
                  {spreadsheetLink && (
                    <Button variant="ghost" size="icon" onClick={() => openExternalLink(spreadsheetLink)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSpreadsheetDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveSpreadsheetLink} disabled={isLinkSubmitting}>
                {isLinkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Drive Dialog */}
        <Dialog open={isDriveDialogOpen} onOpenChange={(open) => { setIsDriveDialogOpen(open); if (!open) setEditingOrder(null); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Google Drive</DialogTitle>
              <DialogDescription>
                Folder Google Drive untuk {editingOrder?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button variant="outline" className="w-full" onClick={() => openExternalLink("https://drive.google.com/drive/my-drive")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Buka Google Drive
              </Button>
              <div className="grid gap-2">
                <Label>Link Folder Drive</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://drive.google.com/drive/folders/..." 
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                  />
                  {driveLink && (
                    <Button variant="ghost" size="icon" onClick={() => openExternalLink(driveLink)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDriveDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveDriveLink} disabled={isLinkSubmitting}>
                {isLinkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Google Doc Dialog */}
        <Dialog open={isDocDialogOpen} onOpenChange={(open) => { setIsDocDialogOpen(open); if (!open) setEditingOrder(null); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Google Document</DialogTitle>
              <DialogDescription>
                Google Document untuk {editingOrder?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button variant="outline" className="w-full" onClick={() => openExternalLink("https://docs.google.com/document/create")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Buat Dokumen Baru
              </Button>
              <div className="grid gap-2">
                <Label>Link Google Document</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://docs.google.com/document/d/..." 
                    value={docLink}
                    onChange={(e) => setDocLink(e.target.value)}
                  />
                  {docLink && (
                    <Button variant="ghost" size="icon" onClick={() => openExternalLink(docLink)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDocDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveDocLink} disabled={isLinkSubmitting}>
                {isLinkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Design Cover Dialog */}
        <Dialog open={isDesignCoverDialogOpen} onOpenChange={(open) => { setIsDesignCoverDialogOpen(open); if (!open) setEditingOrder(null); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Design Cover</DialogTitle>
              <DialogDescription>
                Link design cover untuk {editingOrder?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Link Design Cover (Opsional)</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://..." 
                    value={designCoverLink}
                    onChange={(e) => setDesignCoverLink(e.target.value)}
                  />
                  {designCoverLink && (
                    <Button variant="ghost" size="icon" onClick={() => openExternalLink(designCoverLink)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDesignCoverDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveDesignCoverLink} disabled={isLinkSubmitting}>
                {isLinkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Design Isi Dialog */}
        <Dialog open={isDesignIsiDialogOpen} onOpenChange={(open) => { setIsDesignIsiDialogOpen(open); if (!open) setEditingOrder(null); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Design Isi</DialogTitle>
              <DialogDescription>
                Link design isi untuk {editingOrder?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Link Design Isi (Opsional)</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://..." 
                    value={designIsiLink}
                    onChange={(e) => setDesignIsiLink(e.target.value)}
                  />
                  {designIsiLink && (
                    <Button variant="ghost" size="icon" onClick={() => openExternalLink(designIsiLink)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDesignIsiDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveDesignIsiLink} disabled={isLinkSubmitting}>
                {isLinkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Design Packaging Dialog */}
        <Dialog open={isDesignPackagingDialogOpen} onOpenChange={(open) => { setIsDesignPackagingDialogOpen(open); if (!open) setEditingOrder(null); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Design Packaging</DialogTitle>
              <DialogDescription>
                Link design packaging untuk {editingOrder?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Link Design Packaging (Opsional)</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://..." 
                    value={designPackagingLink}
                    onChange={(e) => setDesignPackagingLink(e.target.value)}
                  />
                  {designPackagingLink && (
                    <Button variant="ghost" size="icon" onClick={() => openExternalLink(designPackagingLink)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDesignPackagingDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveDesignPackagingLink} disabled={isLinkSubmitting}>
                {isLinkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Order Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={(open) => { setIsViewDialogOpen(open); if (!open) setViewingOrder(null); }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detail Order</DialogTitle>
              <DialogDescription>
                {viewingOrder?.order_number} - {viewingOrder?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pelanggan</p>
                  <p className="font-medium">{viewingOrder?.customers?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusConfig[viewingOrder?.status || "proses"].className}>
                    {statusConfig[viewingOrder?.status || "proses"].label}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Dibuat</p>
                <p className="font-medium">{viewingOrder?.created_at ? new Date(viewingOrder.created_at).toLocaleDateString("id-ID") : "-"}</p>
              </div>
              {viewingOrder?.gmail_email && (
                <div>
                  <p className="text-sm text-muted-foreground">Akun Gmail</p>
                  <p className="font-medium">{viewingOrder.gmail_email}</p>
                </div>
              )}
              {viewingOrder?.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Catatan</p>
                  <p className="text-sm">{viewingOrder.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Order Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setViewingOrder(null); }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
              <DialogDescription>
                {viewingOrder?.order_number} - {viewingOrder?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={editOrderData.status} onValueChange={(value: Order["status"]) => setEditOrderData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proses">Proses</SelectItem>
                      <SelectItem value="desain">Desain</SelectItem>
                      <SelectItem value="cetak">Cetak</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Catatan Internal</Label>
                <Textarea
                  rows={2}
                  value={editOrderData.notes}
                  onChange={(e) => setEditOrderData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveEditOrder} disabled={isLinkSubmitting}>
                {isLinkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Order</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus order "{orderToDelete?.order_number}" untuk {orderToDelete?.customers?.name}? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete} 
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}