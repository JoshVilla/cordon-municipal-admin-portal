import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  return (
    <div>
      {/* Topbar */}
      <header className="flex h-16 items-center gap-3 px-6 border-b">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-medium">Dashboard</h1>
      </header>

      {/* Page content */}
      <main className="p-6">
        {/* your content here */}
      </main>
    </div>
  )
}