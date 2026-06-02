import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import BreakingTicker from "../article/BreakingTicker";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/cari?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <BreakingTicker />
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Bale Beleq News" className="h-10 w-auto" />
            <div className="hidden sm:block font-bold text-xl text-primary tracking-tight">
              BALE BELEQ NEWS
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 font-medium">
              <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
              <Link href="/kategori/nasional" className="hover:text-primary transition-colors">Nasional</Link>
              <Link href="/kategori/lokal" className="hover:text-primary transition-colors">Lokal Lombok</Link>
              <Link href="/kategori/budaya" className="hover:text-primary transition-colors">Budaya</Link>
            </nav>
            <form onSubmit={handleSearch} className="relative">
              <Input 
                placeholder="Cari berita..." 
                className="w-64 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden border-t p-4 flex flex-col gap-4 bg-card">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input 
                placeholder="Cari berita..." 
                className="w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <nav className="flex flex-col gap-4 font-medium">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Beranda</Link>
              <Link href="/kategori/nasional" onClick={() => setIsMobileMenuOpen(false)}>Nasional</Link>
              <Link href="/kategori/lokal" onClick={() => setIsMobileMenuOpen(false)}>Lokal Lombok</Link>
              <Link href="/kategori/budaya" onClick={() => setIsMobileMenuOpen(false)}>Budaya</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-primary text-primary-foreground py-12 mt-12">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Bale Beleq News" className="h-12 w-auto brightness-0 invert" />
              <span className="font-bold text-2xl tracking-tight">BALE BELEQ NEWS</span>
            </div>
            <p className="text-primary-foreground/80 font-medium italic">"Dari Bale Beleq, Untuk Publik"</p>
            <p className="mt-4 text-primary-foreground/70 text-sm">Informasi • Budaya • Aspirasi</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Kategori</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link href="/kategori/nasional" className="hover:text-white transition-colors">Nasional</Link></li>
              <li><Link href="/kategori/lokal" className="hover:text-white transition-colors">Lokal Lombok</Link></li>
              <li><Link href="/kategori/budaya" className="hover:text-white transition-colors">Budaya</Link></li>
              <li><Link href="/kategori/opini" className="hover:text-white transition-colors">Opini</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Tentang Kami</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link href="/tentang" className="hover:text-white transition-colors">Redaksi</Link></li>
              <li><Link href="/kontak" className="hover:text-white transition-colors">Kontak Kami</Link></li>
              <li><Link href="/pedoman" className="hover:text-white transition-colors">Pedoman Media Siber</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-primary-foreground/20 text-center text-primary-foreground/60 text-sm">
          &copy; {new Date().getFullYear()} Bale Beleq News. All rights reserved.
        </div>
      </footer>
    </div>
  );
}