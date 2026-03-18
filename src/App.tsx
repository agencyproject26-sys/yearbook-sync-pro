import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Pelanggan from "./pages/Pelanggan";
import Order from "./pages/Order";
import Kalender from "./pages/Kalender";
import KalenderPublik from "./pages/KalenderPublik";
import Invoice from "./pages/Invoice";
import Pembayaran from "./pages/Pembayaran";
import Gaji from "./pages/Gaji";
import Laporan from "./pages/Laporan";
import RecycleBin from "./pages/RecycleBin";
import Pengaturan from "./pages/Pengaturan";
import Case from "./pages/Case";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/kalender-publik" element={<KalenderPublik />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/pelanggan" element={<ProtectedRoute><Pelanggan /></ProtectedRoute>} />
            <Route path="/order" element={<ProtectedRoute><Order /></ProtectedRoute>} />
            <Route path="/kalender" element={<ProtectedRoute><Kalender /></ProtectedRoute>} />
            <Route path="/invoice" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
            <Route path="/pembayaran" element={<ProtectedRoute><Pembayaran /></ProtectedRoute>} />
            <Route path="/gaji" element={<ProtectedRoute><Gaji /></ProtectedRoute>} />
            <Route path="/laporan" element={<ProtectedRoute><Laporan /></ProtectedRoute>} />
            <Route path="/recycle-bin" element={<ProtectedRoute><RecycleBin /></ProtectedRoute>} />
            <Route path="/case" element={<ProtectedRoute><Case /></ProtectedRoute>} />
            <Route path="/pengaturan" element={<ProtectedRoute><Pengaturan /></ProtectedRoute>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
