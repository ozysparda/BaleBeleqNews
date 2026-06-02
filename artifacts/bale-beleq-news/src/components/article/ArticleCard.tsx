import { Link } from "wouter";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Article } from "@workspace/api-client-react/src/generated/api.schemas";

interface ArticleCardProps {
  article: Article;
  layout?: "vertical" | "horizontal";
}

export default function ArticleCard({ article, layout = "vertical" }: ArticleCardProps) {
  const publishedDate = article.publishedAt || article.createdAt;

  if (layout === "horizontal") {
    return (
      <Link href={`/berita/${article.id}`} className="group flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        <div className="w-full sm:w-1/3 aspect-[4/3] sm:aspect-auto sm:h-32 lg:h-40 rounded-lg overflow-hidden shrink-0">
          <img 
            src={article.coverImage || "https://placehold.co/600x400?text=No+Image"} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center h-full">
          <div className="flex items-center gap-2 mb-2">
            {article.category && (
              <span className="text-primary font-bold text-xs uppercase tracking-wider">
                {article.category.name}
              </span>
            )}
            <span className="text-muted-foreground text-xs">• {format(new Date(publishedDate), "d MMM yyyy", { locale: id })}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {article.excerpt || article.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..."}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/berita/${article.id}`} className="group flex flex-col gap-3">
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden">
        <img 
          src={article.coverImage || "https://placehold.co/600x400?text=No+Image"} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          {article.category && (
            <span className="text-accent font-bold text-xs uppercase tracking-wider">
              {article.category.name}
            </span>
          )}
          <span className="text-muted-foreground text-xs">{format(new Date(publishedDate), "d MMM", { locale: id })}</span>
        </div>
        <h3 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}