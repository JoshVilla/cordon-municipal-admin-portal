'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { showToast } from "@/lib/utils"
import { clearUser } from "@/store/slices/AuthSlice"
import { persistor } from "@/store/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getSuspensionEndDate } from "@/lib/helpers"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const userData = useSelector((state: any) => state.auth.user)

useEffect(() => {
  if (!userData) return

  const ping = async () => {
    try {
      if (!userData?.id) return  // ← guard inside ping too

      const res = await fetch(`/api/health?id=${userData.id}`)
      const data = await res.json()

      if (data.account?.status === 'suspended' || data.account?.status === 'inactive') {
        clearInterval(interval)  // ← stop interval before logout
        dispatch(clearUser())
        await persistor.purge()
        showToast.error(`Your account has been ${data.account.status} ${data.account.suspend_duration ? `until ${getSuspensionEndDate(data.account.suspend_duration)}` : ''}.`)
        router.push('/login')
      }
    } catch (error) {
      console.error('Heartbeat failed:', error)
    }
  }

  ping()
  const interval = setInterval(ping, 30 * 1000)
  return () => clearInterval(interval)
}, [userData])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}