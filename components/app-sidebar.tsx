"use client";

import * as React from "react";
import {
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Users,
  GraduationCap,
  Building,
  School,
  Book,
  Calendar,
  LayoutDashboard,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Kelola User",
      url: "/admin/kelola-users",
      icon: Users,
      isActive: true,
    },
    {
      title: "Kelola Dosen",
      url: "/admin/kelola-dosen",
      icon: GraduationCap,
    },

    {
      title: "Kelola Prodi",
      url: "/admin/kelola-prodi",
      icon: Building,
    },

    {
      title: "Kelola Kelas",
      url: "/admin/kelola-kelas",
      icon: School,
    },
    {
      title: "Kelola Mata Kuliah",
      url: "/admin/kelola-mata-kuliah",
      icon: Book,
    },
    
    
    {
      title: "Kelola Jadwal",
      url: "/admin/kelola-jadwal",
      icon: Calendar,
      items: [
        {
          title: "Jadwal Pagi",
          url: "/admin/kelola-jadwal/jadwal-pagi",
        },
        {
          title: "Jadwal Siang (KJP 1)",
          url: "/admin/kelola-jadwal/jadwal-siang",
        },
        {
          title: "Jadwal Sore (KJP 2)",
          url: "/admin/kelola-jadwal/jadwal-sore",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Teknik Komputer JAYA</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
