import { useLocation } from "wouter";
import { useListArticles } from "@workspace/api-client-react";
import ArticleCard from "@/components/article/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";

export default function Search() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [searchVal, setSearchVal] = useState(initialQuery);

  const { data, isLoading } = useListArticles({ 
    search: query, 
    status: "PUBLISHED",
    limit: 20
  }, { query: { enabled: !!query } });

  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q !== query) {
      setQuery(q);
      setSearchVal(q);
    }
  }, [location]); // Re-run when location changes

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setLocation(`/cari?q=${encodeURIComponent(searchVal)}`);
      setQuery(searchVal);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-6">
          Pencarian Berita
        </h1>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            placeholder="Ketik kata kunci pencarian..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="text-lg py-6"
          />
          <Button type="submit" size="lg" className="px-8">
            <SearchIcon className="w-5 h-5 mr-2" /> Cari
          </Button>
        </form>
      </div>

      {query && (
        <div className="mb-6">
          <h2 className="text-xl font-medium">
            Hasil pencarian untuk: <span className="font-bold">"{query}"</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Ditemukan {data?.total || 0} berita
          </p>
        </div>
      )}

      {query ? (
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
            <div className="col-span-full py-12 text-center bg-muted/30 rounded-xl border">
              <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Tidak menemukan hasil</h3>
              <p className="text-muted-foreground">Coba gunakan kata kunci lain yang lebih umum.</p>
            </div>
          ) : (
            data?.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Masukkan kata kunci untuk mencari berita</p>
        </div>
      )}
    </div>
  );
}