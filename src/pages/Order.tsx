import { useState } from "react";
import { Search, Filter, FileText, Link, FolderOpen, Mail, Loader2, Eye, ExternalLink, Trash2, FileTextIcon, Pencil, MessageCircle, ChevronsUpDown, Check } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
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
import { useOrders, type OrderFormData, type Order, type DesignStatus, type CetakStatus } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";

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

const cetakStatusConfig: Record<CetakStatus, { label: string; className: string }> = {
  belum: { label: "Belum", className: "bg-muted text-muted-foreground" },
  proses: { label: "Proses", className: "bg-info/15 text-info" },
  selesai: { label: "Selesai", className: "bg-success/15 text-success" },
};


const emptyFormData: OrderFormData = {
  customer_id: "",
  order_number: "",
  value: 0,
  wa_desc: "",
  notes: "",
};

export default function Order() {
  const { orders, loading, addOrder, updateOrder, deleteOrder } = useOrders();
  const { customers } = useCustomers();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>(() => ({ ...emptyFormData }));
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
  const [editOrderData, setEditOrderData] = useState<{status: Order["status"]; order_number: string; wa_desc: string; notes: string; value: number; shipping_date: string}>({status: "proses", order_number: "", wa_desc: "", notes: "", value: 0, shipping_date: ""});
  
  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.customers?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.order_number.localeCompare(b.order_number, undefined, { numeric: true }));

  

  const handleSubmit = async () => {
    if (!formData.customer_id) {
      toast({
        title: "Pelanggan wajib dipilih",
        description: "Silakan pilih pelanggan terlebih dahulu sebelum membuat order.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const success = await addOrder(formData);
    setIsSubmitting(false);
    
    if (success) {
      setFormData({ ...emptyFormData });
      setIsDialogOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setFormData({ ...emptyFormData });
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
      order_number: order.order_number,
      wa_desc: order.wa_desc || "",
      notes: order.notes || "",
      value: order.value,
      shipping_date: (order as any).shipping_date || "",
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
                <TableHead className="text-center">Cetak Cover</TableHead>
                <TableHead className="text-center">Cetak Isi</TableHead>
                <TableHead className="text-center">Cetak Packaging</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="w-[100px] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const shippingDate = (order as any).shipping_date ? new Date((order as any).shipping_date) : null;
                const now = new Date();
                const oneMonthBefore = shippingDate ? new Date(shippingDate.getTime() - 30 * 24 * 60 * 60 * 1000) : null;
                const isCompleted = order.status === "selesai";
                const isOverdue = !isCompleted && shippingDate && now > shippingDate;
                const isWarning = !isCompleted && shippingDate && !isOverdue && oneMonthBefore && now >= oneMonthBefore;

                const nameBg = isCompleted
                  ? "bg-emerald-500/15 border-emerald-500/30"
                  : isOverdue
                  ? "bg-destructive/15 border-destructive/30"
                  : isWarning
                  ? "bg-warning/15 border-warning/30"
                  : "";

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className={cn("rounded-md px-2 py-1", nameBg)}>
                        <p className={cn("font-medium", isOverdue ? "text-destructive" : isWarning ? "text-warning" : "")}>{order.customers?.name}</p>
                        <p className="text-xs text-muted-foreground">{order.order_number}</p>
                        {shippingDate && (
                          <p className={cn("text-[10px] mt-0.5", isOverdue ? "text-destructive" : isWarning ? "text-warning" : "text-muted-foreground")}>
                            📦 {shippingDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            {isOverdue && " — Terlambat!"}
                            {isWarning && " — Segera kirim!"}
                          </p>
                        )}
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
                    <TableCell className="text-center">
                      <Select
                        value={order.cetak_cover_status || "belum"}
                        onValueChange={(value: CetakStatus) => updateOrder(order.id, { cetak_cover_status: value } as any)}
                      >
                        <SelectTrigger className="h-7 w-[90px] text-xs mx-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="belum">Belum</SelectItem>
                          <SelectItem value="proses">Proses</SelectItem>
                          <SelectItem value="selesai">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <Select
                        value={order.cetak_isi_status || "belum"}
                        onValueChange={(value: CetakStatus) => updateOrder(order.id, { cetak_isi_status: value } as any)}
                      >
                        <SelectTrigger className="h-7 w-[90px] text-xs mx-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="belum">Belum</SelectItem>
                          <SelectItem value="proses">Proses</SelectItem>
                          <SelectItem value="selesai">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <Select
                        value={order.cetak_packaging_status || "belum"}
                        onValueChange={(value: CetakStatus) => updateOrder(order.id, { cetak_packaging_status: value } as any)}
                      >
                        <SelectTrigger className="h-7 w-[90px] text-xs mx-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="belum">Belum</SelectItem>
                          <SelectItem value="proses">Proses</SelectItem>
                          <SelectItem value="selesai">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className={cn("w-full justify-between font-normal", !formData.customer_id && "text-muted-foreground")}>
                        {formData.customer_id
                          ? customers.find(c => c.id === formData.customer_id)?.name
                          : "Ketik atau pilih pelanggan..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full min-w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Cari pelanggan..." />
                        <CommandList>
                          <CommandEmpty>Pelanggan tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {[...customers].sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                              <CommandItem key={c.id} value={c.name} onSelect={() => setFormData(prev => ({ ...prev, customer_id: c.id }))}>
                                <Check className={cn("mr-2 h-4 w-4", formData.customer_id === c.id ? "opacity-100" : "opacity-0")} />
                                {c.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="order_number">Nomor Order</Label>
                  <Input
                    id="order_number"
                    placeholder="Otomatis jika kosong (ORD-2026-001)"
                    value={formData.order_number || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_number: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Kosongkan untuk generate otomatis</p>
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
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat Order
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
          <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Order</DialogTitle>
              <DialogDescription>
                {viewingOrder?.order_number} - {viewingOrder?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            {viewingOrder && (
              <div className="grid gap-5 py-4">
                {/* Informasi Umum */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-1">Informasi Umum</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Nomor Order</p>
                      <p className="text-sm font-medium">{viewingOrder.order_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={statusConfig[viewingOrder.status].className}>
                        {statusConfig[viewingOrder.status].label}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pelanggan</p>
                      <p className="text-sm font-medium">{viewingOrder.customers?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">PIC Pelanggan</p>
                      <p className="text-sm font-medium">{viewingOrder.customers?.pic_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nilai Order</p>
                      <p className="text-sm font-medium">{viewingOrder.value ? `Rp ${viewingOrder.value.toLocaleString("id-ID")}` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tanggal Pengiriman</p>
                      <p className="text-sm font-medium">
                        {(viewingOrder as any).shipping_date
                          ? new Date((viewingOrder as any).shipping_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Terakhir Diperbarui</p>
                      <p className="text-sm font-medium">{new Date(viewingOrder.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                  </div>
                </div>

                {/* Kelengkapan Dokumen */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-1">Kelengkapan Dokumen</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Grup WA</span>
                      </div>
                      {viewingOrder.wa_group_link ? (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => openExternalLink(viewingOrder.wa_group_link!)}>
                          <ExternalLink className="mr-1 h-3 w-3" /> Buka
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-xs">Belum ada</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Desain */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-1">Status Desain</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Cover</p>
                      <Badge className={designStatusConfig[viewingOrder.design_cover_status].className + " text-xs"}>
                        {designStatusConfig[viewingOrder.design_cover_status].label}
                      </Badge>
                      {viewingOrder.design_cover_link && (
                        <Button variant="ghost" size="sm" className="mt-1 h-6 text-xs text-primary w-full" onClick={() => openExternalLink(viewingOrder.design_cover_link!)}>
                          <ExternalLink className="mr-1 h-3 w-3" /> Lihat File
                        </Button>
                      )}
                    </div>
                    <div className="rounded-lg border border-border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Isi</p>
                      <Badge className={designStatusConfig[viewingOrder.design_isi_status].className + " text-xs"}>
                        {designStatusConfig[viewingOrder.design_isi_status].label}
                      </Badge>
                      {viewingOrder.design_isi_link && (
                        <Button variant="ghost" size="sm" className="mt-1 h-6 text-xs text-primary w-full" onClick={() => openExternalLink(viewingOrder.design_isi_link!)}>
                          <ExternalLink className="mr-1 h-3 w-3" /> Lihat File
                        </Button>
                      )}
                    </div>
                    <div className="rounded-lg border border-border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Packaging</p>
                      <Badge className={designStatusConfig[viewingOrder.design_packaging_status].className + " text-xs"}>
                        {designStatusConfig[viewingOrder.design_packaging_status].label}
                      </Badge>
                      {viewingOrder.design_packaging_link && (
                        <Button variant="ghost" size="sm" className="mt-1 h-6 text-xs text-primary w-full" onClick={() => openExternalLink(viewingOrder.design_packaging_link!)}>
                          <ExternalLink className="mr-1 h-3 w-3" /> Lihat File
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Cetak */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-1">Status Cetak</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Cover</p>
                      <Badge className={cetakStatusConfig[(viewingOrder as any).cetak_cover_status || "belum"].className + " text-xs"}>
                        {cetakStatusConfig[(viewingOrder as any).cetak_cover_status || "belum"].label}
                      </Badge>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Isi</p>
                      <Badge className={cetakStatusConfig[(viewingOrder as any).cetak_isi_status || "belum"].className + " text-xs"}>
                        {cetakStatusConfig[(viewingOrder as any).cetak_isi_status || "belum"].label}
                      </Badge>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Packaging</p>
                      <Badge className={cetakStatusConfig[(viewingOrder as any).cetak_packaging_status || "belum"].className + " text-xs"}>
                        {cetakStatusConfig[(viewingOrder as any).cetak_packaging_status || "belum"].label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Catatan */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-1">Catatan</h4>
                  <div className="grid gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Catatan Internal</p>
                      <p className="text-sm whitespace-pre-line">{viewingOrder.notes || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
              <Button onClick={() => { setIsViewDialogOpen(false); if (viewingOrder) handleEditOrder(viewingOrder); }}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Order
              </Button>
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
                  <Label>Nomor Order</Label>
                  <Input
                    value={editOrderData.order_number}
                    onChange={(e) => setEditOrderData(prev => ({ ...prev, order_number: e.target.value }))}
                  />
                </div>
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
              <div className="grid gap-2">
                <Label>Tanggal Pengiriman</Label>
                <Input
                  type="date"
                  value={editOrderData.shipping_date}
                  onChange={(e) => setEditOrderData(prev => ({ ...prev, shipping_date: e.target.value }))}
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