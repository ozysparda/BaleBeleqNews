import { useGetBreakingNews, useGetFeaturedArticles, useListArticles, useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import ArticleCard from "@/components/article/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredArticles, isLoading: isLoadingFeatured } = useGetFeaturedArticles();
  const { data: latestArticlesData, isLoading: isLoadingLatest } = useListArticles({ limit: 10, status: "PUBLISHED" });
  const { data: categories } = useListCategories();

  const latestArticles = latestArticlesData?.articles || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        {isLoadingFeatured ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
            <Skeleton className="lg:col-span-2 h-full" />
            <div className="flex flex-col gap-6 h-full">
              <Skeleton className="h-1/2" />
              <Skeleton className="h-1/2" />
            </div>
          </div>
        ) : featuredArticles && featuredArticles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
            <Link href={`/berita/${featuredArticles[0].id}`} className="group lg:col-span-2 relative rounded-lg overflow-hidden h-[400px] lg:h-full">
              <img 
                src={featuredArticles[0].coverImage || "https://placehold.co/800x600?text=No+Image"} 
                alt={featuredArticles[0].title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 lg:p-8">
                {featuredArticles[0].category && (
                  <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded mb-3 w-fit">
                    {featuredArticles[0].category.name}
                  </span>
                )}
                <h1 className="text-white text-2xl lg:text-4xl font-bold leading-tight mb-2 group-hover:underline">
                  {featuredArticles[0].title}
                </h1>
                <div className="flex items-center text-white/80 text-sm gap-4">
                  <span>{featuredArticles[0].author?.name}</span>
                  <span>{format(new Date(featuredArticles[0].publishedAt || featuredArticles[0].createdAt), "d MMMM yyyy", { locale: id })}</span>
                </div>
              </div>
            </Link>
            
            <div className="flex flex-col gap-6 h-full">
              {featuredArticles.slice(1, 3).map((article) => (
                <Link key={article.id} href={`/berita/${article.id}`} className="group relative rounded-lg overflow-hidden flex-1 h-[250px] lg:h-auto">
                  <img 
                    src={article.coverImage || "https://placehold.co/600x400?text=No+Image"} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                    {article.category && (
                      <span className="inline-block bg-accent text-white text-xs font-bold px-2 py-1 uppercase tracking-wider rounded mb-2 w-fit">
                        {article.category.name}
                      </span>
                    )}
                    <h2 className="text-white text-lg font-bold leading-tight group-hover:underline line-clamp-3">
                      {article.title}
                    </h2>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between border-b-2 border-primary mb-6 pb-2">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">Berita Terbaru</h2>
          </div>
          
          <div className="flex flex-col gap-6">
            {isLoadingLatest ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-1/3 h-32" />
                  <div className="w-2/3 space-y-2">
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-full h-6" />
                    <Skeleton className="w-3/4 h-6" />
                    <Skeleton className="w-32 h-4" />
                  </div>
                </div>
              ))
            ) : latestArticles.length > 0 ? (
              latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} layout="horizontal" />
              ))
            ) : (
              <p className="text-muted-foreground italic">Belum ada berita.</p>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <div>
            <div className="flex items-center justify-between border-b-2 border-accent mb-6 pb-2">
              <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">Kategori Pilihan</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories?.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/kategori/${cat.slug}`}
                  className="bg-card border hover:border-primary hover:text-primary transition-colors px-4 py-2 text-sm font-medium rounded"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}