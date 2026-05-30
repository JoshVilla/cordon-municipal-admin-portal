"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '@/lib/utils'
import { Building2, Upload, Mail, Phone, MapPin, AlertTriangle, Save, Loader2 } from 'lucide-react'

interface PortalSettings {
  id?: string
  municipality_name: string
  logo_url: string | null
  contact_email: string
  contact_number: string
  office_address: string
  maintenance_mode: boolean
}

const defaultSettings: PortalSettings = {
  municipality_name: '',
  logo_url: null,
  contact_email: '',
  contact_number: '',
  office_address: '',
  maintenance_mode: false,
}

export default function GeneralSettingsTab() {
  const [settings, setSettings] = useState<PortalSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings')
      const { data } = await res.json()
      if (data) setSettings(data)
    } catch {
      showToast.error('Failed to load settings.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast.error('Please select an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast.error('Image must be smaller than 2MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const res = await fetch('/api/settings/logo', { method: 'POST', body: formData })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      setField('logo_url', result.url)
      showToast.success('Logo uploaded successfully.')
    } catch (err: any) {
      showToast.error(err.message ?? 'Failed to upload logo.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!settings.municipality_name.trim()) {
      showToast.error('Municipality name is required.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
      showToast.success(result.message)
    } catch (err: any) {
      showToast.error(err.message ?? 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const setField = <K extends keyof PortalSettings>(key: K, value: PortalSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading settings...
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main fields */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-card border border-border rounded-lg p-5 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Building2 size={15} className="text-primary" />
            <h2 className="text-sm font-semibold">Municipality Information</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipality_name">
              Municipality Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="municipality_name"
              placeholder="e.g. Municipality of Meycauayan"
              value={settings.municipality_name}
              onChange={(e) => setField('municipality_name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="flex items-center gap-1.5">
                <Mail size={13} /> Contact Email
              </Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="office@municipality.gov.ph"
                value={settings.contact_email}
                onChange={(e) => setField('contact_email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_number" className="flex items-center gap-1.5">
                <Phone size={13} /> Contact Number
              </Label>
              <Input
                id="contact_number"
                placeholder="+63 XXX-XXX-XXXX"
                value={settings.contact_number}
                onChange={(e) => setField('contact_number', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="office_address" className="flex items-center gap-1.5">
              <MapPin size={13} /> Office Address
            </Label>
            <Textarea
              id="office_address"
              placeholder="Full office address..."
              rows={3}
              value={settings.office_address}
              onChange={(e) => setField('office_address', e.target.value)}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border mb-4">
            <AlertTriangle size={15} className="text-yellow-500" />
            <h2 className="text-sm font-semibold">Maintenance Mode</h2>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Enable Maintenance Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                When enabled, the mobile app will display a maintenance notice to all citizens.
              </p>
            </div>
            <Switch
              checked={settings.maintenance_mode}
              onCheckedChange={(v) => setField('maintenance_mode', v)}
            />
          </div>
          {settings.maintenance_mode && (
            <div className="mt-4 rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-xs text-yellow-700 dark:text-yellow-400">
              Maintenance mode is currently <strong>active</strong>. Citizens cannot access the mobile portal.
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Logo upload */}
      <div className="bg-card border border-border rounded-lg p-5 h-fit">
        <div className="flex items-center gap-2 pb-3 border-b border-border mb-4">
          <Upload size={15} className="text-primary" />
          <h2 className="text-sm font-semibold">Municipality Logo</h2>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-36 h-36 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Municipality Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-muted-foreground px-2">
                <Building2 size={36} className="mx-auto mb-1 opacity-25" />
                <p className="text-xs">No logo</p>
              </div>
            )}
          </div>

          <div className="w-full space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploading ? 'Uploading...' : 'Upload Logo'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">PNG, JPG up to 2MB</p>
            {settings.logo_url && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-destructive hover:text-destructive"
                onClick={() => setField('logo_url', null)}
              >
                Remove logo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
