"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"


export function useAuth() {
    const router = useRouter();
    const [user, setUser] = useState<{ username: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
          try {
            const res = await fetch("/api/auth/me", { credentials: "include" });
    
            if (!res.ok) {
              throw new Error("Unauthorized");
            }
    
            const data = await res.json();
            setUser(data);
          } catch (error) {
            toast.error("Anda belum login!");
            router.push("/login");
          } finally {
            setLoading(false);
          }
        };
    
        checkAuth();
      }, [router]);

      return {user, loading}
}