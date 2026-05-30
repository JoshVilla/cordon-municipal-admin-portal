"use client"

import { use, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import TitlePage from '@/components/titlePage'
import {
  FileText, CreditCard, Calendar, Hash, Save, Loader2,
} from 'lucide-react'
import { showToast } from '@/lib/utils'

interface Submission {
  id: string
  reference_number: string | null
  document_type_id: string
  document_type_name: string
  status: string
  payment_status: string
  total_amount: number
  form_data: Record<string, any>
  uploaded_files: any | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

const STATUS_OPTIONS = ['pending', 'reviewing', 'approved', 'rejected', 'completed']
const PAYMENT_OPTIONS = ['unpaid', 'paid']

const statusColor = (s: string) => {
  switch (s) {
    case 'pending':   return 'bg-yellow-500'
    case 'reviewing': return 'bg-blue-500'
    case 'approved':  return 'bg-green-600'
    case 'completed': return 'bg-green-700'
    case 'rejected':  return 'bg-red-500'
    default:          return 'bg-gray-400'
  }
}

const paymentColor = (s: string) =>
  s === 'paid' ? 'bg-green-600' : 'bg-orange-500'

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const formatKey = (key: string) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium">
        {value ?? <span className="text-muted-foreground italic">—</span>}
      </p>
    </div>
  )
}

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  // editable fields
  const [status, setStatus]               = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [adminNotes, setAdminNotes]       = useState('')
  const [saving, setSaving]               = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/document-submissions/${id}`)
        if (!res.ok) throw new Error('Submission not found.')
        const { data } = await res.json()
        setSubmission(data)
        setStatus(data.status)
        setPaymentStatus(data.payment_status)
        setAdminNotes(data.admin_notes ?? '')
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/document-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, payment_status: paymentStatus, admin_notes: adminNotes }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
      showToast.success(result.message)
      setSubmission(prev => prev ? { ...prev, status, payment_status: paymentStatus, admin_notes: adminNotes } : prev)
    } catch (err: any) {
      showToast.error(err.message ?? 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 mt-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 size={16} className="animate-spin" /> Loading submission...
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="p-4 mt-6 text-destructive">{error ?? 'Submission not found.'}</div>
    )
  }

  const formFields = Object.entries(submission.form_data ?? {})

  return (
    <div className="py-8 px-4 space-y-4">
      <TitlePage
        title={submission.document_type_name}
        description={`Submission ID: ${submission.id}`}
        hasBackButton
      />

      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={`${statusColor(submission.status)} capitalize`}>
          {submission.status}
        </Badge>
        <Badge className={`${paymentColor(submission.payment_status)} capitalize`}>
          {submission.payment_status}
        </Badge>
        {submission.reference_number && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
            <Hash size={11} /> {submission.reference_number}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ── Left + Center (2 cols): form data & meta ──────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Submission info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText size={15} className="text-primary" /> Submission Info
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <Field label="Document Type"  value={submission.document_type_name} />
                <Field label="Reference No."  value={submission.reference_number} />
                <Field
                  label="Amount"
                  value={`₱${submission.total_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                />
                <Field
                  label="Submitted"
                  value={
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-muted-foreground" />
                      {formatDate(submission.created_at)}
                    </span>
                  }
                />
                <Field
                  label="Last Updated"
                  value={
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-muted-foreground" />
                      {formatDate(submission.updated_at)}
                    </span>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Form data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Form Data</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-5">
              {formFields.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No form data submitted.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {formFields.map(([key, value]) => (
                    <Field
                      key={key}
                      label={formatKey(key)}
                      value={
                        typeof value === 'boolean'
                          ? value ? 'Yes' : 'No'
                          : Array.isArray(value)
                          ? value.join(', ')
                          : String(value ?? '')
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded files */}
          {submission.uploaded_files && Object.keys(submission.uploaded_files).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Uploaded Files</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-5">
                <div className="space-y-2">
                  {Object.entries(submission.uploaded_files).map(([key, url]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{formatKey(key)}</span>
                      <a
                        href={String(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 text-xs"
                      >
                        View file
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right column: admin actions ────────────────────── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard size={15} className="text-primary" /> Admin Actions
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-5 space-y-4">

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Request Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_OPTIONS.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this submission..."
                  className="text-sm resize-none"
                  rows={4}
                />
              </div>

              <Button
                className="w-full gap-2"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving...</>
                ) : (
                  <><Save size={14} /> Save Changes</>
                )}
              </Button>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
