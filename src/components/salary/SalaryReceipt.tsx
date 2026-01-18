import { forwardRef, useState, useEffect } from "react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { Camera, Palette, Printer, AlertTriangle } from "lucide-react";

interface SalaryReceiptProps {
  salary: {
    name: string;
    category: string;
    amount: number;
    description: string | null;
    payment_date: string;
    orders?: {
      order_number: string;
    };
  };
}

const categoryLabels: Record<string, string> = {
  photographer: "Photographer",
  design: "Design",
  print: "Percetakan",
  other: "Biaya Tak Terduga",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const numberToWords = (num: number): string => {
  const ones = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  
  if (num < 12) return ones[num];
  if (num < 20) return ones[num - 10] + ' Belas';
  if (num < 100) return ones[Math.floor(num / 10)] + ' Puluh ' + ones[num % 10];
  if (num < 200) return 'Seratus ' + numberToWords(num - 100);
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Ratus ' + numberToWords(num % 100);
  if (num < 2000) return 'Seribu ' + numberToWords(num - 1000);
  if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + ' Ribu ' + numberToWords(num % 1000);
  if (num < 1000000000) return numberToWords(Math.floor(num / 1000000)) + ' Juta ' + numberToWords(num % 1000000);
  return numberToWords(Math.floor(num / 1000000000)) + ' Miliar ' + numberToWords(num % 1000000000);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const SalaryReceipt = forwardRef<HTMLDivElement, SalaryReceiptProps>(
  ({ salary }, ref) => {
    const { settings, getSignatureUrl } = useCompanySettings();
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const amountInWords = numberToWords(salary.amount).trim() + ' Rupiah';

    // Fetch signed URL for signature
    useEffect(() => {
      const fetchSignature = async () => {
        if (settings?.signature_url) {
          const url = await getSignatureUrl(settings.signature_url);
          setSignatureUrl(url);
        }
      };
      fetchSignature();
    }, [settings?.signature_url, getSignatureUrl]);

    return (
      <div
        ref={ref}
        className="bg-white p-8 text-black"
        style={{ width: "210mm", minHeight: "148mm", fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Logo"
                className="h-16 w-auto object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                Logo
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">CREATIVE SHOOT</h1>
              <p className="text-sm">Jl. Anggrek No. 123, Surabaya</p>
              <p className="text-sm">Telp: 0812-3456-7890</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-primary">BUKTI PEMBAYARAN GAJI</h2>
            <p className="text-sm text-gray-600">Tanggal: {formatDate(salary.payment_date)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Telah Dibayarkan Kepada:</p>
              <p className="text-lg font-bold">{salary.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kategori:</p>
              <p className="text-lg font-semibold">{categoryLabels[salary.category] || salary.category}</p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Jumlah Pembayaran:</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(salary.amount)}</p>
            <p className="text-sm italic text-gray-600">Terbilang: {amountInWords}</p>
          </div>

          {salary.orders?.order_number && (
            <div>
              <p className="text-sm text-gray-600">Terkait Order:</p>
              <p className="font-semibold">{salary.orders.order_number}</p>
            </div>
          )}

          {salary.description && (
            <div>
              <p className="text-sm text-gray-600">Keterangan:</p>
              <p className="font-medium">{salary.description}</p>
            </div>
          )}
        </div>

        {/* Footer - Signatures */}
        <div className="mt-12 flex justify-between">
          <div className="text-center">
            <p className="text-sm mb-16">Penerima</p>
            <div className="border-t border-black pt-2 w-40">
              <p className="font-semibold">{salary.name}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm mb-2">Surabaya, {formatDate(salary.payment_date)}</p>
            <p className="text-sm">Mengetahui</p>
            {signatureUrl ? (
              <img
                src={signatureUrl}
                alt="Tanda Tangan"
                className="h-14 w-auto mx-auto object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="h-14" />
            )}
            <div className="border-t border-black pt-2 w-40">
              <p className="font-semibold">Direktur</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SalaryReceipt.displayName = "SalaryReceipt";
