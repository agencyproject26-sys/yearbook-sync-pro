import { forwardRef } from "react";
import type { Invoice, PaymentTerm } from "@/hooks/useInvoices";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface InvoicePreviewProps {
  invoice: Invoice;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return format(new Date(dateStr), "EEEE, dd MMMM yyyy", { locale: id });
};

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ invoice }, ref) => {
    const items = (invoice.items || []) as { description: string; qty: number; price: number }[];
    const paymentTerms = invoice.payment_terms || [];
    
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    
    // Calculate amount due (unpaid terms total)
    const paidAmount = paymentTerms
      .filter((term) => term.paid)
      .reduce((sum, term) => sum + (term.amount || 0), 0);
    const amountDue = subtotal - paidAmount;

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 w-[210mm] min-h-[297mm] mx-auto font-sans text-sm"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-4">
            {invoice.company_logo_url ? (
              <img
                src={invoice.company_logo_url}
                alt="Company Logo"
                className="w-20 h-20 object-contain"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                Logo
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-[#1a365d]">PT CREATIVE SHOOT</h1>
              <p className="text-xs text-gray-600 mt-1">
                Villa Gading harapan 1, AR 3 No 16, Babelan - Kab. Bekasi
              </p>
              <p className="text-xs text-gray-600">Telp. 081211352027</p>
              <p className="text-xs text-gray-600">
                www.creativeshoot.net / Ig. creativeshoot.pro
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Title */}
        <div className="bg-[#1a365d] text-white text-center py-3 mb-6">
          <h2 className="text-2xl font-bold tracking-widest">INVOICE</h2>
        </div>

        {/* Customer Info */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <div className="flex">
              <span className="w-20 font-semibold">Dear</span>
              <span>: {invoice.customers?.name || "-"}</span>
            </div>
            <div className="flex">
              <span className="w-20 font-semibold">To</span>
              <span>: {invoice.customers?.pic_name || "-"}</span>
            </div>
            <div className="flex">
              <span className="w-20 font-semibold">Address</span>
              <span>: -</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex justify-end">
              <span className="font-semibold mr-2">Date</span>
              <span>: {formatDate(invoice.issue_date)}</span>
            </div>
            <div className="flex justify-end">
              <span className="font-semibold mr-2">Invoice No</span>
              <span>: {invoice.invoice_number}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="bg-[#1a365d] text-white">
              <th className="border border-gray-300 px-3 py-2 text-left">ITEM TYPE</th>
              <th className="border border-gray-300 px-3 py-2 text-left">DESCRIPTION</th>
              <th className="border border-gray-300 px-3 py-2 text-center">QUANTITY</th>
              <th className="border border-gray-300 px-3 py-2 text-right">UNIT PRICE</th>
              <th className="border border-gray-300 px-3 py-2 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="border border-gray-300 px-3 py-2 font-semibold">
                  {index === 0 ? "YEARBOOK" : ""}
                </td>
                <td className="border border-gray-300 px-3 py-2">{item.description}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{item.qty}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  {formatCurrency(item.price)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  {formatCurrency(item.qty * item.price)}
                </td>
              </tr>
            ))}
            {/* Subtotal Row */}
            <tr className="bg-gray-100 font-bold">
              <td colSpan={4} className="border border-gray-300 px-3 py-2 text-right">
                SUBTOTAL
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                {formatCurrency(subtotal)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Payment Section */}
        <div className="mb-6">
          <div className="bg-[#1a365d] text-white text-center py-2 mb-4">
            <h3 className="text-lg font-bold">PAYMENT</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Bank Info */}
            <div className="space-y-1">
              <p className="font-semibold">Transfer Bank</p>
              <p>BCA</p>
              <p className="font-bold text-[#1a365d]">5213700099</p>
              <p className="text-sm text-gray-600">( CREATIVE SHOOT INDONESIA )</p>
            </div>

            {/* Payment Terms Table */}
            <div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1 text-left">STAGE</th>
                    <th className="border border-gray-300 px-2 py-1 text-center">DATE</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">PAYMENT</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentTerms.length > 0 ? (
                    paymentTerms.map((term, index) => (
                      <tr key={term.id || index}>
                        <td className="border border-gray-300 px-2 py-1">
                          {term.name} ({term.percentage}%)
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {term.date ? format(new Date(term.date), "dd/MM/yyyy") : "-"}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          {term.paid ? formatCurrency(term.amount) : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="border border-gray-300 px-2 py-2 text-center text-gray-500">
                        Belum ada termin pembayaran
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Thank You & Amount Due */}
        <div className="flex justify-between items-center mb-8 border-t border-gray-300 pt-4">
          <div>
            <p className="text-[#1a365d] font-semibold">Thank You</p>
            <p className="text-xs text-gray-500">Terms & Conditions</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Amount Due:</p>
            <p className="text-xl font-bold text-[#1a365d]">{formatCurrency(amountDue)}</p>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-1">Regards,</p>
          <p className="font-bold text-[#1a365d] text-lg mb-16">CREATIVE SHOOT</p>
          <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
          <p className="font-semibold">Sofyan Septiyadi</p>
          <p className="text-sm text-gray-600">(Owner Project)</p>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
