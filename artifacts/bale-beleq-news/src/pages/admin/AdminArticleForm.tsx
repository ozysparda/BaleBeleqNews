import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  useCreateArticle, 
  useUpdateArticle, 
  useGetArticle, 
  useListCategories,
  getGetArticleQueryKey,
  getListArticlesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { ArticleInputStatus } from "@workspace/api-client-react/src/generated/api.schemas";

const articleSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Konten berita minimal 10 karakter"),
  coverImage: z.string().url("URL tidak valid").optional().or(z.literal("")),
  categoryId: z.coerce.number().optional(),
  isBreaking: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED"]).default("DRAFT"),
});

export default function AdminArticleForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useListCategories();
  const { data: article, isLoading: isLoadingArticle } = useGetArticle(Number(id), { 
    query: { enabled: isEdit, queryKey: getGetArticleQueryKey(Number(id)) } 
  });

  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();

  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      coverImage: "",
      categoryId: undefined,
      isBreaking: false,
      isFeatured: false,
      status: "DRAFT",
    },
  });

  useEffect(() => {
    if (isEdit && article) {
      form.reset({
        title: article.title,
        excerpt: article.excerpt || "",
        content: article.content,
        coverImage: article.coverImage || "",
        categoryId: article.categoryId || undefined,
        isBreaking: article.isBreaking || false,
        isFeatured: article.isFeatured || false,
        status: article.status as any,
      });
    }
  }, [isEdit, article, form]);

  const onSubmit = (values: z.infer<typeof articleSchema>, statusOverride?: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED") => {
    const finalValues = {
      ...values,
      status: (statusOverride || values.status) as ArticleInputStatus,
      coverImage: values.coverImage || null,
      excerpt: values.excerpt || null,
      categoryId: values.categoryId || null
    };

    if (isEdit) {
      updateMutation.mutate({ id: Number(id), data: finalValues }, {
        onSuccess: () => {
          toast({ title: "Berita berhasil diperbarui" });
          queryClient.invalidateQueries({ queryKey: getGetArticleQueryKey(Number(id)) });
          queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
          setLocation("/admin/berita");
        },
        onError: (err) => {
          toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" });
        }
      });
    } else {
      createMutation.mutate({ data: finalValues }, {
        onSuccess: () => {
          toast({ title: "Berita berhasil dibuat" });
          queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
          setLocation("/admin/berita");
        },
        onError: (err) => {
          toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" });
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingArticle) return <div>Memuat...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/berita")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{isEdit ? "Edit Berita" : "Tulis Berita"}</h1>
      </div>

      <Form {...form}>
        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Berita</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan judul berita..." {...field} className="text-lg font-medium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Isi Berita</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tulis konten berita di sini..." 
                        className="min-h-[400px] resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kutipan Singkat (Excerpt)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ringkasan berita..." 
                        className="resize-none" 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold border-b pb-2 mb-4">Pengaturan</h3>
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select 
                        value={field.value ? field.value.toString() : ""} 
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Gambar Utama</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      {field.value && (
                        <div className="mt-2 rounded overflow-hidden aspect-video border">
                          <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isBreaking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Breaking News</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Featured (Hero)</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  disabled={isPending}
                  onClick={form.handleSubmit((v) => onSubmit(v, "DRAFT"))}
                >
                  Simpan Draft
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="w-full"
                  disabled={isPending}
                  onClick={form.handleSubmit((v) => onSubmit(v, "PENDING_REVIEW"))}
                >
                  Kirim untuk Review
                </Button>
                <Button 
                  type="button" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isPending}
                  onClick={form.handleSubmit((v) => onSubmit(v, "PUBLISHED"))}
                >
                  {isEdit ? "Update & Terbitkan" : "Terbitkan Berita"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}