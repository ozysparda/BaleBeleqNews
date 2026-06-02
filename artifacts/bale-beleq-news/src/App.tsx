import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";

import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";

import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ArticleDetail from "./pages/ArticleDetail";
import Search from "./pages/Search";

import AdminSetup from "./pages/admin/AdminSetup";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminArticleForm from "./pages/admin/AdminArticleForm";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMedia from "./pages/admin/AdminMedia";

function Router() {
  return (
    <Switch>
      {/* Admin Routes */}
      <Route path="/admin/setup" component={AdminSetup} />
      <Route path="/admin/login" component={AdminLogin} />
      
      <Route path="/admin" component={() => <AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/dashboard" component={() => <AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/berita" component={() => <AdminLayout><AdminArticles /></AdminLayout>} />
      <Route path="/admin/berita/baru" component={() => <AdminLayout><AdminArticleForm /></AdminLayout>} />
      <Route path="/admin/berita/:id/edit" component={() => <AdminLayout><AdminArticleForm /></AdminLayout>} />
      <Route path="/admin/kategori" component={() => <AdminLayout><AdminCategories /></AdminLayout>} />
      <Route path="/admin/pengguna" component={() => <AdminLayout><AdminUsers /></AdminLayout>} />
      <Route path="/admin/pengaturan" component={() => <AdminLayout><AdminSettings /></AdminLayout>} />
      <Route path="/admin/media" component={() => <AdminLayout><AdminMedia /></AdminLayout>} />

      {/* Public Routes */}
      <Route path="/">
        <PublicLayout><Home /></PublicLayout>
      </Route>
      <Route path="/kategori/:slug">
        <PublicLayout><CategoryPage /></PublicLayout>
      </Route>
      <Route path="/berita/:id">
        <PublicLayout><ArticleDetail /></PublicLayout>
      </Route>
      <Route path="/cari">
        <PublicLayout><Search /></PublicLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;