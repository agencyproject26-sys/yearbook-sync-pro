import { useState } from "react";
import { Search, Filter, MoreHorizontal, FileText, Link, FolderOpen, Mail, Plus, Loader2, Eye, EyeOff, ExternalLink, Pencil } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useOrders, type OrderFormData, type Order } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";

const statusConfig = {
  proses: { label: "Proses", className: "bg-info/15 text-info" },
  desain: { label: "Desain", className: "bg-warning/15 text-warning" },
  cetak: { label: "Cetak", className: "bg-accent/15 text-accent" },
  selesai: { label: "Selesai", className: "bg-success/15 text-success" },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const emptyFormData: OrderFormData = {
  customer_id: "",
  value: 0,
  wa_desc: "",
  notes: "",
};

export default function Order() {
  const { orders, loading, addOrder, updateOrder } = useOrders();
  const { customers } = useCustomers();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit dialogs
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isMouDialogOpen, setIsMouDialogOpen] = useState(false);
  const [mouLink, setMouLink] = useState("");
  const [isGmailDialogOpen, setIsGmailDialogOpen] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [gmailPassword, setGmailPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSpreadsheetDialogOpen, setIsSpreadsheetDialogOpen] = useState(false);
  const [spreadsheetLink, setSpreadsheetLink] = useState("");
  const [isDriveDialogOpen, setIsDriveDialogOpen] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const [isLinkSubmitting, setIsLinkSubmitting] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customers?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = filteredOrders.reduce((sum, order) => sum + Number(order.value), 0);

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

  // MOU Dialog handlers
  const handleOpenMouDialog = (order: Order) => {
    setEditingOrder(order);
    setMouLink(order.mou_link || "");
    setIsMouDialogOpen(true);
  };

  const handleSaveMouLink = async () => {
    if (!editingOrder) return;
    setIsLinkSubmitting(true);
    await updateOrder(editingOrder.id, { mou_link: mouLink || null, has_mou: !!mouLink });
    setIsLinkSubmitting(false);
    setIsMouDialogOpen(false);
    setEditingOrder(null);
  };

  // Gmail Dialog handlers
  const handleOpenGmailDialog = (order: Order) => {
    setEditingOrder(order);
    setGmailEmail(order.gmail_email || "");
    setGmailPassword(order.gmail_password || "");
    setIsGmailDialogOpen(true);
  };

  const handleSaveGmail = async () => {
    if (!editingOrder) return;
    setIsLinkSubmitting(true);
    await updateOrder(editingOrder.id, { gmail_email: gmailEmail || null, gmail_password: gmailPassword || null });
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

  const openExternalLink = (url: string) => {
    window.open(url, "_blank");
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
            <p className="text-sm text-muted-foreground">Total Nilai</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(totalValue)}</p>
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
                <TableHead>Status</TableHead>
                <TableHead className="text-center">MOU</TableHead>
                <TableHead className="text-center">Akun Gmail</TableHead>
                <TableHead className="text-center">Spreadsheet</TableHead>
                <TableHead className="text-center">Google Drive</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status];
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customers?.name}</p>
                        <p className="text-xs text-muted-foreground">{order.order_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.className}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenMouDialog(order)}
                        >
                          <FileText className="mr-1 h-3 w-3" />
                          {order.mou_link ? "Edit" : "Generate"} MOU
                        </Button>
                        {order.mou_link && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-success"
                            onClick={() => openExternalLink(order.mou_link!)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenGmailDialog(order)}
                        className={order.gmail_email ? "border-success text-success" : ""}
                      >
                        <Mail className="mr-1 h-3 w-3" />
                        {order.gmail_email ? "Lihat" : "Generate"} Akun
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenSpreadsheetDialog(order)}
                        >
                          <Link className="mr-1 h-3 w-3" />
                          {order.spreadsheet_link ? "Edit" : "Buat"} Spreadsheet
                        </Button>
                        {order.spreadsheet_link && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-success"
                            onClick={() => openExternalLink(order.spreadsheet_link!)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDriveDialog(order)}
                        >
                          <FolderOpen className="mr-1 h-3 w-3" />
                          {order.drive_link ? "Edit" : "Generate"} Drive
                        </Button>
                        {order.drive_link && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-success"
                            onClick={() => openExternalLink(order.drive_link!)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                          <DropdownMenuItem>Buat Invoice</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                <div className="grid gap-2">
                  <Label htmlFor="value">Nilai Order (Rp) *</Label>
                  <Input 
                    id="value" 
                    type="number" 
                    placeholder="45000000" 
                    value={formData.value || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="waDesc">Deskripsi Grup WhatsApp</Label>
                <Textarea
                  id="waDesc"
                  placeholder="Masukkan deskripsi untuk grup WhatsApp"
                  rows={3}
                  value={formData.wa_desc}
                  onChange={(e) => setFormData(prev => ({ ...prev, wa_desc: e.target.value }))}
                />
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
              <Button onClick={handleSubmit} disabled={!formData.customer_id || !formData.value || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
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
              <div className="grid gap-2">
                <Label>Password</Label>
                <div className="flex gap-2">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Password" 
                    value={gmailPassword}
                    onChange={(e) => setGmailPassword(e.target.value)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
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
      </div>
    </MainLayout>
  );
}