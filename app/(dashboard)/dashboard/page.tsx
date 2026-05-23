import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function DashboardPage() {
  return (
    <>
      {/* Topbar */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Page content */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* KPI cards row */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Total Requests</p>
            <p className="text-3xl font-bold mt-1">128</p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-3xl font-bold mt-1">34</p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Avg. Processing</p>
            <p className="text-3xl font-bold mt-1">2.4d</p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Active Complaints</p>
            <p className="text-3xl font-bold mt-1">12</p>
          </div>
        </div>

        {/* Placeholder chart area */}
        <div className="rounded-xl border bg-card p-6 min-h-[300px]">
          <p className="text-sm text-muted-foreground">Charts coming soon...</p>
        </div>
      </div>
    </>
  )
}