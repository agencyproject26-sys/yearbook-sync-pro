import { useState } from "react";
import { Search, Download, Eye, Plus } from "lucide-react";
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

interface Payment {
  id: string;
  receiptNumber: string;
  customer: string;
  school: string;
  amount: number;
  description: string;
  date: string;
  invoiceId: string;
}

const mockPayments: Payment[] = [
  {
    id: "1",
    receiptNumber: "KWT-2026-001",
    customer: "Bpk. Ahmad",
    school: "SMA Negeri 1 Jakarta",
    amount: 22500000,
    description: "Pembayaran DP 50% Buku Tahunan",
    date: "2026-01-15",
    invoiceId: "INV-2026-001",
  },
  {
    id: "2",
    receiptNumber: "KWT-2026-002",
    customer: "Ibu Sari",
    school: "SMP Islam Al-Azhar",
    amount: 16000000,
    description: "Pembayaran DP 50% Buku Tahunan",
    date: "2026-01-14",
    invoiceId: "INV-2026-002",
  },
  {
    id: "3",
    receiptNumber: "KWT-2026-003",
    customer: "Ibu Sari",
    school: "SMP Islam Al-Azhar",
    amount: 16000000,
    description: "Pelunasan 50% Buku Tahunan",
    date: "2026-01-20",
    invoiceId: "INV-2026-002",
  },
];

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

export default function Pembayaran() {
  const [payments] = useState<Payment[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const filteredPayments = payments.filter((payment) =>
    payment.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  const openPreview = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPreviewOpen(true);
  };

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
            <p className="text-2xl font-bold text-success">{payments.filter(p => p.date.startsWith("2026-01")).length}</p>
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
                  <td className="font-medium">{payment.receiptNumber}</td>
                  <td>
                    <div>
                      <p className="font-medium">{payment.school}</p>
                      <p className="text-sm text-muted-foreground">{payment.customer}</p>
                    </div>
                  </td>
                  <td className="font-semibold text-success">{formatCurrency(payment.amount)}</td>
                  <td className="text-muted-foreground">{payment.description}</td>
                  <td className="text-muted-foreground">{payment.date}</td>
                  <td>
                    <Badge variant="outline">{payment.invoiceId}</Badge>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openPreview(payment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Payment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Catat Pembayaran Baru</DialogTitle>
              <DialogDescription>
                Buat kwitansi untuk pembayaran yang diterima.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Invoice</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inv1">INV-2026-001 - SMA Negeri 1 Jakarta</SelectItem>
                    <SelectItem value="inv2">INV-2026-002 - SMP Islam Al-Azhar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Jumlah Pembayaran</Label>
                <Input type="number" placeholder="22500000" />
              </div>
              <div className="grid gap-2">
                <Label>Tanggal Pembayaran</Label>
                <Input type="date" />
              </div>
              <div className="grid gap-2">
                <Label>Keterangan</Label>
                <Textarea placeholder="Pembayaran DP 50% Buku Tahunan" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                <Plus className="mr-2 h-4 w-4" />
                Simpan Pembayaran
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Receipt Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Preview Kwitansi</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="rounded-lg border border-border bg-white p-8 text-foreground">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between border-b border-border pb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
                      CS
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">PT CREATIVE SHOOT INDONESIA</h2>
                      <p className="text-sm text-muted-foreground">Vendor Buku Tahunan Sekolah</p>
                      <p className="text-sm text-muted-foreground">Jl. Raya Serpong No. 123, Tangerang Selatan</p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-bold text-primary">KWITANSI</h1>
                  <p className="text-sm text-muted-foreground">No: {selectedPayment.receiptNumber}</p>
                </div>

                {/* Content */}
                <div className="mb-8 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <p className="font-medium text-muted-foreground">Telah Terima Dari</p>
                    <p className="col-span-2">: {selectedPayment.school}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <p className="font-medium text-muted-foreground">Uang Sejumlah</p>
                    <p className="col-span-2 font-bold">: {formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <p className="font-medium text-muted-foreground">Terbilang</p>
                    <p className="col-span-2 italic">: {numberToWords(selectedPayment.amount)} rupiah</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <p className="font-medium text-muted-foreground">Untuk Pembayaran</p>
                    <p className="col-span-2">: {selectedPayment.description}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-end justify-between border-t border-border pt-6">
                  <p className="text-sm text-muted-foreground">Tanggal: {selectedPayment.date}</p>
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
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Tutup
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
