import { useState } from "react";
import { useListMedia, useUploadMedia, useDeleteMedia, getListMediaQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Plus, Copy, Image as ImageIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

const mediaSchema = z.object({
  filename: z.string().min(2, "Nama file minimal 2 karakter"),
  url: z.string().url("URL tidak valid"),
  type: z.string().default("image/jpeg"),
});

export default function AdminMedia() {
  const { data: media, isLoading } = useListMedia();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();

  const form = useForm<z.infer<typeof mediaSchema>>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      filename: "",
      url: "",
      type: "image/jpeg",
    },
  });

  const onSubmit = (values: z.infer<typeof mediaSchema>) => {
    uploadMutation.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Media berhasil ditambahkan" });
        queryClient.invalidateQueries({ queryKey: getListMediaQueryKey() });
        setIsDialogOpen(false);
        form.reset();
      },
      onError: (err) => toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" })
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Media berhasil dihapus" });
        queryClient.invalidateQueries({ queryKey: getListMediaQueryKey() });
      },
      onError: (err) => toast({ title: "Gagal menghapus", description: err.message, variant: "destructive" })
    });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "URL berhasil disalin" });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Pustaka Media</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Media URL
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Media (via URL)</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Gambar</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="filename"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama File (untuk referensi)</FormLabel>
                    <FormControl>
                      <Input placeholder="gambar-berita-1.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button type="submit" disabled={uploadMutation.isPending}>Simpan</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-md animate-pulse"></div>
          ))}
        </div>
      ) : media?.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground border rounded-xl border-dashed">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Belum ada media. Tambahkan melalui URL.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media?.map((item) => (
            <div key={item.id} className="group relative aspect-square rounded-md overflow-hidden border bg-muted">
              <img 
                src={item.url} 
                alt={item.filename} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Error";
                }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end gap-1">
                  <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(item.url)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-7 w-7">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Media?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Gambar akan dihapus dari pustaka, namun akan tetap tampil di artikel jika URL-nya masih aktif di sumber aslinya.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground">
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="text-white text-[10px] truncate max-w-full">
                  {item.filename}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}