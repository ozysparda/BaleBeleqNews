import { useParams, Link } from "wouter";
import { useGetArticle, useGetRelatedArticles } from "@workspace/api-client-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/article/ArticleCard";
import { Facebook, Twitter, MessageCircle } from "lucide-react";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const articleId = Number(id);

  const { data: article, isLoading, error } = useGetArticle(articleId, { query: { enabled: !!articleId }});
  const { data: relatedArticles, isLoading: isLoadingRelated } = useGetRelatedArticles(articleId, { query: { enabled: !!articleId }});

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="w-full aspect-video rounded-xl mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Berita tidak ditemukan</h1>
        <p className="text-muted-foreground mb-8">Maaf, berita yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
        <Button asChild><Link href="/">Kembali ke Beranda</Link></Button>
      </div>
    );
  }

  const publishedDate = article.publishedAt || article.createdAt;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="lg:col-span-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {article.category && (
                <Link href={`/kategori/${article.category.slug}`}>
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded hover:bg-primary/90 transition-colors">
                    {article.category.name}
                  </span>
                </Link>
              )}
              {article.isBreaking && (
                <span className="bg-destructive text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded animate-pulse">
                  Breaking
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {article.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                  {article.author?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="font-medium text-sm">{article.author?.name || 'Redaksi'}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(publishedDate), "EEEE, d MMMM yyyy HH:mm", { locale: idLocale })} WIB
                  </p>
                </div>
              </div>
              
              {/* Share buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground mr-2">Bagikan:</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full text-sky-500 hover:text-sky-600 hover:bg-sky-50" asChild>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full text-green-500 hover:text-green-600 hover:bg-green-50" asChild>
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + " " + currentUrl)}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {article.coverImage && (
            <figure className="mb-8">
              <img 
                src={article.coverImage} 
                alt={article.title} 
                className="w-full aspect-video object-cover rounded-xl shadow-sm"
              />
            </figure>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <div className="text-lg font-medium text-muted-foreground mb-8 border-l-4 border-primary pl-4 py-1 italic">
              {article.excerpt}
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none 
              prose-headings:font-bold prose-headings:text-foreground
              prose-p:text-foreground/90 prose-p:leading-relaxed
              prose-a:text-primary hover:prose-a:text-primary/80
              prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />
          
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-muted/30 p-6 rounded-xl border">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-4 border-b-2 border-primary pb-2 inline-block">
              Berita Terkait
            </h3>
            
            <div className="space-y-6 mt-2">
              {isLoadingRelated ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-24 h-20 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : relatedArticles && relatedArticles.length > 0 ? (
                relatedArticles.map(related => (
                  <Link key={related.id} href={`/berita/${related.id}`} className="group flex gap-4 items-start">
                    <img 
                      src={related.coverImage || "https://placehold.co/400x300?text=No+Image"} 
                      alt={related.title}
                      className="w-24 h-20 object-cover rounded shadow-sm shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-3">
                        {related.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(related.publishedAt || related.createdAt), "d MMM yyyy", { locale: idLocale })}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada berita terkait.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}