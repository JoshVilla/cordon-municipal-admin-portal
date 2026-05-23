'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TitlePage from '@/components/titlePage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShieldCheck, Info, Eye, EyeOff } from 'lucide-react'
import { DEPARTMENTS, ROLES, ROLE_PERMISSIONS, PERMISSION_LABELS } from '@/lib/constants/departments'
import { showToast } from '@/lib/utils'

export default function AddStaffPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    employee_id: '',
    department: '',
    role: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // All unique permission codes across all roles
  const allPermissionCodes = Array.from(new Set(Object.values(ROLE_PERMISSIONS).flat()))
  // Codes granted to the selected role
  const selectedPermissions = form.role ? ROLE_PERMISSIONS[form.role] ?? [] : []

  const handleAddStaff = async () => {
    setLoading(true)
    try {
      const permissions = ROLE_PERMISSIONS[form.role] ?? []
      console.log('Role:', form.role)
      console.log('Permissions granted:', permissions)

      const res = await fetch('/api/staff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, permissions }),
      })

      const result = await res.json()
      console.log('API response:', result)

      if (!res.ok) {
        showToast.error(result.error)
        return
      }

      showToast.success('Staff account created successfully!')
      router.push('/dashboard/staff')
    } catch (error) {
      showToast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 mt-6">
      <TitlePage
        title="Add New Staff Account"
        description="Create a new account for municipal employees. Roles and permissions are assigned based on department and operational hierarchy."
        hasBackButton
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Personal &amp; Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Ricardo Dalisay"
                  value={form.name}
                  onChange={(e) => handleField('name', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., r.dalisay@sanjose.gov.ph"
                  value={form.email}
                  onChange={(e) => handleField('email', e.target.value)}
                />
              </div>
            </div>

            {/* Employee ID */}
            <div className="space-y-1.5">
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                placeholder="e.g., SJ-2023-0045"
                value={form.employee_id}
                onChange={(e) => handleField('employee_id', e.target.value)}
              />
            </div>

            {/* Department & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select onValueChange={(val) => handleField('department', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select onValueChange={(val) => handleField('role', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Initial Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => handleField('password', e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleAddStaff} disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Security Guidelines */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck size={16} className="text-primary" />
                Security Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                'Official municipal emails must follow the @sanjose.gov.ph domain.',
                'Employee IDs are verified against the HRMS database before activation.',
                'Multi-factor authentication (MFA) will be required upon first login.',
              ].map((guideline) => (
                <div key={guideline} className="flex items-start gap-2">
                  <Info size={14} className="mt-0.5 shrink-0 text-blue-500" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{guideline}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Role Permissions Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Role Permissions Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {!form.role ? (
                <p className="text-xs text-muted-foreground italic">
                  Select a role to see granted permissions.
                </p>
              ) : null}
              {allPermissionCodes.map((code) => {
                const granted = selectedPermissions.includes(code)
                return (
                  <div key={code} className="flex items-center gap-2">
                    <Checkbox checked={granted} disabled />
                    <span className={`text-sm ${granted ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {PERMISSION_LABELS[code]}
                      <span className="ml-1.5 text-xs text-muted-foreground/60 font-mono">{code}</span>
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}