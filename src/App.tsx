import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Dashboard child pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import TransacoesPage from "./pages/dashboard/TransacoesPage";
import CartoesPage from "./pages/dashboard/CartoesPage";
import ParcelamentosPage from "./pages/dashboard/ParcelamentosPage";
import ContasFixasPage from "./pages/dashboard/ContasFixasPage";
import RelatoriosPage from "./pages/dashboard/RelatoriosPage";
import ConfiguracoesPage from "./pages/dashboard/ConfiguracoesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<DashboardHome />} />
                <Route path="transacoes" element={<TransacoesPage />} />
                <Route path="cartoes" element={<CartoesPage />} />
                <Route path="parcelamentos" element={<ParcelamentosPage />} />
                <Route path="contas-fixas" element={<ContasFixasPage />} />
                <Route path="relatorios" element={<RelatoriosPage />} />
                <Route path="configuracoes" element={<ConfiguracoesPage />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
