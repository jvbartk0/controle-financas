import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CalendarClock, 
  User, 
  Menu,
  Wallet,
  CreditCard,
  Calendar,
  Settings
} from 'lucide-react';
import BaseFinLogo from '@/assets/baselogo/logo_basefin.png';



interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { href: '/cards', label: 'Cartões', icon: CreditCard },
  { href: '/installments', label: 'Parcelamentos', icon: Calendar },
  { href: '/fixed', label: 'Contas Fixas', icon: CalendarClock },
  { href: '/settings', label: 'Configurações', icon: Settings },
  { href: '/profile', label: 'Perfil', icon: User },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const NavContent = () => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-secondary text-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col border-r bg-card">
        <div className="flex items-center gap-3 p-6 border-b">
  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
    <img
      src={BaseFinLogo}
      alt="BaseFin"
      className="w-8 h-8 object-contain"
    />
  </div>
  <span className="text-xl font-bold">BaseFin</span>
</div>
        <div className="flex-1 p-4">
          <NavContent />
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex items-center gap-3 p-6 border-b">
  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
    <img
      src={BaseFinLogo}
      alt="BaseFin"
      className="w-8 h-8 object-contain"
    />
  </div>
  <span className="text-xl font-bold">BaseFin</span>
</div>

              <div className="p-4">
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-lg font-bold flex items-center gap-2">
  <img
    src={BaseFinLogo}
    alt="BaseFin"
    className="w-6 h-6 object-contain"
  />
  BaseFin
</span>

        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="hidden lg:flex items-center justify-end p-4 border-b bg-card">
          <ThemeToggle />
        </div>
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
      <FloatingWhatsApp />
    </div>
  );
};
