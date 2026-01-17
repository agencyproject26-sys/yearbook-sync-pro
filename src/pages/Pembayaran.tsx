import { useState, useRef } from "react";
import { Search, Download, Eye, Plus, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePayments, Payment, PaymentFormData } from "@/hooks/usePayments";
import { useInvoices } from "@/hooks/useInvoices";
import { ReceiptPreview } from "@/components/receipt/ReceiptPreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
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

interface FormData {
  receipt_number: string;
  invoice_id: string;
  school: string;
  customer: string;
  amount: string;
  transfer_amount: string;
  cash_amount: string;
  date: string;
  description: string;
}

const emptyFormData: FormData = {
  receipt_number: "",
  invoice_id: "",
  school: "",
  customer: "",
  amount: "",
  transfer_amount: "",
  cash_amount: "",
  date: "",
  description: "",
};

export default function Pembayaran() {
  const { payments, loading, addPayment, refetch } = usePayments();
  const { invoices } = useInvoices();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadPreviewRef = useRef<HTMLDivElement>(null);

  const filteredPayments = payments.filter((payment) =>
    (payment.invoices?.customers?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.receipt_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  const openPreview = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPreviewOpen(true);
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        invoice_id: invoiceId,
        school: invoice.customers?.name || "",
        customer: invoice.customers?.pic_name || "",
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

    const success = await addPayment(paymentData);
    if (success) {
      setFormData(emptyFormData);
      setIsDialogOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setFormData(emptyFormData);
    }
  };

  const getReceiptNumber = (payment: Payment): number => {
    // Extract number from receipt_number like "KWT-2026-001" -> 1
    const match = payment.receipt_number.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const handleDownloadPDF = async (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDownloading(true);

    // Wait for the preview to render
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
        <div className="mb-6">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari kwitansi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>No. Kwitansi</th>
                  <th>Sekolah</th>
                  <th>Jumlah</th>
                  <th>Keterangan</th>
                  <th>Tanggal</th>
                  <th>Invoice</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="font-medium">{payment.receipt_number}</td>
                    <td>
                      <div>
                        <p className="font-medium">{payment.invoices?.customers?.name || "-"}</p>
                        <p className="text-sm text-muted-foreground">{payment.invoices?.customers?.pic_name || "-"}</p>
                      </div>
                    </td>
                    <td className="font-semibold text-success">{formatCurrency(payment.amount)}</td>
                    <td className="text-muted-foreground">{payment.description || "-"}</td>
                    <td className="text-muted-foreground">{payment.payment_date}</td>
                    <td>
                      <Badge variant="outline">{payment.invoices?.invoice_number || "-"}</Badge>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openPreview(payment)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDownloadPDF(payment)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Belum ada data pembayaran
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Payment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Catat Pembayaran Baru</DialogTitle>
              <DialogDescription>
                Buat kwitansi untuk pembayaran yang diterima.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>No. Kwitansi *</Label>
                <Input 
                  type="number" 
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
                    {invoices.map(inv => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.invoice_number} - {inv.customers?.name || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Jumlah Pembayaran *</Label>
                <Input 
                  type="number" 
                  placeholder="2400000" 
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Via Transfer</Label>
                  <Input 
                    type="number" 
                    placeholder="1000000" 
                    value={formData.transfer_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, transfer_amount: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Via Cash</Label>
                  <Input 
                    type="number" 
                    placeholder="1400000" 
                    value={formData.cash_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, cash_amount: e.target.value }))}
                  />
                </div>
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
                Simpan Pembayaran
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                  receivedFrom={`${selectedPayment.invoices?.customers?.name || ""} ( ${selectedPayment.invoices?.customers?.pic_name || ""} )`}
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
              receivedFrom={`${selectedPayment.invoices?.customers?.name || ""} ( ${selectedPayment.invoices?.customers?.pic_name || ""} )`}
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
    </MainLayout>
  );
}
