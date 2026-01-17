import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Filter, MoreHorizontal, Download, Eye, Plus, Send, Loader2, Pencil, Trash2, Upload, ImageIcon, Printer, Settings, Check, FileDown } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
import { cn } from "@/lib/utils";
import { useInvoices, type InvoiceFormData, type Invoice, type PaymentTerm } from "@/hooks/useInvoices";
import { useCustomers } from "@/hooks/useCustomers";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useToast } from "@/hooks/use-toast";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";

const statusConfig = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  sent: { label: "Terkirim", className: "bg-info/15 text-info" },
  paid: { label: "Lunas", className: "bg-success/15 text-success" },
  overdue: { label: "Terlambat", className: "bg-destructive/15 text-destructive" },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

interface InvoiceItem {
  description: string;
  qty: string;
  price: string;
}

const emptyFormData: InvoiceFormData = {
  customer_id: "",
  issue_date: "",
  items: [{ description: "", qty: 0, price: 0 }],
  payment_terms: [],
  company_logo_url: "",
};

const emptyPaymentTerm: PaymentTerm = {
  id: "",
  name: "Termin 1",
  percentage: 0,
  amount: 0,
  date: null,
  paid: false,
};

export default function Invoice() {
  const { invoices, loading, addInvoice, updateInvoice } = useInvoices();
  const { customers } = useCustomers();
  const { settings: companySettings, uploadLogo, uploadSignature, saveSettings, loading: settingsLoading } = useCompanySettings();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTerminDialogOpen, setIsTerminDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>(emptyFormData);
  const [formItems, setFormItems] = useState<InvoiceItem[]>([{ description: "", qty: "", price: "" }]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Company settings state
  const [tempLogoUrl, setTempLogoUrl] = useState<string | null>(null);
  const [tempSignatureUrl, setTempSignatureUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  
  const [isDownloading, setIsDownloading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);
  const downloadPreviewRef = useRef<HTMLDivElement>(null);

  // Initialize temp settings from company settings
  useEffect(() => {
    if (companySettings) {
      setTempLogoUrl(companySettings.logo_url);
      setTempSignatureUrl(companySettings.signature_url);
      setLogoPreview(companySettings.logo_url);
      setSignaturePreview(companySettings.signature_url);
    }
  }, [companySettings]);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.customers?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unpaidTotal = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const handleAddItem = () => {
    setFormItems(prev => [...prev, { description: "", qty: "", price: "" }]);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...formItems];
    newItems[index][field] = value;
    setFormItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length > 1) {
      setFormItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return formItems.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + (qty * price);
    }, 0);
  };

  // Payment Terms handlers
  const handleAddPaymentTerm = () => {
    const termNumber = paymentTerms.length + 1;
    setPaymentTerms(prev => [...prev, {
      ...emptyPaymentTerm,
      id: crypto.randomUUID(),
      name: `Termin ${termNumber}`,
    }]);
  };

  const handleTermChange = (index: number, field: keyof PaymentTerm, value: any) => {
    const newTerms = [...paymentTerms];
    (newTerms[index] as any)[field] = value;
    
    // Auto-calculate amount if percentage changes
    if (field === "percentage") {
      const total = calculateTotal();
      newTerms[index].amount = (total * (parseFloat(value) || 0)) / 100;
    }
    
    setPaymentTerms(newTerms);
  };

  const handleRemoveTerm = (index: number) => {
    setPaymentTerms(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.customer_id || !formData.issue_date || formItems.every(i => !i.description)) {
      return;
    }

    setIsSubmitting(true);
    const invoiceData: InvoiceFormData = {
      customer_id: formData.customer_id,
      issue_date: formData.issue_date,
      items: formItems.map(item => ({
        description: item.description,
        qty: parseFloat(item.qty) || 0,
        price: parseFloat(item.price) || 0,
      })),
      payment_terms: paymentTerms,
      company_logo_url: formData.company_logo_url,
    };

    const success = await addInvoice(invoiceData);
    setIsSubmitting(false);
    
    if (success) {
      setFormData(emptyFormData);
      setFormItems([{ description: "", qty: "", price: "" }]);
      setPaymentTerms([]);
      setLogoPreview(null);
      setIsDialogOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setFormData(emptyFormData);
      setFormItems([{ description: "", qty: "", price: "" }]);
      setPaymentTerms([]);
    }
  };

  // Logo upload handler for settings
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploadingLogo(true);
    try {
      const url = await uploadLogo(file);
      if (url) {
        setTempLogoUrl(url);
      }
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Signature upload handler for settings
  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setSignaturePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploadingSignature(true);
    try {
      const url = await uploadSignature(file);
      if (url) {
        setTempSignatureUrl(url);
      }
    } finally {
      setIsUploadingSignature(false);
    }
  };

  // Save company settings
  const handleSaveCompanySettings = async () => {
    setIsSubmitting(true);
    const success = await saveSettings(tempLogoUrl, tempSignatureUrl);
    setIsSubmitting(false);
    if (success) {
      setIsSettingsDialogOpen(false);
    }
  };

  // Edit Payment Terms
  const handleOpenTerminDialog = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setPaymentTerms(invoice.payment_terms || []);
    setIsTerminDialogOpen(true);
  };

  const handleSaveTerms = async () => {
    if (!editingInvoice) return;
    
    setIsSubmitting(true);
    await updateInvoice(editingInvoice.id, { payment_terms: paymentTerms });
    setIsSubmitting(false);
    setIsTerminDialogOpen(false);
    setEditingInvoice(null);
    setPaymentTerms([]);
  };

  // Calculate paid amount for an invoice
  const getPaidAmount = (invoice: Invoice) => {
    return (invoice.payment_terms || [])
      .filter(term => term.paid)
      .reduce((sum, term) => sum + (term.amount || 0), 0);
  };

  const getRemainingAmount = (invoice: Invoice) => {
    return Number(invoice.amount) - getPaidAmount(invoice);
  };

  // Preview Invoice
  const handleOpenPreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setIsPreviewDialogOpen(true);
  };

  // Send Invoice (placeholder - shows toast)
  const handleSendInvoice = (invoice: Invoice) => {
    toast({
      title: "Kirim Invoice",
      description: `Invoice ${invoice.invoice_number} akan dikirim ke ${invoice.customers?.name}. Fitur ini akan segera tersedia.`,
    });
  };

  // Mark as Paid
  const handleMarkAsPaid = async (invoice: Invoice) => {
    const allPaidTerms = (invoice.payment_terms || []).map(term => ({
      ...term,
      paid: true,
    }));
    
    await updateInvoice(invoice.id, { 
      status: "paid" as const,
      payment_terms: allPaidTerms,
    });
    
    toast({
      title: "Berhasil",
      description: `Invoice ${invoice.invoice_number} telah ditandai lunas`,
    });
  };

  // Delete Invoice
  const handleDeleteInvoice = async (invoice: Invoice) => {
    // In a real app, you'd want a confirmation dialog
    toast({
      title: "Hapus Invoice",
      description: `Invoice ${invoice.invoice_number} akan dihapus. Fitur ini akan segera tersedia.`,
    });
  };

  // Download PDF function
  const handleDownloadPDF = async (invoice: Invoice) => {
    setIsDownloading(true);
    setPreviewInvoice(invoice);
    
    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const element = downloadPreviewRef.current;
      if (!element) {
        throw new Error("Preview element not found");
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const fileName = `${invoice.invoice_number.replace(/\//g, "-")}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Berhasil",
        description: `Invoice berhasil diunduh sebagai ${fileName}`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Gagal membuat PDF. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintInvoice = () => {
    if (invoicePreviewRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice - ${previewInvoice?.invoice_number}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; }
                @media print {
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              ${invoicePreviewRef.current.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
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
          <Button 
            variant="outline" 
            onClick={() => setIsSettingsDialogOpen(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Pengaturan Invoice
          </Button>
        </div>

        {/* Invoices Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Invoice</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="text-right">Total Invoice</TableHead>
                <TableHead>Tahap Pembayaran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const status = statusConfig[invoice.status];
                const paidAmount = getPaidAmount(invoice);
                const remainingAmount = getRemainingAmount(invoice);
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.customers?.name}</p>
                        <p className="text-xs text-muted-foreground">{invoice.customers?.pic_name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(Number(invoice.amount))}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {(invoice.payment_terms || []).length > 0 ? (
                          <>
                            {invoice.payment_terms.slice(0, 2).map((term, idx) => (
                              <div key={term.id || idx} className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    term.paid ? "bg-success/10 text-success border-success" : ""
                                  )}
                                >
                                  {term.name} - {term.percentage}%
                                </Badge>
                              </div>
                            ))}
                            {invoice.payment_terms.length > 2 && (
                              <p className="text-xs text-muted-foreground">+{invoice.payment_terms.length - 2} termin lainnya</p>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Belum ada termin</span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleOpenTerminDialog(invoice)}
                        >
                          <Pencil className="mr-1 h-3 w-3" />
                          Edit Termin
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge className={status.className}>{status.label}</Badge>
                        {remainingAmount > 0 && invoice.status !== "paid" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Sisa: {formatCurrency(remainingAmount)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenPreview(invoice)}
                          title="Lihat Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDownloadPDF(invoice)}
                          disabled={isDownloading}
                          title="Download PDF"
                        >
                          {isDownloading && previewInvoice?.id === invoice.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileDown className="h-4 w-4" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenPreview(invoice)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                              <FileDown className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenTerminDialog(invoice)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Termin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                              <Check className="mr-2 h-4 w-4" />
                              Tandai Lunas
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteInvoice(invoice)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Create Invoice Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
                  <Label>Terbit Invoice *</Label>
                  <Input 
                    type="date" 
                    value={formData.issue_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                  />
                </div>
              </div>

              {/* Company Settings Info */}
              <div className="rounded-lg border border-border p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Logo & Tanda Tangan</h4>
                    <p className="text-sm text-muted-foreground">
                      {companySettings?.logo_url && companySettings?.signature_url 
                        ? "Logo dan tanda tangan sudah diatur" 
                        : "Klik Pengaturan Invoice untuk mengatur logo dan tanda tangan permanen"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {companySettings?.logo_url && (
                      <img src={companySettings.logo_url} alt="Logo" className="h-10 w-10 object-contain rounded border" />
                    )}
                    {companySettings?.signature_url && (
                      <img src={companySettings.signature_url} alt="Signature" className="h-10 object-contain rounded border" />
                    )}
                    {(!companySettings?.logo_url || !companySettings?.signature_url) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setIsSettingsDialogOpen(true);
                        }}
                      >
                        <Settings className="mr-2 h-3 w-3" />
                        Atur Sekarang
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 font-medium">Item Invoice</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-5">Deskripsi</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Harga</div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-1"></div>
                  </div>
                  {formItems.map((item, index) => (
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
                        className="col-span-2" 
                        value={formatCurrency((parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0))} 
                        readOnly 
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="col-span-1"
                        onClick={() => handleRemoveItem(index)}
                        disabled={formItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Tahap Pembayaran (Termin)</h4>
                  <Button variant="outline" size="sm" onClick={handleAddPaymentTerm}>
                    <Plus className="mr-2 h-3 w-3" />
                    Tambah Termin
                  </Button>
                </div>
                {paymentTerms.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                      <div className="col-span-3">Nama</div>
                      <div className="col-span-2">Persentase</div>
                      <div className="col-span-3">Jumlah</div>
                      <div className="col-span-3">Tanggal</div>
                      <div className="col-span-1"></div>
                    </div>
                    {paymentTerms.map((term, index) => (
                      <div key={term.id} className="grid grid-cols-12 gap-2">
                        <Input 
                          className="col-span-3" 
                          value={term.name}
                          onChange={(e) => handleTermChange(index, "name", e.target.value)}
                        />
                        <div className="col-span-2 flex items-center gap-1">
                          <Input 
                            type="number" 
                            value={term.percentage || ""}
                            onChange={(e) => handleTermChange(index, "percentage", parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-sm">%</span>
                        </div>
                        <Input 
                          className="col-span-3" 
                          value={formatCurrency(term.amount || 0)} 
                          readOnly 
                        />
                        <Input 
                          className="col-span-3" 
                          type="date" 
                          value={term.date || ""}
                          onChange={(e) => handleTermChange(index, "date", e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="col-span-1"
                          onClick={() => handleRemoveTerm(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada termin pembayaran. Klik "Tambah Termin" untuk menambahkan.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!formData.customer_id || !formData.issue_date || formItems.every(i => !i.description) || isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Buat Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Payment Terms Dialog */}
        <Dialog open={isTerminDialogOpen} onOpenChange={(open) => { setIsTerminDialogOpen(open); if (!open) { setEditingInvoice(null); setPaymentTerms([]); } }}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Tahap Pembayaran</DialogTitle>
              <DialogDescription>
                Kelola termin pembayaran untuk invoice {editingInvoice?.invoice_number}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {editingInvoice && (
                <div className="mb-4 p-3 rounded-lg border border-border bg-muted/30">
                  <p className="font-medium">{editingInvoice.customers?.name}</p>
                  <p className="text-sm text-muted-foreground">Total: {formatCurrency(Number(editingInvoice.amount))}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Termin Pembayaran</h4>
                <Button variant="outline" size="sm" onClick={handleAddPaymentTerm}>
                  <Plus className="mr-2 h-3 w-3" />
                  Tambah Termin
                </Button>
              </div>
              
              {paymentTerms.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-3">Nama</div>
                    <div className="col-span-2">Persentase</div>
                    <div className="col-span-2">Jumlah</div>
                    <div className="col-span-2">Tanggal</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1"></div>
                  </div>
                  {paymentTerms.map((term, index) => (
                    <div key={term.id} className="grid grid-cols-12 gap-2 items-center">
                      <Input 
                        className="col-span-3" 
                        value={term.name}
                        onChange={(e) => handleTermChange(index, "name", e.target.value)}
                      />
                      <div className="col-span-2 flex items-center gap-1">
                        <Input 
                          type="number" 
                          value={term.percentage || ""}
                          onChange={(e) => {
                            const percentage = parseFloat(e.target.value) || 0;
                            const amount = (Number(editingInvoice?.amount || 0) * percentage) / 100;
                            const newTerms = [...paymentTerms];
                            newTerms[index].percentage = percentage;
                            newTerms[index].amount = amount;
                            setPaymentTerms(newTerms);
                          }}
                        />
                        <span className="text-sm">%</span>
                      </div>
                      <Input 
                        className="col-span-2" 
                        type="number"
                        value={term.amount || ""}
                        onChange={(e) => handleTermChange(index, "amount", parseFloat(e.target.value) || 0)}
                      />
                      <Input 
                        className="col-span-2" 
                        type="date" 
                        value={term.date || ""}
                        onChange={(e) => handleTermChange(index, "date", e.target.value)}
                      />
                      <div className="col-span-2">
                        <Select 
                          value={term.paid ? "paid" : "unpaid"} 
                          onValueChange={(value) => handleTermChange(index, "paid", value === "paid")}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">Belum Lunas</SelectItem>
                            <SelectItem value="paid">Lunas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="col-span-1"
                        onClick={() => handleRemoveTerm(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada termin pembayaran.</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTerminDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveTerms} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={(open) => { setIsPreviewDialogOpen(open); if (!open) setPreviewInvoice(null); }}>
          <DialogContent className="max-w-[900px] max-h-[95vh] overflow-y-auto p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Preview Invoice</DialogTitle>
              <DialogDescription>
                Invoice {previewInvoice?.invoice_number} - {previewInvoice?.customers?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-4 bg-gray-100">
              {previewInvoice && (
                <div className="border rounded-lg overflow-hidden shadow-lg">
                  <InvoicePreview 
                    ref={invoicePreviewRef} 
                    invoice={previewInvoice} 
                    logoUrl={companySettings?.logo_url}
                    signatureUrl={companySettings?.signature_url}
                  />
                </div>
              )}
            </div>
            <DialogFooter className="p-6 pt-0">
              <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                Tutup
              </Button>
              <Button onClick={() => previewInvoice && handleDownloadPDF(previewInvoice)} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hidden PDF Renderer */}
        <div className="fixed left-[-9999px] top-0" aria-hidden="true">
          {previewInvoice && (
            <InvoicePreview 
              ref={downloadPreviewRef} 
              invoice={previewInvoice} 
              logoUrl={companySettings?.logo_url}
              signatureUrl={companySettings?.signature_url}
            />
          )}
        </div>

        {/* Company Settings Dialog */}
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Pengaturan Invoice</DialogTitle>
              <DialogDescription>
                Atur logo dan tanda tangan yang akan digunakan pada semua invoice.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Logo Upload */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 font-medium">Logo Perusahaan</h4>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden bg-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center">
                        {isUploadingLogo ? (
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        ) : (
                          <>
                            <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1 block">Upload</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <div className="text-sm text-muted-foreground">
                    <p>Logo akan tampil di header invoice.</p>
                    <p>Format: JPG, PNG (maks. 2MB)</p>
                  </div>
                </div>
              </div>

              {/* Signature Upload */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 font-medium">Tanda Tangan Digital</h4>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-32 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden bg-white"
                    onClick={() => signatureInputRef.current?.click()}
                  >
                    {signaturePreview ? (
                      <img src={signaturePreview} alt="Signature preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center">
                        {isUploadingSignature ? (
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        ) : (
                          <>
                            <Pencil className="h-5 w-5 mx-auto text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1 block">Upload TTD</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    ref={signatureInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSignatureUpload}
                  />
                  <div className="text-sm text-muted-foreground">
                    <p>Tanda tangan akan tampil di bagian bawah invoice.</p>
                    <p>Disarankan menggunakan gambar dengan background transparan (PNG).</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleSaveCompanySettings} 
                disabled={isSubmitting || isUploadingLogo || isUploadingSignature}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pengaturan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}