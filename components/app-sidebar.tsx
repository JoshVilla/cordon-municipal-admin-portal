"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  FileText,
  AlertCircle,
  Megaphone,
  Users,
  UserCog,
  BarChart2,
  Settings,
  Building2,
  Layers,
} from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

const data = {
  user: {
    name: "Admin User",
    email: "admin@sanjose.gov.ph",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Document Requests",
      url: "/dashboard/requests",
      icon: FileText,
    },
      {
      title: "Verification Requests",
      url: "/dashboard/verification-request",
      icon: FileText,
    },
    {
      title: "Form Builder",
      url: "/dashboard/document-forms",
      icon: Layers,
    },
    {
      title: "Complaints",
      url: "/dashboard/complaints",
      icon: AlertCircle,
    },
    {
      title: "Announcements",
      url: "/dashboard/announcement",
      icon: Megaphone,
    },
    {
      title: "Citizens",
      url: "/dashboard/citizens",
      icon: Users,
    },
    {
      title: "Staff",
      url: "/dashboard/staff",
      icon: UserCog,
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: BarChart2,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
}



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>

      {/* Header — municipality branding */}
     <SidebarHeader>
  <SidebarMenu>
    <SidebarMenuItem>
      <div className="flex items-center px-2 py-1.5">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="size-4" />
        </div>
        <div className="flex flex-col gap-0.5 leading-none ml-2 flex-1">
          <span className="font-semibold text-sm">iServe Admin</span>
          <span className="text-xs text-muted-foreground">San Jose Municipality</span>
        </div>
        <ThemeToggle />
      </div>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarHeader>

      {/* Nav items */}
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      {/* Footer — logged in user */}
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}