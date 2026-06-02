import { useParams, Link } from "wouter";
import { useListArticles, useListCategories } from "@workspace/api-client-react";
import ArticleCard from "@/components/article/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories } = useListCategories();
  
  const category = categories?.find(c => c.slug === slug);
  const categoryId = category?.id;

  const { data, isLoading } = useListArticles({ 
    categoryId, 
    status: "PUBLISHED",
    limit: 20
  }, { query: { enabled: !!categoryId } });

  if (!categories) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-10 w-48 mb-8" /></div>;
  if (!category) return <div className="container mx-auto px-4 py-8 text-center"><h1 className="text-2xl font-bold mb-4">Kategori tidak ditemukan</h1><Button asChild><Link href="/">Kembali ke Beranda</Link></Button></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight" style={{ color: category.color || 'var(--primary)' }}>
          Kategori: {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-full aspect-[4/3] rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))
        ) : data?.articles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Belum ada berita di kategori ini.
          </div>
        ) : (
          data?.articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))
        )}
      </div>
    </div>
  );
}