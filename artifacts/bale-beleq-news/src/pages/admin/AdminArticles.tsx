import { useState } from "react";
import { useListArticles, useDeleteArticle } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getListArticlesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminArticles() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListArticles({ page, limit: 10, search, status });
  const deleteMutation = useDeleteArticle();

  const handleDelete = (articleId: number) => {
    deleteMutation.mutate({ id: articleId }, {
      onSuccess: () => {
        toast({ title: "Berita berhasil dihapus" });
        queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Gagal menghapus berita", description: err.message, variant: "destructive" });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PUBLISHED': return <Badge className="bg-green-600">Terbit</Badge>;
      case 'PENDING_REVIEW': return <Badge variant="secondary" className="bg-amber-500 text-white">Menunggu Review</Badge>;
      case 'DRAFT': return <Badge variant="outline">Draft</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Berita</h1>
        <Button asChild>
          <Link href="/admin/berita/baru">
            <Plus className="w-4 h-4 mr-2" /> Tulis Berita
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari judul..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status || "all"} onValueChange={(val) => setStatus(val === "all" ? null : val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="PUBLISHED">Terbit</SelectItem>
            <SelectItem value="PENDING_REVIEW">Menunggu Review</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Penulis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Memuat data...</TableCell>
              </TableRow>
            ) : data?.articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada berita ditemukan</TableCell>
              </TableRow>
            ) : (
              data?.articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    {article.title}
                    {article.isBreaking && <Badge variant="destructive" className="ml-2 text-[10px] h-4">BREAKING</Badge>}
                  </TableCell>
                  <TableCell>{article.category?.name || "-"}</TableCell>
                  <TableCell>{article.author?.name}</TableCell>
                  <TableCell>{getStatusBadge(article.status)}</TableCell>
                  <TableCell>{format(new Date(article.createdAt), "d MMM yyyy", { locale: id })}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/berita/${article.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Berita akan dihapus secara permanen dari sistem.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(article.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Menampilkan {data?.articles.length || 0} dari {data?.total || 0} berita
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Sebelumnya
          </Button>
          <Button variant="outline" size="sm" disabled={!data || data.articles.length < data.limit} onClick={() => setPage(p => p + 1)}>
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}