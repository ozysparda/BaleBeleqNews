import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateSuperAdmin, useGetSetupStatus } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
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

const setupSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function AdminSetup() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  const { data: setupStatus, isLoading } = useGetSetupStatus();
  const setupMutation = useCreateSuperAdmin();

  useEffect(() => {
    if (setupStatus && !setupStatus.setupRequired) {
      setLocation("/admin/login");
    }
  }, [setupStatus, setLocation]);

  const form = useForm<z.infer<typeof setupSchema>>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof setupSchema>) => {
    setError(null);
    setupMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        login(res.user, res.token);
        setLocation("/admin/dashboard");
      },
      onError: (err: any) => {
        setError(err.message || "Gagal melakukan setup. Silakan coba lagi.");
      }
    });
  };

  if (isLoading) return null;
  if (!setupStatus?.setupRequired) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card border shadow-lg rounded-xl overflow-hidden">
        <div className="bg-primary p-6 text-center text-primary-foreground">
          <h1 className="text-2xl font-bold tracking-tight">Setup BBN</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Buat akun Super Admin pertama</p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-6 border border-destructive/20">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Super Admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@balebeleqnews.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-6" disabled={setupMutation.isPending}>
                {setupMutation.isPending ? "Menyimpan..." : "Selesaikan Setup"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}