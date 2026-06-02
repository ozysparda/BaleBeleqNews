import { 
  useGetDashboardStats, 
  useGetArticlesByCategory, 
  useGetRecentActivity 
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Eye, FolderOpen, Users } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: categoryStats, isLoading: categoryLoading } = useGetArticlesByCategory();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Berita" 
          value={stats?.totalArticles} 
          subtitle={`${stats?.publishedArticles || 0} dipublikasi`}
          icon={<FileText className="w-4 h-4 text-muted-foreground" />}
          loading={statsLoading} 
        />
        <StatCard 
          title="Total Pembaca" 
          value={stats?.totalViews} 
          icon={<Eye className="w-4 h-4 text-muted-foreground" />}
          loading={statsLoading} 
        />
        <StatCard 
          title="Kategori" 
          value={stats?.totalCategories} 
          icon={<FolderOpen className="w-4 h-4 text-muted-foreground" />}
          loading={statsLoading} 
        />
        <StatCard 
          title="Pengguna" 
          value={stats?.totalUsers} 
          icon={<Users className="w-4 h-4 text-muted-foreground" />}
          loading={statsLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribusi Kategori</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {categoryLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="categoryName" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {activity?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{item.userName}</span> {item.action.toLowerCase()}{" "}
                        <span className="font-medium italic">"{item.articleTitle}"</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.createdAt), "d MMM yyyy, HH:mm", { locale: id })}
                      </p>
                    </div>
                  </div>
                ))}
                {(!activity || activity.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Belum ada aktivitas.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, loading }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value?.toLocaleString("id-ID") || 0}</div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}