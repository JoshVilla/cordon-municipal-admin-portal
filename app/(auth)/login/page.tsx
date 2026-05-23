"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight, BadgeCheck, Shield, Info, IdCard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { showToast } from "@/lib/utils"
import { useDispatch } from "react-redux"
import { setUser } from "@/store/slices/AuthSlice"
import { getSuspensionEndDate } from "@/lib/helpers"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [employeeId, setEmployeeId] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { data: staff, error: staffError } = await supabase
        .from("staffs")
        .select("*")
        .eq("employee_id", employeeId)
        .single()

      if (staffError || !staff) {
        showToast.error("Invalid Employee ID or password.")
        setLoading(false)
        return
      }

      if (staff.status === "inactive") {
        showToast.error("Your account has been deactivated. Contact the administrator.")
        setLoading(false)
        return
      }

      if (staff.status === "suspended" && staff.suspend_duration) {
        showToast.error("Your account has been suspended until " + getSuspensionEndDate(staff.suspend_duration))
        setLoading(false)
        return
      }

      if (staff.status === "suspended" && !staff.suspend_duration) {
        showToast.error("Your account has been suspended indefinitely.")
        setLoading(false)
        return
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: staff.email,
        password,
      })

      if (authError || !data.user) {
        showToast.error("Invalid Employee ID or password.")
        setLoading(false)
        return
      }

      const storage = remember ? localStorage : sessionStorage
      storage.setItem("staffs_session", JSON.stringify({
        id: staff.id,
        logged_in_at: new Date().toISOString(),
      }))

      showToast.success("Login Successful")
      dispatch(setUser(staff))
      router.push("/dashboard")

    } catch (err) {
      showToast.error("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col">

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-card border border-border rounded-2xl shadow-md w-full max-w-[440px] px-10 py-10">

          {/* Logo + title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-accent border-2 border-border">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary">
                <IdCard size={22} className="text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              OneCordon Admin
            </h1>
            <p className="text-sm mt-1 text-muted-foreground">
              Cordon Municipal Portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                Employee ID
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <IdCard size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Enter your ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all bg-background text-foreground border border-input focus:border-ring"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Shield size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none transition-all bg-background text-foreground border border-input focus:border-ring"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember device */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-primary"
              />
              <label htmlFor="remember" className="text-sm cursor-pointer select-none text-muted-foreground">
                Remember device for 30 days
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all mt-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Login to Portal
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Notice */}
          <div className="flex gap-3 mt-6 p-3.5 rounded-lg bg-accent border border-border">
            <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-accent-foreground">
              Authorized personnel only. All access and activities are logged
              for security purposes in compliance with Municipal Regulation 104‑B.
            </p>
          </div>

          {/* Help link */}
          <p className="text-center text-xs mt-5 text-muted-foreground">
            Having trouble logging in?{" "}
            <a
              href="mailto:itsupport@sanjose.gov.ph"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Contact System Administrator
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-6 py-4 flex items-center justify-between text-xs border-t border-border bg-card text-muted-foreground">
        {/* Left */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary">
            <IdCard size={12} className="text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-wide uppercase text-[10px] text-muted-foreground">
            Official Municipal Service Portal
          </span>
        </div>

        {/* Center */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border border-border text-muted-foreground">
            <Shield size={11} />
            Secure AES-256
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border border-border text-muted-foreground">
            <BadgeCheck size={11} />
            GovCloud Verified
          </div>
        </div>

        {/* Right */}
        <span>© 2024 Cordon Municipality</span>
      </footer>
    </div>
  )
}