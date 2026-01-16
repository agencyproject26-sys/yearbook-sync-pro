import { useState } from "react";
import { Search, Filter, MoreHorizontal, FileText, Link, FolderOpen, Mail, Plus, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useOrders, OrderFormData } from "@/hooks/useOrders";
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
  const { orders, loading, addOrder } = useOrders();
  const { customers } = useCustomers();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Order</th>
                <th>Sekolah</th>
                <th>PIC</th>
                <th>Status</th>
                <th>Nilai</th>
                <th>Dokumen</th>
                <th>Tanggal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status];
                return (
                  <tr key={order.id}>
                    <td className="font-medium">{order.order_number}</td>
                    <td>
                      <div>
                        <p className="font-medium">{order.customers?.name}</p>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{order.customers?.pic_name}</td>
                    <td>
                      <Badge className={status.className}>{status.label}</Badge>
                    </td>
                    <td className="font-semibold">{formatCurrency(Number(order.value))}</td>
                    <td>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-8 w-8", order.has_mou ? "text-success" : "text-muted-foreground")}
                          title="MOU"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-8 w-8", order.has_spreadsheet ? "text-success" : "text-muted-foreground")}
                          title="Spreadsheet"
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-8 w-8", order.has_drive ? "text-success" : "text-muted-foreground")}
                          title="Google Drive"
                        >
                          <FolderOpen className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString("id-ID")}</td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                          <DropdownMenuItem>Edit Order</DropdownMenuItem>
                          <DropdownMenuItem>Generate MOU</DropdownMenuItem>
                          <DropdownMenuItem>Buat Invoice</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 font-medium">Generate Dokumen</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" className="justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Generate MOU (Canva)
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    Generate Akun Gmail
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Link className="h-4 w-4" />
                    Buat Spreadsheet
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Generate Google Drive
                  </Button>
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
      </div>
    </MainLayout>
  );
}
