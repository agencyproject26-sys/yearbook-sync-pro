import { useState } from "react";
import { Search, Filter, MoreHorizontal, Download, Eye, Plus, Send } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  customer: string;
  school: string;
  amount: number;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue";
  createdAt: string;
}

interface InvoiceItem {
  description: string;
  qty: string;
  price: string;
}

interface InvoiceFormData {
  customerId: string;
  school: string;
  customer: string;
  dueDate: string;
  items: InvoiceItem[];
  dpDate: string;
  dpAmount: string;
  pelunasanDate: string;
  pelunasanAmount: string;
}

const statusConfig = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  sent: { label: "Terkirim", className: "bg-info/15 text-info" },
  paid: { label: "Lunas", className: "bg-success/15 text-success" },
  overdue: { label: "Terlambat", className: "bg-destructive/15 text-destructive" },
};

const mockCustomers = [
  { id: "sma1", name: "SMA Negeri 1 Jakarta", pic: "Bpk. Ahmad" },
  { id: "smpazhar", name: "SMP Islam Al-Azhar", pic: "Ibu Sari" },
  { id: "sdtar", name: "SD Tarakanita", pic: "Bpk. Budi" },
];

const initialMockInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    customer: "Bpk. Ahmad",
    school: "SMA Negeri 1 Jakarta",
    amount: 45000000,
    dueDate: "2026-02-15",
    status: "sent",
    createdAt: "2026-01-15",
  },
  {
    id: "INV-2026-002",
    customer: "Ibu Sari",
    school: "SMP Islam Al-Azhar",
    amount: 32000000,
    dueDate: "2026-02-14",
    status: "paid",
    createdAt: "2026-01-14",
  },
  {
    id: "INV-2025-048",
    customer: "Bpk. Budi",
    school: "SD Tarakanita",
    amount: 28000000,
    dueDate: "2026-01-10",
    status: "overdue",
    createdAt: "2025-12-10",
  },
  {
    id: "INV-2026-003",
    customer: "Ibu Dewi",
    school: "SMA Gonzaga",
    amount: 52000000,
    dueDate: "2026-02-20",
    status: "draft",
    createdAt: "2026-01-16",
  },
];

const emptyFormData: InvoiceFormData = {
  customerId: "",
  school: "",
  customer: "",
  dueDate: "",
  items: [{ description: "", qty: "", price: "" }],
  dpDate: "",
  dpAmount: "",
  pelunasanDate: "",
  pelunasanAmount: "",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function Invoice() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialMockInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>(emptyFormData);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unpaidTotal = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handleCustomerSelect = (customerId: string) => {
    const customer = mockCustomers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId,
        school: customer.name,
        customer: customer.pic,
      }));
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", qty: "", price: "" }],
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + (qty * price);
    }, 0);
  };

  const handleSubmit = () => {
    if (!formData.customerId || !formData.dueDate || formData.items.length === 0) {
      return;
    }

    const invoiceNumber = String(invoices.length + 1).padStart(3, "0");
    const newInvoice: Invoice = {
      id: `INV-2026-${invoiceNumber}`,
      customer: formData.customer,
      school: formData.school,
      amount: calculateTotal(),
      dueDate: formData.dueDate,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setInvoices(prev => [newInvoice, ...prev]);
    setFormData(emptyFormData);
    setIsDialogOpen(false);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setFormData(emptyFormData);
    }
  };

  return (
    <MainLayout>
      <Header
        title="Invoice"
        subtitle="Kelola invoice dan penagihan"
        showAddButton
        addButtonLabel="Buat Invoice"
        onAddClick={() => setIsDialogOpen(true)}
      />

      <div className="p-6">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Invoice</p>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Belum Dibayar</p>
            <p className="text-2xl font-bold text-warning">{invoices.filter(i => i.status !== "paid").length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Terlambat</p>
            <p className="text-2xl font-bold text-destructive">{invoices.filter(i => i.status === "overdue").length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Belum Dibayar</p>
            <p className="text-2xl font-bold text-warning">{formatCurrency(unpaidTotal)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari invoice..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Terkirim</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="overdue">Terlambat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Invoice</th>
                <th>Sekolah</th>
                <th>PIC</th>
                <th>Jumlah</th>
                <th>Jatuh Tempo</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => {
                const status = statusConfig[invoice.status];
                return (
                  <tr key={invoice.id}>
                    <td className="font-medium">{invoice.id}</td>
                    <td>{invoice.school}</td>
                    <td className="text-muted-foreground">{invoice.customer}</td>
                    <td className="font-semibold">{formatCurrency(invoice.amount)}</td>
                    <td className="text-muted-foreground">{invoice.dueDate}</td>
                    <td>
                      <Badge className={status.className}>{status.label}</Badge>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(true)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                            <DropdownMenuItem>Edit Invoice</DropdownMenuItem>
                            <DropdownMenuItem>Kirim ke Pelanggan</DropdownMenuItem>
                            <DropdownMenuItem>Tandai Lunas</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Hapus</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Create Invoice Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Invoice Baru</DialogTitle>
              <DialogDescription>
                Buat invoice untuk pelanggan dengan format standar PT Creative Shoot Indonesia.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Pelanggan *</Label>
                  <Select value={formData.customerId} onValueChange={handleCustomerSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih sekolah" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Jatuh Tempo *</Label>
                  <Input 
                    type="date" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 font-medium">Item Invoice</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-5">Deskripsi</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Harga</div>
                    <div className="col-span-3">Total</div>
                  </div>
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <Input 
                        className="col-span-5" 
                        placeholder="Buku Tahunan" 
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      />
                      <Input 
                        className="col-span-2" 
                        type="number" 
                        placeholder="100" 
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                      />
                      <Input 
                        className="col-span-2" 
                        type="number"
                        placeholder="450000" 
                        value={item.price}
                        onChange={(e) => handleItemChange(index, "price", e.target.value)}
                      />
                      <Input 
                        className="col-span-3" 
                        value={formatCurrency((parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0))} 
                        readOnly 
                      />
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={handleAddItem}>
                      <Plus className="mr-2 h-3 w-3" />
                      Tambah Item
                    </Button>
                    <div className="text-sm font-semibold">
                      Total: {formatCurrency(calculateTotal())}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 font-medium">Tahap Pembayaran</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-4">Tahap</div>
                    <div className="col-span-4">Tanggal</div>
                    <div className="col-span-4">Jumlah</div>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <Input className="col-span-4" value="DP 50%" readOnly />
                    <Input 
                      className="col-span-4" 
                      type="date" 
                      value={formData.dpDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dpDate: e.target.value }))}
                    />
                    <Input 
                      className="col-span-4" 
                      type="number"
                      placeholder="22500000" 
                      value={formData.dpAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, dpAmount: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <Input className="col-span-4" value="Pelunasan 50%" readOnly />
                    <Input 
                      className="col-span-4" 
                      type="date" 
                      value={formData.pelunasanDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, pelunasanDate: e.target.value }))}
                    />
                    <Input 
                      className="col-span-4" 
                      type="number"
                      placeholder="22500000" 
                      value={formData.pelunasanAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, pelunasanAmount: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!formData.customerId || !formData.dueDate || formData.items.every(i => !i.description)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Buat Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview Invoice</DialogTitle>
            </DialogHeader>
            <div className="rounded-lg border border-border bg-white p-8 text-foreground">
              {/* Header */}
              <div className="mb-8 flex items-start justify-between border-b border-border pb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
                    CS
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">PT CREATIVE SHOOT INDONESIA</h2>
                    <p className="text-sm text-muted-foreground">Vendor Buku Tahunan Sekolah</p>
                    <p className="text-sm text-muted-foreground">Jl. Raya Serpong No. 123, Tangerang Selatan</p>
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
                  <p className="mt-1 text-sm text-muted-foreground">#INV-2026-001</p>
                </div>
              </div>

              {/* Info */}
              <div className="mb-8 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kepada:</p>
                  <p className="font-semibold">SMA Negeri 1 Jakarta</p>
                  <p className="text-sm text-muted-foreground">Bpk. Ahmad</p>
                  <p className="text-sm text-muted-foreground">Jl. Sudirman No. 123, Jakarta Selatan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Tanggal: 15 Januari 2026</p>
                  <p className="text-sm text-muted-foreground">Jatuh Tempo: 15 Februari 2026</p>
                </div>
              </div>

              {/* Table */}
              <table className="mb-8 w-full">
                <thead>
                  <tr className="border-b border-t border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Deskripsi</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Harga</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 text-sm">Buku Tahunan SMA - Premium Edition</td>
                    <td className="px-4 py-3 text-center text-sm">100</td>
                    <td className="px-4 py-3 text-right text-sm">Rp 450.000</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">Rp 45.000.000</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold">Subtotal</td>
                    <td className="px-4 py-3 text-right font-bold">Rp 45.000.000</td>
                  </tr>
                </tfoot>
              </table>

              {/* Payment Info */}
              <div className="mb-8 rounded-lg bg-muted/50 p-4">
                <p className="mb-2 text-sm font-semibold">Transfer ke:</p>
                <p className="text-sm">Bank BCA: <span className="font-mono font-semibold">5213700099</span></p>
                <p className="text-sm">a.n PT CREATIVE SHOOT INDONESIA</p>
              </div>

              {/* Footer */}
              <div className="flex items-end justify-between border-t border-border pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Terima kasih atas kepercayaan Anda.</p>
                  <p className="text-xs text-muted-foreground">Syarat & Ketentuan berlaku.</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Hormat kami,</p>
                  <div className="my-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground mx-auto">
                    CS
                  </div>
                  <p className="font-semibold">Sofyan Septiyadi</p>
                  <p className="text-sm text-muted-foreground">Owner Project</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Tutup
              </Button>
              <Button variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Kirim
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
