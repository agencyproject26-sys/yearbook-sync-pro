import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Pelanggan from "./pages/Pelanggan";
import Order from "./pages/Order";
import Kalender from "./pages/Kalender";
import Invoice from "./pages/Invoice";
import Pembayaran from "./pages/Pembayaran";
import Gaji from "./pages/Gaji";
import Laporan from "./pages/Laporan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pelanggan" element={<Pelanggan />} />
          <Route path="/order" element={<Order />} />
          <Route path="/kalender" element={<Kalender />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/pembayaran" element={<Pembayaran />} />
          <Route path="/gaji" element={<Gaji />} />
          <Route path="/laporan" element={<Laporan />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
