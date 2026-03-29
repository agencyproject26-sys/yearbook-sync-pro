import { forwardRef } from "react";
import type { Invoice, PaymentTerm } from "@/hooks/useInvoices";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface InvoicePreviewProps {
  invoice: Invoice;
  logoUrl?: string | null;
  signatureUrl?: string | null;
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
  ({ invoice, logoUrl, signatureUrl }, ref) => {
    const items = (invoice.items || []) as { description: string; qty: number; price: number }[];
    const paymentTerms = invoice.payment_terms || [];

    // Use company logo from settings, fallback to invoice-specific logo
    const displayLogo = logoUrl || invoice.company_logo_url;

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

    // Calculate amount due (unpaid terms total)
    const totalTermsAmount = paymentTerms
      .reduce((sum, term) => sum + (term.amount || 0), 0);
    const amountDue = subtotal - totalTermsAmount;

    return (
      <div
        ref={ref}
        className="bg-white text-black w-[210mm] min-h-[297mm] mx-auto font-sans text-sm"
        style={{ fontFamily: "Arial, sans-serif", padding: "15mm 20mm" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-4">
            {displayLogo ? (
              <img
                src={displayLogo}
                alt="Company Logo"
                className="w-24 h-24 object-contain"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                Logo
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#1a365d" }}>
                PT CREATIVE SHOOT INDONESIA
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                Villa Gading Harapan 1, AR 3 No 16, Babelan - Kab. Bekasi
              </p>
              <p className="text-xs text-gray-600">Telp. 081211352027</p>
              <p className="text-xs text-gray-600">
                www.creativeshoot.net | IG: @creativeshoot.pro
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Title */}
        <div
          className="text-white text-center py-3 mb-6"
          style={{ backgroundColor: "#1a365d" }}
        >
          <h2 className="text-2xl font-bold tracking-widest">INVOICE</h2>
        </div>

        {/* Invoice Info Row */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-24 font-semibold">Dear</span>
              <span>: {invoice.customers?.name || "-"}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-semibold">To (PIC)</span>
              <span>: {invoice.customers?.pic_name || "-"}</span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex justify-end">
              <span className="font-semibold mr-2">Invoice No.</span>
              <span>: {invoice.invoice_number}</span>
            </div>
            <div className="flex justify-end">
              <span className="font-semibold mr-2">Date</span>
              <span>: {formatDate(invoice.issue_date)}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse mb-6" style={{ borderColor: "#1a365d" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a365d", color: "white" }}>
              <th className="border px-3 py-2 text-left" style={{ borderColor: "#1a365d", width: "20%" }}>
                ITEM TYPE
              </th>
              <th className="border px-3 py-2 text-left" style={{ borderColor: "#1a365d", width: "35%" }}>
                DESCRIPTION
              </th>
              <th className="border px-3 py-2 text-center" style={{ borderColor: "#1a365d", width: "10%" }}>
                QTY
              </th>
              <th className="border px-3 py-2 text-right" style={{ borderColor: "#1a365d", width: "17%" }}>
                UNIT PRICE
              </th>
              <th className="border px-3 py-2 text-right" style={{ borderColor: "#1a365d", width: "18%" }}>
                AMOUNT
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="border px-3 py-2 font-semibold" style={{ borderColor: "#ccc" }}>
                  {index === 0 ? "YEARBOOK" : ""}
                </td>
                <td className="border px-3 py-2" style={{ borderColor: "#ccc" }}>
                  {item.description}
                </td>
                <td className="border px-3 py-2 text-center" style={{ borderColor: "#ccc" }}>
                  {item.qty}
                </td>
                <td className="border px-3 py-2 text-right" style={{ borderColor: "#ccc" }}>
                  {formatCurrency(item.price)}
                </td>
                <td className="border px-3 py-2 text-right" style={{ borderColor: "#ccc" }}>
                  {formatCurrency(item.qty * item.price)}
                </td>
              </tr>
            ))}
            {/* Subtotal Row */}
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <td
                colSpan={4}
                className="border px-3 py-2 text-right font-bold"
                style={{ borderColor: "#ccc" }}
              >
                SUBTOTAL
              </td>
              <td className="border px-3 py-2 text-right font-bold" style={{ borderColor: "#ccc" }}>
                {formatCurrency(subtotal)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Payment Section */}
        <div className="mb-6">
          <div
            className="text-white text-center py-2 mb-4"
            style={{ backgroundColor: "#1a365d" }}
          >
            <h3 className="text-lg font-bold">PAYMENT</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Bank Info */}
            <div className="space-y-1">
              <p className="font-semibold">Transfer Bank:</p>
              <p className="font-bold text-lg">BCA</p>
              <p className="font-bold text-xl" style={{ color: "#1a365d" }}>
                5213700099
              </p>
              <p className="text-sm text-gray-600">a.n. PT CREATIVE SHOOT INDONESIA</p>
            </div>

            {/* Payment Terms Table */}
            <div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6" }}>
                    <th className="border px-2 py-1 text-left" style={{ borderColor: "#ccc" }}>
                      STAGE
                    </th>
                    <th className="border px-2 py-1 text-center" style={{ borderColor: "#ccc" }}>
                      DATE
                    </th>
                    <th className="border px-2 py-1 text-right" style={{ borderColor: "#ccc" }}>
                      PAYMENT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentTerms.length > 0 ? (
                    paymentTerms.map((term, index) => (
                      <tr key={term.id || index}>
                        <td className="border px-2 py-1" style={{ borderColor: "#ccc" }}>
                          {term.name} ({term.percentage}%)
                        </td>
                        <td className="border px-2 py-1 text-center" style={{ borderColor: "#ccc" }}>
                          {term.date ? format(new Date(term.date), "dd/MM/yyyy") : "-"}
                        </td>
                        <td className="border px-2 py-1 text-right" style={{ borderColor: "#ccc" }}>
                          {formatCurrency(term.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="border px-2 py-2 text-center text-gray-500"
                        style={{ borderColor: "#ccc" }}
                      >
                        Belum ada termin pembayaran
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Amount Due Section */}
        <div className="flex justify-between items-center mb-8 border-t pt-4" style={{ borderColor: "#ccc" }}>
          <div>
            <p className="font-semibold" style={{ color: "#1a365d" }}>
              Thank You For Your Business
            </p>
            <p className="text-xs text-gray-500">Terms & Conditions Apply</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Amount Due:</p>
            <p className="text-2xl font-bold" style={{ color: "#1a365d" }}>
              {formatCurrency(amountDue)}
            </p>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-1">Hormat Kami,</p>
          <p className="font-bold text-lg mb-4" style={{ color: "#1a365d" }}>
            PT CREATIVE SHOOT INDONESIA
          </p>
          {signatureUrl ? (
            <div className="flex justify-center mb-2">
              <img
                src={signatureUrl}
                alt="Signature"
                className="h-16 object-contain"
              />
            </div>
          ) : (
            <div className="h-16 mb-2"></div>
          )}
          <div
            className="border-b w-48 mx-auto mb-2"
            style={{ borderColor: "#333" }}
          ></div>
          <p className="font-semibold">Sofyan Septiyadi</p>
          <p className="text-sm text-gray-600">(Owner Project)</p>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
