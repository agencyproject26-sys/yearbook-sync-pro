import { forwardRef, useState, useEffect } from "react";
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface ReceiptPreviewProps {
  receiptNumber: number;
  receivedFrom: string;
  amountInWords: string;
  paymentDescription: string;
  transferAmount: number;
  cashAmount: number;
  totalAmount: number;
  date: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(
  ({ receiptNumber, receivedFrom, amountInWords, paymentDescription, transferAmount, cashAmount, totalAmount, date }, ref) => {
    const { settings, getSignatureUrl } = useCompanySettings();
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

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
        className="bg-white text-black p-8"
        style={{ 
          width: "210mm", 
          minHeight: "148mm",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              className="h-16 w-16 object-contain"
            />
          ) : (
            <div className="h-16 w-16 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
              Logo
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-black">PT CREATIVE SHOOT</h1>
            <p className="text-sm text-gray-600">Villa Gading harapan 1, AR 3 No 16, Babelan - Kab. Bekasi</p>
            <p className="text-sm text-gray-600">Telp. 081211352027</p>
            <p className="text-sm text-gray-600">www.creativeshoot.net / Ig. creativeshoot.pro</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-red-600 tracking-wider">KWITANSI</h2>
        </div>

        {/* Content Table */}
        <div className="border border-gray-400 mb-6">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-gray-400">
                <td className="p-3 w-40 font-medium border-r border-gray-400 bg-gray-50">No :</td>
                <td className="p-3">{receiptNumber}</td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="p-3 font-medium border-r border-gray-400 bg-gray-50">Telah Terima Dari</td>
                <td className="p-3">{receivedFrom}</td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="p-3 font-medium border-r border-gray-400 bg-gray-50">Uang Sejumlah</td>
                <td className="p-3 capitalize italic">{amountInWords}</td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="p-3 font-medium border-r border-gray-400 bg-gray-50">Untuk Pembayaran</td>
                <td className="p-3">{paymentDescription}</td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="p-3 font-medium border-r border-gray-400 bg-gray-50">Transfer</td>
                <td className="p-3">{formatCurrency(transferAmount)}</td>
              </tr>
              <tr>
                <td className="p-3 font-medium border-r border-gray-400 bg-gray-50">Cash</td>
                <td className="p-3">{formatCurrency(cashAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer - Date, Amount, and Signature */}
        <div className="flex justify-between items-end">
          <div className="text-sm">
            <p>{formatDate(date)}</p>
          </div>
          
          <div className="text-center">
            <p className="font-bold text-lg mb-4">{formatCurrency(totalAmount)}</p>
          </div>

          <div className="text-center">
            <p className="text-red-600 font-bold mb-2">CREATIVE SHOOT</p>
            {signatureUrl ? (
              <img 
                src={signatureUrl} 
                alt="Signature" 
                className="h-12 mx-auto mb-2 object-contain"
              />
            ) : (
              <div className="h-12 mb-2"></div>
            )}
            <p className="font-medium">Sofyan Septiyadi</p>
          </div>
        </div>
      </div>
    );
  }
);

ReceiptPreview.displayName = "ReceiptPreview";
