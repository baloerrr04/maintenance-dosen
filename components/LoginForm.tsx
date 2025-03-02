"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const loginSchema = z.object({
  username: z.string().min(6, "Username wajib diisi"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include", 
      });

      const result = await res.json();
      console.log("Login Response:", result); 

      if (res.ok) {
        toast.success("Login berhasil!");
        console.log("Navigating to /dashboard...");

        router.push("/admin/dashboard"); 
      } else {
        toast.error(result.message || "Login gagal!");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan!");
    } finally {
      setLoading(false);
    }
};


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Username</Label>
        <Input type="text" {...register("username")} />
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
      </div>
      <div>
        <Label>Password</Label>
        <Input type="password" {...register("password")} />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </Button>
    </form>
  );
}
