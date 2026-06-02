import { useState } from "react";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Edit, Trash2, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  slug: z.string().min(2, "Slug minimal 2 karakter").regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip (-)"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export default function AdminCategories() {
  const { data: categories, isLoading } = useListCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      color: "#1a5c2a",
    },
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    if (!editingId) {
      form.setValue("slug", generateSlug(name));
    }
  };

  const openDialog = (category?: any) => {
    if (category) {
      setEditingId(category.id);
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        color: category.color || "#1a5c2a",
      });
    } else {
      setEditingId(null);
      form.reset({
        name: "",
        slug: "",
        description: "",
        color: "#1a5c2a",
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof categorySchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values }, {
        onSuccess: () => {
          toast({ title: "Kategori berhasil diperbarui" });
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setIsDialogOpen(false);
        },
        onError: (err) => toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" })
      });
    } else {
      createMutation.mutate({ data: values }, {
        onSuccess: () => {
          toast({ title: "Kategori berhasil dibuat" });
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setIsDialogOpen(false);
        },
        onError: (err) => toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" })
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Kategori berhasil dihapus" });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      },
      onError: (err) => toast({ title: "Gagal menghapus", description: err.message, variant: "destructive" })
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Kategori</h1>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Kategori
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kategori</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Nasional" {...field} onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e);
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="nasional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warna Badge (Hex)</FormLabel>
                    <FormControl>
                      <div className="flex gap-3">
                        <Input type="color" className="w-16 h-10 p-1" {...field} />
                        <Input placeholder="#1a5c2a" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Warna</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Memuat data...</TableCell></TableRow>
            ) : categories?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Belum ada kategori</TableCell></TableRow>
            ) : (
              categories?.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: cat.color || "#ccc" }} />
                      <span className="text-xs uppercase">{cat.color}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(cat)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada berita yang menggunakan kategori ini.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-destructive text-destructive-foreground">
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
    </div>
  );
}