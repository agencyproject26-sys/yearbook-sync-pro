import { useState, useRef, useEffect } from "react";
import { Search, Download, Eye, Plus, Loader2, Pencil, Trash2, Check, X, Upload, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { usePayments, Payment, PaymentFormData } from "@/hooks/usePayments";
import { useInvoices, Invoice } from "@/hooks/useInvoices";
import { ReceiptPreview } from "@/components/receipt/ReceiptPreview";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Calculate total paid for an invoice from payments
const getInvoicePaidAmount = (invoiceId: string, payments: Payment[]) => {
  return payments
    .filter(p => p.invoice_id === invoiceId)
    .reduce((sum, p) => sum + p.amount, 0);
};

// Get invoice remaining amount
const getInvoiceRemaining = (invoice: Invoice, payments: Payment[]) => {
  const paid = getInvoicePaidAmount(invoice.id, payments);
  return Number(invoice.amount) - paid;
};

const numberToWords = (num: number): string => {
  const units = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
  const teens = ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas", "tujuh belas", "delapan belas", "sembilan belas"];
  const tens = ["", "", "dua puluh", "tiga puluh", "empat puluh", "lima puluh", "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"];

  if (num === 0) return "nol";

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return "";
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "");
    if (n < 200) return "seratus" + (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "");
    return units[Math.floor(n / 100)] + " ratus" + (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "");
  };

  if (num < 1000) return convertLessThanThousand(num);
  if (num < 2000) return "seribu" + (num % 1000 !== 0 ? " " + convertLessThanThousand(num % 1000) : "");
  if (num < 1000000) return convertLessThanThousand(Math.floor(num / 1000)) + " ribu" + (num % 1000 !== 0 ? " " + convertLessThanThousand(num % 1000) : "");
  if (num < 1000000000) return convertLessThanThousand(Math.floor(num / 1000000)) + " juta" + (num % 1000000 !== 0 ? " " + numberToWords(num % 1000000) : "");
  return convertLessThanThousand(Math.floor(num / 1000000000)) + " miliar" + (num % 1000000000 !== 0 ? " " + numberToWords(num % 1000000000) : "");
};

interface PaymentTerm {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  date: string;
  paid: boolean;
}

interface FormData {
  receipt_number: string;
  invoice_id: string;
  school: string;
  customer: string;
  amount: string;
  transfer_amount: string;
  cash_amount: string;
  via_transfer: boolean;
  date: string;
  description: string;
  selected_termin_id: string;
}

const emptyFormData: FormData = {
  receipt_number: "",
  invoice_id: "",
  school: "",
  customer: "",
  amount: "",
  transfer_amount: "",
  cash_amount: "",
  via_transfer: false,
  date: "",
  description: "",
  selected_termin_id: "",
};

export default function Pembayaran() {
  const { payments, loading, addPayment, updatePayment, updateProofLink, deletePayment } = usePayments();
  const { invoices } = useInvoices();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterInvoice, setFilterInvoice] = useState<string>("all");
  const [filterSchool, setFilterSchool] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadPreviewRef = useRef<HTMLDivElement>(null);
  
  // Inline edit states
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPicName, setEditPicName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Proof image states
  const [isUploadingProof, setIsUploadingProof] = useState<string | null>(null);
  const [isViewProofOpen, setIsViewProofOpen] = useState(false);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Collapsible school folders state
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());

  // Get unique months from payments for filter options
  const uniqueMonths = [...new Set(payments.map(p => p.payment_date.slice(0, 7)))].sort().reverse();

  // Get unique invoices for filter options
  const uniqueInvoices = [...new Map(
    payments.map(p => [p.invoice_id, { id: p.invoice_id, number: p.invoices?.invoice_number || "" }])
  ).values()].filter(inv => inv.number);
  
  // Get unique schools for filter options
  const uniqueSchools = [...new Set(payments.map(p => p.invoices?.customers?.name || "Unknown"))].sort();

  const filteredPayments = payments.filter((payment) => {
    // Search filter
    const matchesSearch = 
      (payment.invoices?.customers?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.receipt_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Month filter
    const matchesMonth = filterMonth === "all" || payment.payment_date.startsWith(filterMonth);
    
    // Invoice filter
    const matchesInvoice = filterInvoice === "all" || payment.invoice_id === filterInvoice;
    
    // School filter
    const matchesSchool = filterSchool === "all" || (payment.invoices?.customers?.name || "Unknown") === filterSchool;
    
    return matchesSearch && matchesMonth && matchesInvoice && matchesSchool;
  });
  
  // Group payments by school
  const paymentsBySchool = filteredPayments.reduce((acc, payment) => {
    const schoolName = payment.invoices?.customers?.name || "Unknown";
    if (!acc[schoolName]) {
      acc[schoolName] = [];
    }
    acc[schoolName].push(payment);
    return acc;
  }, {} as Record<string, Payment[]>);
  
  const toggleSchool = (schoolName: string) => {
    setExpandedSchools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(schoolName)) {
        newSet.delete(schoolName);
      } else {
        newSet.add(schoolName);
      }
      return newSet;
    });
  };
  
  const expandAllSchools = () => {
    setExpandedSchools(new Set(Object.keys(paymentsBySchool)));
  };
  
  const collapseAllSchools = () => {
    setExpandedSchools(new Set());
  };

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  const openPreview = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPreviewOpen(true);
  };

  const openEditDialog = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      receipt_number: payment.receipt_number,
      invoice_id: payment.invoice_id,
      school: payment.invoices?.customers?.name || "",
      customer: payment.invoices?.customers?.pic_name || "",
      amount: String(payment.amount),
      transfer_amount: "",
      cash_amount: "",
      via_transfer: false,
      date: payment.payment_date,
      description: payment.description || "",
      selected_termin_id: "",
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  // Get payment terms for selected invoice
  const getSelectedInvoiceTerms = (): PaymentTerm[] => {
    if (!formData.invoice_id) return [];
    const invoice = invoices.find(i => i.id === formData.invoice_id);
    if (!invoice || !invoice.payment_terms) return [];
    
    // Parse payment_terms from JSON
    const terms = invoice.payment_terms as PaymentTerm[];
    return Array.isArray(terms) ? terms : [];
  };

  // Get remaining amount for selected invoice
  const getSelectedInvoiceRemaining = (): number => {
    if (!formData.invoice_id) return 0;
    const invoice = invoices.find(i => i.id === formData.invoice_id);
    if (!invoice) return 0;
    return getInvoiceRemaining(invoice, payments);
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        invoice_id: invoiceId,
        school: invoice.customers?.name || "",
        customer: invoice.customers?.pic_name || "",
        amount: "",
        selected_termin_id: "",
        description: "",
      }));
    }
  };

  const handleTerminSelect = (terminId: string) => {
    const terms = getSelectedInvoiceTerms();
    const selectedTerm = terms.find(t => t.id === terminId);
    
    if (selectedTerm) {
      setFormData(prev => ({
        ...prev,
        selected_termin_id: terminId,
        amount: String(selectedTerm.amount),
        description: `Pembayaran ${selectedTerm.name}`,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.invoice_id || !formData.amount || !formData.date || !formData.receipt_number) {
      return;
    }

    const paymentData: PaymentFormData = {
      receipt_number: formData.receipt_number,
      invoice_id: formData.invoice_id,
      amount: parseFloat(formData.amount) || 0,
      description: formData.description,
      payment_date: formData.date,
    };

    let success = false;
    if (editingPayment) {
      success = await updatePayment(editingPayment.id, paymentData);
    } else {
      success = await addPayment(paymentData);
    }

    if (success) {
      setFormData(emptyFormData);
      setEditingPayment(null);
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;
    
    const success = await deletePayment(selectedPayment.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      setSelectedPayment(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setFormData(emptyFormData);
      setEditingPayment(null);
    }
  };

  // Inline edit handlers
  const handleStartInlineEdit = (payment: Payment) => {
    setEditingRowId(payment.id);
    setEditAmount(String(payment.amount));
    setEditDescription(payment.description || "");
    setEditPicName(payment.pic_name || payment.invoices?.customers?.pic_name || "");
  };

  const handleCancelInlineEdit = () => {
    setEditingRowId(null);
    setEditAmount("");
    setEditDescription("");
    setEditPicName("");
  };

  const handleSaveInlineEdit = async (payment: Payment) => {
    setIsSubmitting(true);
    const success = await updatePayment(payment.id, {
      receipt_number: payment.receipt_number,
      invoice_id: payment.invoice_id,
      amount: parseFloat(editAmount) || 0,
      description: editDescription,
      payment_date: payment.payment_date,
      proof_link: payment.proof_link || undefined,
      pic_name: editPicName || undefined,
    });
    setIsSubmitting(false);
    
    if (success) {
      handleCancelInlineEdit();
    }
  };
  
  // Proof image upload handlers
  const handleProofUpload = async (payment: Payment, file: File) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploadingProof(payment.id);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${payment.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);
      
      const success = await updateProofLink(payment.id, publicUrl);
      
      if (success) {
        toast({
          title: "Berhasil",
          description: "Bukti transaksi berhasil diupload",
        });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Gagal mengupload bukti transaksi",
        variant: "destructive",
      });
    } finally {
      setIsUploadingProof(null);
    }
  };

  const handleViewProof = (url: string) => {
    setViewProofUrl(url);
    setIsViewProofOpen(true);
  };

  const handleDownloadProof = async (url: string, paymentId: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `bukti-transaksi-${paymentId}.${url.split('.').pop()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mendownload bukti transaksi",
        variant: "destructive",
      });
    }
  };

  // Get invoice info for a payment
  const getInvoiceInfo = (payment: Payment) => {
    const invoice = invoices.find(i => i.id === payment.invoice_id);
    if (!invoice) return null;
    
    const totalInvoice = Number(invoice.amount);
    const paidAmount = getInvoicePaidAmount(invoice.id, payments);
    const remaining = totalInvoice - paidAmount;
    
    return { totalInvoice, paidAmount, remaining };
  };

  const getReceiptNumber = (payment: Payment): number => {
    const match = payment.receipt_number.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : parseInt(payment.receipt_number, 10) || 1;
  };

  const handleDownloadPDF = async (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDownloading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (!downloadPreviewRef.current) {
      setIsDownloading(false);
      return;
    }

    try {
      const canvas = await html2canvas(downloadPreviewRef.current, {
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
      pdf.save(`Kwitansi-${payment.receipt_number}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthPayments = payments.filter(p => p.payment_date.startsWith(currentMonth));

  return (
    <MainLayout>
      <Header
        title="Pembayaran"
        subtitle="Kelola kwitansi pembayaran"
        showAddButton
        addButtonLabel="Catat Pembayaran"
        onAddClick={() => setIsDialogOpen(true)}
      />

      <div className="p-6">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Kwitansi</p>
            <p className="text-2xl font-bold">{payments.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Bulan Ini</p>
            <p className="text-2xl font-bold text-success">{thisMonthPayments.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Diterima</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(totalPayments)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari kwitansi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bulan</SelectItem>
              {uniqueMonths.map((month) => {
                const [year, m] = month.split("-");
                const monthName = new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
                return (
                  <SelectItem key={month} value={month}>
                    {monthName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={filterInvoice} onValueChange={setFilterInvoice}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semua Invoice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Invoice</SelectItem>
              {uniqueInvoices.map((inv) => (
                <SelectItem key={inv.id} value={inv.id}>
                  {inv.number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSchool} onValueChange={setFilterSchool}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semua Sekolah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sekolah</SelectItem>
              {uniqueSchools.map((school) => (
                <SelectItem key={school} value={school}>
                  {school}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filterMonth !== "all" || filterInvoice !== "all" || filterSchool !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterMonth("all");
                setFilterInvoice("all");
                setFilterSchool("all");
              }}
              className="text-muted-foreground"
            >
              <X className="mr-1 h-4 w-4" />
              Reset Filter
            </Button>
          )}
        </div>

        {/* Expand/Collapse Controls */}
        <div className="mb-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAllSchools}>
            <ChevronDown className="mr-1 h-4 w-4" />
            Buka Semua
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAllSchools}>
            <ChevronRight className="mr-1 h-4 w-4" />
            Tutup Semua
          </Button>
        </div>

        {/* Payments Grouped by School */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8 rounded-xl border border-border bg-card">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : Object.keys(paymentsBySchool).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground rounded-xl border border-border bg-card">
              Belum ada data pembayaran
            </div>
          ) : (
            Object.entries(paymentsBySchool).map(([schoolName, schoolPayments]) => {
              const totalSchoolPayments = schoolPayments.reduce((sum, p) => sum + p.amount, 0);
              const isExpanded = expandedSchools.has(schoolName);
              
              return (
                <Collapsible 
                  key={schoolName} 
                  open={isExpanded}
                  onOpenChange={() => toggleSchool(schoolName)}
                >
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <FolderOpen className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold">{schoolName}</p>
                            <p className="text-sm text-muted-foreground">{schoolPayments.length} pembayaran</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success">{formatCurrency(totalSchoolPayments)}</p>
                          <p className="text-sm text-muted-foreground">Total</p>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="border-t border-border">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>No. Kwitansi</th>
                              <th>PIC</th>
                              <th>Jumlah Bayar</th>
                              <th>Info Invoice</th>
                              <th>Bukti Transaksi</th>
                              <th>Keterangan</th>
                              <th>Tanggal</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {schoolPayments.map((payment) => {
                              const isEditing = editingRowId === payment.id;
                              const invoiceInfo = getInvoiceInfo(payment);
                              
                              return (
                                <tr key={payment.id}>
                                  <td className="font-medium">{payment.receipt_number}</td>
                                  <td>
                                    {isEditing ? (
                                      <Input
                                        value={editPicName}
                                        onChange={(e) => setEditPicName(e.target.value)}
                                        placeholder="Nama PIC"
                                        className="h-8 w-32"
                                      />
                                    ) : (
                                      <span 
                                        className="text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => handleStartInlineEdit(payment)}
                                      >
                                        {payment.pic_name || payment.invoices?.customers?.pic_name || "-"}
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {isEditing ? (
                                      <Input
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className="h-8 w-32"
                                      />
                                    ) : (
                                      <span 
                                        className="font-semibold text-success cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => handleStartInlineEdit(payment)}
                                      >
                                        {formatCurrency(payment.amount)}
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {invoiceInfo ? (
                                      <div className="text-xs space-y-0.5">
                                        <p className="text-muted-foreground">
                                          Invoice: <span className="font-medium text-foreground">{formatCurrency(invoiceInfo.totalInvoice)}</span>
                                        </p>
                                        <p className="text-muted-foreground">
                                          Dibayar: <span className="font-medium text-success">{formatCurrency(invoiceInfo.paidAmount)}</span>
                                        </p>
                                        <p className="text-muted-foreground">
                                          Sisa: <span className={`font-medium ${invoiceInfo.remaining > 0 ? 'text-warning' : 'text-success'}`}>
                                            {formatCurrency(invoiceInfo.remaining)}
                                          </span>
                                        </p>
                                      </div>
                                    ) : (
                                      <Badge variant="outline">{payment.invoices?.invoice_number || "-"}</Badge>
                                    )}
                                  </td>
                                  <td>
                                    {isUploadingProof === payment.id ? (
                                      <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm text-muted-foreground">Uploading...</span>
                                      </div>
                                    ) : payment.proof_link ? (
                                      <div className="flex items-center gap-1">
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="text-primary h-7"
                                          onClick={() => handleViewProof(payment.proof_link!)}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          Lihat
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => handleDownloadProof(payment.proof_link!, payment.id)}
                                        >
                                          <Download className="h-3 w-3" />
                                        </Button>
                                        <label className="cursor-pointer">
                                          <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleProofUpload(payment, file);
                                              e.target.value = '';
                                            }}
                                          />
                                          <div className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent transition-colors">
                                            <Pencil className="h-3 w-3" />
                                          </div>
                                        </label>
                                      </div>
                                    ) : (
                                      <label className="cursor-pointer">
                                        <input
                                          type="file"
                                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleProofUpload(payment, file);
                                            e.target.value = '';
                                          }}
                                        />
                                        <div className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm">
                                          <Upload className="h-3 w-3" />
                                          Upload
                                        </div>
                                      </label>
                                    )}
                                  </td>
                                  <td>
                                    {isEditing ? (
                                      <Input
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="Keterangan"
                                        className="h-8 w-40"
                                      />
                                    ) : (
                                      <span 
                                        className="text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => handleStartInlineEdit(payment)}
                                      >
                                        {payment.description || "-"}
                                      </span>
                                    )}
                                  </td>
                                  <td className="text-muted-foreground">{payment.payment_date}</td>
                                  <td>
                                    <div className="flex gap-1">
                                      {isEditing ? (
                                        <>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleSaveInlineEdit(payment)}
                                            disabled={isSubmitting}
                                            title="Simpan"
                                          >
                                            {isSubmitting ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <Check className="h-4 w-4 text-success" />
                                            )}
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={handleCancelInlineEdit}
                                            title="Batal"
                                          >
                                            <X className="h-4 w-4 text-destructive" />
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <Button variant="ghost" size="icon" onClick={() => openPreview(payment)} title="Lihat">
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(payment)} title="Edit">
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDownloadPDF(payment)}
                                            disabled={isDownloading}
                                            title="Download PDF"
                                          >
                                            {isDownloading && selectedPayment?.id === payment.id ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <Download className="h-4 w-4" />
                                            )}
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => openDeleteDialog(payment)}
                                            title="Hapus"
                                            className="text-destructive hover:text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })
          )}
        </div>

        {/* Add/Edit Payment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPayment ? "Edit Pembayaran" : "Catat Pembayaran Baru"}</DialogTitle>
              <DialogDescription>
                {editingPayment ? "Ubah data kwitansi pembayaran." : "Buat kwitansi untuk pembayaran yang diterima."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>No. Kwitansi *</Label>
                <Input 
                  type="text" 
                  placeholder="1" 
                  value={formData.receipt_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, receipt_number: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Invoice *</Label>
                <Select value={formData.invoice_id} onValueChange={handleInvoiceSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map(inv => {
                      const remaining = getInvoiceRemaining(inv, payments);
                      return (
                        <SelectItem key={inv.id} value={inv.id}>
                          <div className="flex flex-col">
                            <span>{inv.invoice_number} - {inv.customers?.name || "Unknown"}</span>
                            <span className="text-xs text-muted-foreground">
                              Sisa: {formatCurrency(remaining)}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Invoice Info Summary */}
              {formData.invoice_id && (
                <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Invoice:</span>
                    <span className="font-medium">{formatCurrency(Number(invoices.find(i => i.id === formData.invoice_id)?.amount || 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sudah Dibayar:</span>
                    <span className="font-medium text-success">{formatCurrency(getInvoicePaidAmount(formData.invoice_id, payments))}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-2">
                    <span className="text-muted-foreground">Sisa Tagihan:</span>
                    <span className={`font-semibold ${getSelectedInvoiceRemaining() > 0 ? 'text-warning' : 'text-success'}`}>
                      {formatCurrency(getSelectedInvoiceRemaining())}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Terms Selection */}
              {formData.invoice_id && getSelectedInvoiceTerms().length > 0 && (
                <div className="grid gap-2">
                  <Label>Pilih Termin (Opsional)</Label>
                  <Select value={formData.selected_termin_id} onValueChange={handleTerminSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih termin pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSelectedInvoiceTerms().map(term => (
                        <SelectItem key={term.id} value={term.id}>
                          <div className="flex items-center gap-2">
                            <span>{term.name} ({term.percentage}%)</span>
                            <span className="text-muted-foreground">- {formatCurrency(term.amount)}</span>
                            {term.paid && (
                              <Badge variant="outline" className="ml-1 text-xs">Lunas</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Pilih termin untuk mengisi otomatis jumlah pembayaran
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <Label>Jumlah Pembayaran *</Label>
                <Input 
                  type="number" 
                  placeholder="2400000" 
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
                {formData.amount && (
                  <p className="text-xs text-muted-foreground">
                    Terbilang: {numberToWords(parseFloat(formData.amount) || 0)} rupiah
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="via_transfer"
                    checked={formData.via_transfer}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true;
                      setFormData(prev => ({
                        ...prev,
                        via_transfer: isChecked,
                        transfer_amount: isChecked ? prev.amount : "",
                        cash_amount: isChecked ? "0" : "",
                      }));
                    }}
                  />
                  <Label htmlFor="via_transfer" className="cursor-pointer">Via Transfer</Label>
                </div>
                {formData.via_transfer && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Nominal Transfer</Label>
                      <Input 
                        type="number" 
                        placeholder="1000000" 
                        value={formData.transfer_amount}
                        onChange={(e) => {
                          const transferVal = e.target.value;
                          const totalAmount = parseFloat(formData.amount) || 0;
                          const transferAmount = parseFloat(transferVal) || 0;
                          const cashAmount = Math.max(0, totalAmount - transferAmount);
                          setFormData(prev => ({
                            ...prev,
                            transfer_amount: transferVal,
                            cash_amount: String(cashAmount),
                          }));
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Via Cash</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={formData.cash_amount}
                        onChange={(e) => {
                          const cashVal = e.target.value;
                          const totalAmount = parseFloat(formData.amount) || 0;
                          const cashAmount = parseFloat(cashVal) || 0;
                          const transferAmount = Math.max(0, totalAmount - cashAmount);
                          setFormData(prev => ({
                            ...prev,
                            cash_amount: cashVal,
                            transfer_amount: String(transferAmount),
                          }));
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Tanggal Pembayaran *</Label>
                <Input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Keterangan (Untuk Pembayaran)</Label>
                <Textarea 
                  placeholder="Pembayaran Buku tahunan Sekolah Termin 1" 
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
                disabled={!formData.invoice_id || !formData.amount || !formData.date || !formData.receipt_number}
              >
                <Plus className="mr-2 h-4 w-4" />
                {editingPayment ? "Simpan Perubahan" : "Simpan Pembayaran"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Kwitansi?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus kwitansi {selectedPayment?.receipt_number}? 
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

        {/* Receipt Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Preview Kwitansi</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="overflow-auto border rounded-lg">
                <ReceiptPreview
                  receiptNumber={getReceiptNumber(selectedPayment)}
                  receivedFrom={`${selectedPayment.invoices?.customers?.name || ""} ( ${selectedPayment.pic_name || selectedPayment.invoices?.customers?.pic_name || ""} )`}
                  amountInWords={numberToWords(selectedPayment.amount) + " rupiah"}
                  paymentDescription={selectedPayment.description || "Pembayaran"}
                  transferAmount={0}
                  cashAmount={selectedPayment.amount}
                  totalAmount={selectedPayment.amount}
                  date={selectedPayment.payment_date}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Tutup
              </Button>
              <Button 
                onClick={() => selectedPayment && handleDownloadPDF(selectedPayment)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hidden Receipt Preview for PDF Download */}
        {selectedPayment && (
          <div className="fixed left-[-9999px] top-0">
            <ReceiptPreview
              ref={downloadPreviewRef}
              receiptNumber={getReceiptNumber(selectedPayment)}
              receivedFrom={`${selectedPayment.invoices?.customers?.name || ""} ( ${selectedPayment.pic_name || selectedPayment.invoices?.customers?.pic_name || ""} )`}
              amountInWords={numberToWords(selectedPayment.amount) + " rupiah"}
              paymentDescription={selectedPayment.description || "Pembayaran"}
              transferAmount={0}
              cashAmount={selectedPayment.amount}
              totalAmount={selectedPayment.amount}
              date={selectedPayment.payment_date}
            />
          </div>
        )}
      </div>

      {/* View Proof Image Dialog */}
      <Dialog open={isViewProofOpen} onOpenChange={setIsViewProofOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bukti Transaksi</DialogTitle>
            <DialogDescription>Gambar bukti pembayaran yang telah diupload</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {viewProofUrl && (
              <img 
                src={viewProofUrl} 
                alt="Bukti Transaksi" 
                className="max-w-full max-h-[60vh] object-contain rounded-lg border"
              />
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => viewProofUrl && window.open(viewProofUrl, '_blank')}
              >
                <Eye className="mr-2 h-4 w-4" />
                Buka di Tab Baru
              </Button>
              <Button 
                onClick={() => {
                  if (viewProofUrl) {
                    const a = document.createElement('a');
                    a.href = viewProofUrl;
                    a.download = `bukti-transaksi.${viewProofUrl.split('.').pop()}`;
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
