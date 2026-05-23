'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  AlertTriangle,
  Users,
  Megaphone,
  BarChart2,
  Shield,
  Settings,
} from 'lucide-react'
import { PERMISSION_LABELS, ROLE_PERMISSIONS } from '@/lib/constants/departments'
import { showToast } from '@/lib/utils'
import { useSelector } from 'react-redux'
import { checkPermission } from '@/lib/helpers'

interface StaffUser {
  id: string
  name: string
  role: string
  permissions: string[]
}

interface EditPermissionsModalProps {
  open: boolean
  onClose: () => void
  staff: StaffUser | null
  onSave?: (staffId: string, permissions: string[]) => Promise<void>
}

const PERMISSION_META: Record<string, {
  icon: React.ElementType
  description: string
}> = {
  ACD: { icon: Users,       description: 'Access and search citizen records' },
  ADR: { icon: FileText,    description: 'Manage, approve, and reject document requests' },
  MC:  { icon: AlertTriangle, description: 'Review and resolve complaints & incidents' },
  PA:  { icon: Megaphone,   description: 'Create and schedule municipal announcements' },
  MSA: { icon: Shield,      description: 'Manage staff profiles and roles' },
  MSS: { icon: Settings,    description: 'Configure system-wide settings' },
  VRA: { icon: BarChart2,   description: 'View analytics and generate reports' },
}

const BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  ACD: { label: 'FULL ACCESS',  className: 'bg-green-100  dark:bg-green-950  text-green-700  dark:text-green-400  border-green-200  dark:border-green-800' },
  ADR: { label: 'FULL ACCESS',  className: 'bg-green-100  dark:bg-green-950  text-green-700  dark:text-green-400  border-green-200  dark:border-green-800' },
  MC:  { label: 'VIEW ONLY',    className: 'bg-blue-100   dark:bg-blue-950   text-blue-700   dark:text-blue-400   border-blue-200   dark:border-blue-800' },
  PA:  { label: 'EDITOR',       className: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  MSA: { label: 'ADMIN ACCESS', className: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  MSS: { label: 'ADMIN ACCESS', className: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  VRA: { label: 'VIEW ONLY',    className: 'bg-blue-100   dark:bg-blue-950   text-blue-700   dark:text-blue-400   border-blue-200   dark:border-blue-800' },
}
export function EditPermissionsModal({ open, onClose, staff, onSave }: EditPermissionsModalProps) {

  const userData = useSelector((state: any) => state.auth.user)

  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (staff) setPermissions(staff.permissions ?? [])
  }, [staff])

  const togglePermission = (code: string) => {
    setPermissions((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    )
  }

  const handleSave = async () => {
    if (!staff) return
    setLoading(true)
    try {
      if(checkPermission(userData.permissions, "MSA")) {
        await onSave?.(staff.id, permissions)
        showToast.success('Permissions updated successfully!')
        onClose()
      }
    } catch {
      showToast.error('Failed to update permissions.')
    } finally {
      setLoading(false)
    }
  }

  const allCodes = Object.keys(PERMISSION_META)
  const roleLabel = staff?.role?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? ''

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Permissions</DialogTitle>
          {staff && (
            <p className="text-sm text-muted-foreground">
              {staff.name}{' '}
              <span className="text-foreground font-medium">({roleLabel})</span>
            </p>
          )}
        </DialogHeader>

        <div className="space-y-2 py-2">
          {allCodes.map((code) => {
            const meta = PERMISSION_META[code]
            const badge = BADGE_CONFIG[code]
            const Icon = meta.icon
            const enabled = permissions.includes(code)

            return (
             <div
  key={code}
  className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg border transition-colors ${
    enabled ? 'bg-card border-border' : 'bg-muted border-border/50'
  }`}
>
  <div className="flex items-center gap-3">
    <div className={`p-1.5 rounded-md ${enabled ? 'bg-muted' : 'bg-muted/70'}`}>
      <Icon size={16} className={enabled ? 'text-foreground' : 'text-muted-foreground'} />
    </div>
    <div>
      <p className={`text-sm font-medium ${!enabled && 'text-muted-foreground'}`}>
        {PERMISSION_LABELS[code]}
      </p>
      <p className="text-xs text-muted-foreground">{meta.description}</p>
    </div>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    {enabled && (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}>
        {badge.label}
      </span>
    )}
    {!enabled && (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-destructive/10 text-destructive border-destructive/20">
        RESTRICTED
      </span>
    )}
    <Switch
      checked={enabled}
      onCheckedChange={() => togglePermission(code)}
    />
  </div>
</div>
            )
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}