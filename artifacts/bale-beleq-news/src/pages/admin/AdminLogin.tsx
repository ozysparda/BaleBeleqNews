import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLogin, useGetSetupStatus } from "@workspace/api-client-react";
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
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
  rememberMe: z.boolean().default(false).optional(),
});

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  const { data: setupStatus } = useGetSetupStatus();
  const loginMutation = useLogin();

  useEffect(() => {
    if (setupStatus?.setupRequired) {
      setLocation("/admin/setup");
    }
  }, [setupStatus, setLocation]);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setError(null);
    loginMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        login(res.user, res.token);
        setLocation("/admin/dashboard");
      },
      onError: (err: any) => {
        setError(err.message || "Gagal login. Periksa email dan password Anda.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card border shadow-lg rounded-xl overflow-hidden">
        <div className="bg-sidebar p-6 text-center text-sidebar-foreground">
          <img src="/logo.png" alt="Logo" className="w-16 h-auto mx-auto mb-4 brightness-0 invert" />
          <h1 className="text-2xl font-bold tracking-tight">BBN ADMIN</h1>
          <p className="text-sidebar-foreground/70 text-sm mt-1">Masuk untuk mengelola BALE BELEQ NEWS</p>
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
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-1">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal text-sm cursor-pointer">
                        Ingat saya
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-6" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}