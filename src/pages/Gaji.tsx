import { useState, useRef } from "react";
import { Search, Plus, Camera, Palette, Printer, AlertTriangle, User, Loader2, Eye, Pencil, Trash2, Download } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSalaries, Salary, SalaryFormData } from "@/hooks/useSalaries";
import { useOrders } from "@/hooks/useOrders";
import { SalaryReceipt } from "@/components/salary/SalaryReceipt";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const categoryConfig = {
  photographer: { icon: Camera, label: "Photographer", className: "bg-success/15 text-success" },
  design: { icon: Palette, label: "Design", className: "bg-warning/15 text-warning" },
  print: { icon: Printer, label: "Percetakan", className: "bg-info/15 text-info" },
  other: { icon: AlertTriangle, label: "Tak Terduga", className: "bg-destructive/15 text-destructive" },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const emptyFormData: SalaryFormData = {
  category: "photographer",
  name: "",
  amount: 0,
  order_id: "",
  payment_date: "",
  description: "",
};

export default function Gaji() {
  const { salaries, loading, addSalary, updateSalary, deleteSalary } = useSalaries();
  const { orders } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SalaryFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  const [viewingSalary, setViewingSalary] = useState<Salary | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deletingSalary, setDeletingSalary] = useState<Salary | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const filteredSalaries = salaries.filter((salary) => {
    const matchesSearch = salary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (salary.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || salary.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalByCategory = {
    photographer: salaries.filter(s => s.category === "photographer").reduce((sum, s) => sum + Number(s.amount), 0),
    design: salaries.filter(s => s.category === "design").reduce((sum, s) => sum + Number(s.amount), 0),
    print: salaries.filter(s => s.category === "print").reduce((sum, s) => sum + Number(s.amount), 0),
    other: salaries.filter(s => s.category === "other").reduce((sum, s) => sum + Number(s.amount), 0),
  };

  const totalAll = Object.values(totalByCategory).reduce((sum, val) => sum + val, 0);

  const handleSubmit = async () => {
    if (!formData.category || !formData.name || !formData.amount || !formData.payment_date) return;
    
    setIsSubmitting(true);
    let success = false;
    
    if (editingSalary) {
      success = await updateSalary(editingSalary.id, formData);
    } else {
      success = await addSalary(formData);
    }
    
    setIsSubmitting(false);
    
    if (success) {
      setFormData(emptyFormData);
      setEditingSalary(null);
      setIsDialogOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setFormData(emptyFormData);
      setEditingSalary(null);
    }
  };

  const openEditDialog = (salary: Salary) => {
    setEditingSalary(salary);
    setFormData({
      name: salary.name,
      category: salary.category,
      amount: salary.amount,
      description: salary.description || "",
      order_id: salary.order_id || "",
      payment_date: salary.payment_date,
    });
    setIsDialogOpen(true);
  };

  const openViewDialog = (salary: Salary) => {
    setViewingSalary(salary);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (salary: Salary) => {
    setDeletingSalary(salary);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingSalary) return;
    await deleteSalary(deletingSalary.id);
    setIsDeleteDialogOpen(false);
    setDeletingSalary(null);
  };

  const handleDownloadPDF = async (salary: Salary) => {
    setViewingSalary(salary);
    setIsViewDialogOpen(true);
    
    // Wait for dialog to render
    setTimeout(async () => {
      if (receiptRef.current) {
        try {
          const canvas = await html2canvas(receiptRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
          });
          
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a5",
          });
          
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Bukti_Gaji_${salary.name}_${salary.payment_date}.pdf`);
        } catch (error) {
          console.error("Error generating PDF:", error);
        }
      }
      setIsViewDialogOpen(false);
      setViewingSalary(null);
    }, 500);
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
        title="Gaji Karyawan"
        subtitle="Kelola pembayaran gaji dan biaya operasional"
        showAddButton
        addButtonLabel="Catat Gaji"
        onAddClick={() => setIsDialogOpen(true)}
      />

      <div className="p-6">
        {/* Stats by Category */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            const total = totalByCategory[key as keyof typeof totalByCategory];
            return (
              <div key={key} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.className)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-lg font-bold">{formatCurrency(total)}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="rounded-xl border border-border bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gaji</p>
                <p className="text-lg font-bold">{formatCurrency(totalAll)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau keterangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="photographer">Photographer</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="print">Percetakan</SelectItem>
                <SelectItem value="other">Tak Terduga</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Salaries Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Jumlah</th>
                <th>Keterangan</th>
                <th>Order</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalaries.map((salary) => {
                const config = categoryConfig[salary.category];
                const Icon = config.icon;
                return (
                  <tr key={salary.id}>
                    <td className="font-medium">{salary.name}</td>
                    <td>
                      <Badge className={config.className}>
                        <Icon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </td>
                    <td className="font-semibold">{formatCurrency(Number(salary.amount))}</td>
                    <td className="text-muted-foreground">{salary.description}</td>
                    <td>
                      {salary.orders?.order_number ? (
                        <Badge variant="outline">{salary.orders.order_number}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="text-muted-foreground">{salary.payment_date}</td>
                    <td>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openViewDialog(salary)}
                          title="Lihat"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(salary)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(salary)}
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownloadPDF(salary)}
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Salary Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingSalary ? "Edit Gaji / Biaya" : "Catat Gaji / Biaya"}</DialogTitle>
              <DialogDescription>
                {editingSalary ? "Perbarui data pembayaran gaji atau biaya operasional." : "Masukkan data pembayaran gaji atau biaya operasional."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Kategori *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: "photographer" | "design" | "print" | "other") => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photographer">Photographer</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="print">Percetakan</SelectItem>
                    <SelectItem value="other">Biaya Tak Terduga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Nama Penerima *</Label>
                <Input 
                  placeholder="Nama orang / vendor" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Jumlah *</Label>
                <Input 
                  type="number" 
                  placeholder="5000000" 
                  value={formData.amount || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Order (Opsional)</Label>
                <Select 
                  value={formData.order_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, order_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih order terkait" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map(ord => (
                      <SelectItem key={ord.id} value={ord.id}>{ord.order_number} - {ord.customers?.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tanggal *</Label>
                <Input 
                  type="date" 
                  value={formData.payment_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Keterangan</Label>
                <Textarea 
                  placeholder="Deskripsi pembayaran" 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!formData.category || !formData.name || !formData.amount || !formData.payment_date || isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSalary ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {editingSalary ? "Perbarui" : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Salary Receipt Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Bukti Pembayaran Gaji</DialogTitle>
            </DialogHeader>
            {viewingSalary && (
              <div className="flex flex-col items-center">
                <SalaryReceipt ref={receiptRef} salary={viewingSalary} />
                <Button 
                  className="mt-4" 
                  onClick={() => handleDownloadPDF(viewingSalary)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Data Gaji</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus data gaji untuk "{deletingSalary?.name}"? 
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
