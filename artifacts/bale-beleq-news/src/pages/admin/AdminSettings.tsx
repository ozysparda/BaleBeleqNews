import { useEffect } from "react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const settingsSchema = z.object({
  siteName: z.string().min(2),
  siteSlogan: z.string().optional().or(z.literal("")),
  siteDescription: z.string().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().optional().or(z.literal("")),
  footerText: z.string().optional().or(z.literal("")),
  socialFacebook: z.string().url().optional().or(z.literal("")),
  socialInstagram: z.string().url().optional().or(z.literal("")),
  socialTwitter: z.string().url().optional().or(z.literal("")),
  socialYoutube: z.string().url().optional().or(z.literal("")),
});

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateMutation = useUpdateSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "BALE BELEQ NEWS",
      siteSlogan: "Informasi • Budaya • Aspirasi",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        siteName: settings.siteName,
        siteSlogan: settings.siteSlogan || "",
        siteDescription: settings.siteDescription || "",
        logoUrl: settings.logoUrl || "",
        primaryColor: settings.primaryColor || "",
        footerText: settings.footerText || "",
        socialFacebook: settings.socialFacebook || "",
        socialInstagram: settings.socialInstagram || "",
        socialTwitter: settings.socialTwitter || "",
        socialYoutube: settings.socialYoutube || "",
      });
    }
  }, [settings, form]);

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    updateMutation.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Pengaturan berhasil disimpan" });
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isLoading) return <div>Memuat pengaturan...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Pengaturan Situs</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Utama</CardTitle>
              <CardDescription>Identitas dasar portal berita Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Situs</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteSlogan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slogan / Tagline</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (Untuk SEO)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="footerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teks Footer</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sosial Media</CardTitle>
              <CardDescription>Tautan ke akun sosial media resmi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="socialFacebook"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Facebook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialTwitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter / X URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialInstagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialYoutube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" size="lg" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </form>
      </Form>
    </div>
  );
}