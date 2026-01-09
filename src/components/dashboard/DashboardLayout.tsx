import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  CalendarDays,
  Repeat,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AccountProvider } from "@/contexts/AccountContext";
import AccountSelector from "./AccountSelector";
import Logo from "@/assets/logo_basefin.svg";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: ArrowLeftRight, label: "Transações", path: "/dashboard/transacoes" },
  { icon: CreditCard, label: "Cartões", path: "/dashboard/cartoes" },
  { icon: CalendarDays, label: "Parcelamentos", path: "/dashboard/parcelamentos" },
  { icon: Repeat, label: "Contas Fixas", path: "/dashboard/contas-fixas" },
  { icon: BarChart3, label: "Relatórios", path: "/dashboard/relatorios" },
  { icon: Settings, label: "Configurações", path: "/dashboard/configuracoes" },
];

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find((item) => item.path === location.pathname);
    return currentItem?.label || "Dashboard";
  };

  return (
    <AccountProvider>
      <div className="min-h-screen bg-background flex">
        {/* Mobile overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 glass-card border-0 border-r border-border/30 transform transition-transform duration-300 lg:transform-none ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex flex-col h-full p-4">
            {/* Logo */}
            <div className="flex items-center justify-between mb-8 px-2">
              <Link to="/" className="flex items-center gap-3">
                <img src={Logo} alt="BaseFin" className="h-8 w-8" />
                <span className="text-lg font-bold">BaseFin</span>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="justify-start text-muted-foreground"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 glass-card border-0 border-b border-border/30 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden text-muted-foreground hover:text-foreground"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">{getCurrentPageTitle()}</h1>
              </div>
              <AccountSelector />
            </div>
          </header>

          {/* Page Content - Outlet renders child routes */}
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </AccountProvider>
  );
};

export default DashboardLayout;
