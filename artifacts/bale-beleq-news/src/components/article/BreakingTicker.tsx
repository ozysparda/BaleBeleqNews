import { useGetBreakingNews } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function BreakingTicker() {
  const { data: articles, isLoading } = useGetBreakingNews();

  if (isLoading || !articles || articles.length === 0) return null;

  return (
    <div className="bg-destructive text-destructive-foreground overflow-hidden h-10 flex items-center relative">
      <div className="px-4 font-bold bg-destructive z-10 h-full flex items-center absolute left-0 shadow-[10px_0_10px_-5px_rgba(0,0,0,0.2)]">
        BREAKING NEWS
      </div>
      <div className="flex-1 overflow-hidden whitespace-nowrap pl-40">
        <div className="inline-block animate-[ticker_30s_linear_infinite]">
          {articles.map((article, idx) => (
            <span key={article.id} className="mx-4">
              <span className="mx-2">•</span>
              <Link href={`/berita/${article.id}`} className="hover:underline font-medium">
                {article.title}
              </Link>
            </span>
          ))}
          {/* Duplicate for seamless scrolling */}
          {articles.map((article, idx) => (
            <span key={article.id + "-dup"} className="mx-4">
              <span className="mx-2">•</span>
              <Link href={`/berita/${article.id}`} className="hover:underline font-medium">
                {article.title}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}