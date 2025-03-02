"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";

export default function SidebarWrapper() {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) return null; // Jangan tampilkan sidebar di halaman login

  return <AppSidebar />;
}
