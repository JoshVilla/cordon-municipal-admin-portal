"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog'
import { ProfileAvatar } from '@/components/profileAvatar'
import {
  Camera, Save, KeyRound, Shield, Users, BarChart2,
  Settings, FileText, Database, Megaphone, CheckCircle2,
  Eye, EyeOff, X, Check
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DEPARTMENTS, PERMISSION_LABELS, PERMISSION_META as PERM_META } from '@/lib/constants/departments'
import { format } from 'date-fns'
import { setUser } from '@/store/slices/AuthSlice'
import { validatePassword, isPasswordValid } from '@/lib/helpers'

const ICON_MAP: Record<string, React.ElementType> = {
  Database, CheckCircle2, FileText, Megaphone, Users, Settings, BarChart2,
}

function getDeptLabel(value: string) {
  return DEPARTMENTS.find((d) => d.value === value)?.label ?? value
}

const STATUS_DOT: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-red-500",
  suspended: "bg-yellow-500",
}

export default function ProfilePage() {
  const dispatch = useDispatch()
  const userData = useSelector((state: any) => state.auth.user)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Profile form ──
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    profile_picture: "",
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // ── Change password dialog ──
  const [pwDialog, setPwDialog] = useState(false)
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" })
  const [pwShow, setPwShow] = useState({ current: false, newPw: false, confirm: false })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)

  const pwRules = validatePassword(pwForm.newPw)
  const allRulesPassed = isPasswordValid(pwForm.newPw)

  useEffect(() => {
    if (userData) {
      setForm({
        name: userData.name ?? "",
        email: userData.email ?? "",
        department: userData.department ?? "",
        profile_picture: userData.profile_picture ?? "",
      })
      setPreviewUrl(userData.profile_picture ?? null)
    }
  }, [userData])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)
    try {
      const supabase = createClient()
      let avatarUrl = form.profile_picture

      if (imageFile) {
        if (userData.profile_picture) {
          const oldPath = userData.profile_picture.split('/staff_avatars/')[1]
          if (oldPath) await supabase.storage.from('staff_avatars').remove([oldPath])
        }
        const ext = imageFile.name.split('.').pop()
        const fileName = `avatars/${userData.id}_${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('staff_avatars').upload(fileName, imageFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('staff_avatars').getPublicUrl(fileName)
        avatarUrl = urlData.publicUrl
      }

      const { data: updatedData, error: updateError } = await supabase
        .from('staffs')
        .update({ name: form.name, email: form.email, department: form.department, profile_picture: avatarUrl })
        .eq('id', userData.id)
        .select().single()

      if (updateError) throw updateError
      dispatch(setUser(updatedData))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message ?? "Failed to save changes.")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setPwError("")

    if (!pwForm.current) return setPwError("Please enter your current password.")
    if (!allRulesPassed) return setPwError("New password does not meet all requirements.")
    if (pwForm.newPw !== pwForm.confirm) return setPwError("Passwords do not match.")
    if (pwForm.current === pwForm.newPw) return setPwError("New password must be different from current password.")

    setPwLoading(true)
    try {
      const supabase = createClient()

      // Step 1 — verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: pwForm.current,
      })

      if (signInError) {
        setPwError("Current password is incorrect.")
        setPwLoading(false)
        return
      }

      // Step 2 — update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: pwForm.newPw,
      })

      if (updateError) throw updateError

      setPwSuccess(true)
      setPwForm({ current: "", newPw: "", confirm: "" })
      setTimeout(() => {
        setPwSuccess(false)
        setPwDialog(false)
      }, 2000)

    } catch (err: any) {
      setPwError(err.message ?? "Failed to update password.")
    } finally {
      setPwLoading(false)
    }
  }

  const handleClosePwDialog = () => {
    setPwDialog(false)
    setPwForm({ current: "", newPw: "", confirm: "" })
    setPwError("")
    setPwSuccess(false)
  }

  const permissions: string[] = userData?.permissions ?? []
  const joinDate = userData?.created_at
    ? format(new Date(userData.created_at), 'MMM d, yyyy')
    : '—'

  return (
    <div className="p-6 max-w-5xl space-y-5">

      {/* ── Header card ── */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-5">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <ProfileAvatar name={form.name} imageUrl={previewUrl} size="xl" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer border-2 border-card shadow"
            >
              <Camera size={13} className="text-primary-foreground" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{form.name || "—"}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${userData?.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[userData?.status] ?? 'bg-gray-400'}`} />
                {userData?.status ? userData.status.charAt(0).toUpperCase() + userData.status.slice(1) : '—'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {userData?.role?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? '—'}
              {userData?.department && ` • ${getDeptLabel(userData.department)}`}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              {loading
                ? <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Save size={14} />
              }
              {loading ? 'Saving...' : 'Update Profile'}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setPwDialog(true)}>
              <KeyRound size={14} />
              Change Password
            </Button>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">{error}</p>
        )}
        {success && (
          <p className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">Profile updated successfully.</p>
        )}
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Left — Personal Information */}
        <div className="col-span-1 bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-primary" />
            <h2 className="text-sm font-semibold">Personal Information</h2>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Full Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Enter your full name"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Email Address</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Enter your email"
                className="h-9 text-sm pl-8"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Department</Label>
            <Select value={form.department} onValueChange={(val) => setForm((p) => ({ ...p, department: val }))}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right — Administrative + Permissions */}
        <div className="col-span-2 space-y-5">

          {/* Administrative Details */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={15} className="text-primary" />
              <h2 className="text-sm font-semibold">Administrative Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Employee ID</p>
                <p className="text-lg font-bold text-foreground font-mono">{userData?.employee_id ?? '—'}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Read-only system field
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Join Date</p>
                <p className="text-lg font-bold text-foreground">{joinDate}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {userData?.created_at
                    ? `Tenure: ${Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))} months`
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {/* System Permissions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} className="text-primary" />
              <h2 className="text-sm font-semibold">System Permissions</h2>
            </div>
            {permissions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No permissions assigned.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {permissions.map((perm: string) => {
                  const meta = PERM_META[perm]
                  const Icon = meta ? (ICON_MAP[meta.icon] ?? CheckCircle2) : CheckCircle2
                  return (
                    <div key={perm} className="border border-border rounded-lg p-3 space-y-2 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon size={15} className="text-primary" />
                        </div>
                        <span className="w-2 h-2 rounded-full bg-green-500 mt-1" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-tight">
                          {PERMISSION_LABELS[perm] ?? perm}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          {meta?.desc ?? "Permission granted."}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Change Password Dialog ── */}
      <Dialog open={pwDialog} onOpenChange={handleClosePwDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound size={16} className="text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new secure password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* Current password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Current Password</Label>
              <div className="relative">
                <Input
                  type={pwShow.current ? "text" : "password"}
                  value={pwForm.current}
                  onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                  placeholder="Enter current password"
                  className="h-9 text-sm pr-9"
                />
                <button
                  type="button"
                  onClick={() => setPwShow((p) => ({ ...p, current: !p.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {pwShow.current ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">New Password</Label>
              <div className="relative">
                <Input
                  type={pwShow.newPw ? "text" : "password"}
                  value={pwForm.newPw}
                  onChange={(e) => setPwForm((p) => ({ ...p, newPw: e.target.value }))}
                  placeholder="Enter new password"
                  className="h-9 text-sm pr-9"
                />
                <button
                  type="button"
                  onClick={() => setPwShow((p) => ({ ...p, newPw: !p.newPw }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {pwShow.newPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Rules checklist — only show when typing */}
              {pwForm.newPw.length > 0 && (
                <div className="mt-2 space-y-1.5 p-3 rounded-lg bg-muted border border-border">
                  {pwRules.map((rule) => (
                    <div key={rule.key} className="flex items-center gap-2">
                      {rule.passed
                        ? <Check size={12} className="text-green-500 flex-shrink-0" />
                        : <X size={12} className="text-muted-foreground flex-shrink-0" />
                      }
                      <span className={`text-[11px] ${rule.passed ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={pwShow.confirm ? "text" : "password"}
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                  placeholder="Confirm new password"
                  className={`h-9 text-sm pr-9 ${pwForm.confirm && pwForm.newPw !== pwForm.confirm ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setPwShow((p) => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {pwShow.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                <p className="text-[11px] text-destructive">Passwords do not match.</p>
              )}
            </div>

            {/* Error / Success */}
            {pwError && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
                {pwError}
              </p>
            )}
            {pwSuccess && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg flex items-center gap-2">
                <CheckCircle2 size={13} /> Password updated successfully!
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClosePwDialog} size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={pwLoading || !allRulesPassed || pwForm.newPw !== pwForm.confirm || !pwForm.current}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              {pwLoading
                ? <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <KeyRound size={13} />
              }
              {pwLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}