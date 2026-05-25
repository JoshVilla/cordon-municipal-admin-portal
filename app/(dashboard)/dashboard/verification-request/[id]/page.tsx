"use client"

import { use, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import TitlePage from "@/components/titlePage"
import ZoomableImage from "@/components/zoomableImage"

interface VerificationRequest {
  id: string
  user_id: string
  name: string
  suffix: string | null
  email: string
  phone_number: string | null
  barangay: string
  id_type: string
  id_number: string
  id_front_path: string
  id_back_path: string | null
  id_front_url?: string
  id_back_url?: string
  status: string
  created_at: string
}

const statusColor = (status: string) => {
  switch (status) {
    case 'pending':     return 'bg-yellow-500'
    case 'verified':    return 'bg-blue-500'
    case 'rejected':    return 'bg-red-500'
    default:            return 'bg-gray-400'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'pending':      return 'Pending'
    case 'verified':     return 'Verified'
    case 'rejected':     return 'Rejected'
    case 'not_verified': return 'Not Verified'
    default:             return status
  }
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-0.5">
    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium">
      {value ?? <span className="text-muted-foreground italic">—</span>}
    </p>
  </div>
)

export default function VerificationRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [request, setRequest] = useState<VerificationRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetch(`/api/verification-request/${id}`)
        if (!res.ok) throw new Error('Request not found')
        const { data } = await res.json()
        setRequest(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRequest()
  }, [id])

  if (loading) {
    return (
      <div className="p-4 mt-6">
        <p className="text-muted-foreground">Loading verification request...</p>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="p-4 mt-6">
        <p className="text-destructive">{error ?? 'Request not found.'}</p>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 space-y-4">
      <TitlePage
        title={request.name}
        description={`Request ID: ${request.id}`}
        hasBackButton
      />

      <div className="flex items-center gap-2">
        <Badge className={statusColor(request.status)}>{statusLabel(request.status)}</Badge>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Field label="Full Name"    value={request.name} />
            <Field label="Suffix"       value={request.suffix} />
            <Field label="Email"        value={request.email} />
            <Field label="Phone Number" value={request.phone_number} />
            <Field label="Barangay"     value={request.barangay} />
            <Field label="Submitted"    value={formatDate(request.created_at)} />
          </div>
        </CardContent>
      </Card>

      {/* ID Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ID Information</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Field label="ID Type"   value={request.id_type} />
            <Field label="ID Number" value={request.id_number} />
          </div>
        </CardContent>
      </Card>

      {/* ID Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ID Images</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Front</p>
              {request.id_front_url ? (
                <ZoomableImage
                  src={request.id_front_url}
                  alt="ID Front"
                  className="border border-border rounded-lg max-h-64 overflow-hidden"
                />
              ) : (
                <p className="text-sm text-muted-foreground italic">No image available</p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Back</p>
              {request.id_back_url ? (
                <ZoomableImage
                  src={request.id_back_url}
                  alt="ID Back"
                  className="border border-border rounded-lg max-h-64 overflow-hidden"
                />
              ) : (
                <p className="text-sm text-muted-foreground italic">Not provided</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
