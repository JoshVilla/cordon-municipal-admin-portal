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
import { UserCheck, UserX, UserMinus } from 'lucide-react'
import { showToast } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useSelector } from 'react-redux'
import { checkPermission } from '@/lib/helpers'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface StaffUser {
  id: number
  name: string
  role: string
  status: string
  suspend_duration?: number | null
}

interface EditStatusModalProps {
  open: boolean
  onClose: () => void
  staff: StaffUser | null
  onSave?: (staffId: number, status: string, suspendDays: string | null) => Promise<void>
}

const STATUS_OPTIONS = [
  {
    value: 'active',
    label: 'Active',
    description: 'Staff can log in and use the system normally.',
    icon: UserCheck,
    className: 'border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900',
    selectedClassName: 'border-green-500 bg-green-100 dark:bg-green-900/40 ring-2 ring-green-300 dark:ring-green-700',
    iconClassName: 'text-green-600 dark:text-green-400',
  },
  {
    value: 'inactive',
    label: 'Inactive',
    description: 'Account is disabled. Staff cannot log in.',
    icon: UserX,
    className: 'border-border bg-muted',
    selectedClassName: 'border-foreground/40 bg-muted/80 ring-2 ring-foreground/20',
    iconClassName: 'text-muted-foreground',
  },
  {
    value: 'suspended',
    label: 'Suspended',
    description: 'Temporarily blocked due to policy violation.',
    icon: UserMinus,
    className: 'border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900',
    selectedClassName: 'border-red-500 bg-red-100 dark:bg-red-900/40 ring-2 ring-red-300 dark:ring-red-700',
    iconClassName: 'text-red-600 dark:text-red-400',
  },
]

export function EditStatusModal({ open, onClose, staff, onSave }: EditStatusModalProps) {
  const userData = useSelector((state: any) => state.auth.user)
  const [status, setStatus] = useState('active')
  const [loading, setLoading] = useState(false)
  const [suspendDays, setSuspendDays] = useState<string>('')


  useEffect(() => {
    if (staff) {
      setStatus(staff.status ?? 'active')
      setSuspendDays(staff.suspend_duration?.toString() ?? '')
    }
  }, [staff])

  const handleSave = async () => {
    if (!staff) return
    setLoading(true)
    try {
      await onSave?.(staff.id, status, status === 'suspended' ? suspendDays : null)
      showToast.success('Account status updated successfully!')
      onClose()
    } catch {
      showToast.error('Failed to update account status.')
    } finally {
      setLoading(false)
    }
  }

  const roleLabel = staff?.role?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? ''

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Account Status</DialogTitle>
          {staff && (
            <p className="text-sm text-muted-foreground">
              {staff.name}{' '}
              <span className="text-foreground font-medium">({roleLabel})</span>
            </p>
          )}
        </DialogHeader>

        <div className="space-y-3 py-2">
          {STATUS_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = status === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={cn(
                  'w-full flex items-center gap-4 px-4 py-3 rounded-lg border transition-all text-left',
                  isSelected ? option.selectedClassName : option.className
                )}
              >
                <div className={cn('p-1.5 rounded-md bg-white/60', option.iconClassName)}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
  <p className="text-sm font-semibold text-foreground">{option.label}</p>
  <p className="text-xs text-foreground/60">{option.description}</p>
</div>
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 shrink-0',
                  isSelected ? 'border-current bg-current' : 'border-gray-300 bg-white'
                )} />
              </button>
            )
          })}
        </div>
        {status === 'suspended' && (
          <div className="space-y-1.5 px-1">
            <Label className="text-sm font-semibold">
              Suspension Duration{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="suspendDays"
                type="number"
                min={1}
                placeholder="e.g. 7"
                value={suspendDays}
                onChange={(e) => setSuspendDays(e.target.value)}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave blank for indefinite suspension.
            </p>
          </div>
        )}

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