import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, FileText, FolderOpen, Image as ImageIcon, Users, Settings, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location !== "/admin/login" && location !== "/admin/setup") {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, location, setLocation]);

  if (!isAuthenticated) return null;

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/berita", label: "Berita", icon: FileText },
    { href: "/admin/kategori", label: "Kategori", icon: FolderOpen },
    { href: "/admin/media", label: "Media", icon: ImageIcon },
    ...(user?.role === "SUPER_ADMIN" ? [{ href: "/admin/pengguna", label: "Pengguna", icon: Users }] : []),
    { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-muted/40">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col fixed inset-y-0 left-0">
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-auto brightness-0 invert" />
            <span className="font-bold tracking-tight">BBN ADMIN</span>
          </Link>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active = location.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-sidebar-foreground/80 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}