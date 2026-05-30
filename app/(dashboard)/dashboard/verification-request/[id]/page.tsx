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

interface MatchScores {
  name: number
  barangay: number
  email: number
  phone: number
  overall: number
}

interface CitizenMatch {
  citizen_id: string
  citizen_name: string
  barangay: string
  email: string | null
  contact_number: string | null
  scores: MatchScores
}

const statusColor = (status: string) => {
  switch (status) {
    case 'pending':   return 'bg-yellow-500'
    case 'approved':  return 'bg-blue-500'
    case 'rejected':  return 'bg-red-500'
    default:          return 'bg-gray-400'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'pending':  return 'Pending'
    case 'approved': return 'Approved'
    case 'rejected': return 'Rejected'
    default:         return status
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

function confidenceLevel(score: number): { label: string; color: string; bar: string } {
  if (score >= 75) return { label: 'High', color: 'text-green-600', bar: 'bg-green-500' }
  if (score >= 45) return { label: 'Moderate', color: 'text-yellow-600', bar: 'bg-yellow-500' }
  return { label: 'Low', color: 'text-red-500', bar: 'bg-red-500' }
}

function ScoreBar({ score, barColor }: { score: number; barColor: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs tabular-nums w-8 text-right">{score}%</span>
    </div>
  )
}

function FieldMatchRow({
  label,
  requestValue,
  citizenValue,
  score,
}: {
  label: string
  requestValue: string | null
  citizenValue: string | null
  score: number
}) {
  const hasData = !!requestValue && !!citizenValue
  const barColor = score === 100 ? 'bg-green-500' : score > 0 ? 'bg-yellow-500' : 'bg-red-400'

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{label}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">Submitted</p>
          <p className="font-medium truncate">{requestValue ?? <span className="italic text-muted-foreground">—</span>}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">Resident Record</p>
          <p className="font-medium truncate">{citizenValue ?? <span className="italic text-muted-foreground">—</span>}</p>
        </div>
      </div>
      {!hasData ? (
        <span className="text-xs text-muted-foreground">No data to compare</span>
      ) : (
        <ScoreBar score={score} barColor={barColor} />
      )}
    </div>
  )
}

function MatchAnalysisCard({ requestId, request }: { requestId: string; request: VerificationRequest }) {
  const [matches, setMatches] = useState<CitizenMatch[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/verification-request/${requestId}/match`)
      .then(r => r.json())
      .then(d => setMatches(d.matches ?? []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false))
  }, [requestId])

  const best = matches?.[0]
  const conf = best ? confidenceLevel(best.scores.overall) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Resident Match Analysis</CardTitle>
        <p className="text-xs text-muted-foreground">
          Compares submitted info against the resident database to estimate verification confidence.
        </p>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6 space-y-5">
        {loading && (
          <p className="text-sm text-muted-foreground">Analyzing matches...</p>
        )}

        {!loading && (!best || best.scores.overall === 0) && (
          <p className="text-sm text-muted-foreground italic">No matching resident found in the database.</p>
        )}

        {!loading && best && best.scores.overall > 0 && (
          <>
            {/* Overall score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Best Match: {best.citizen_name}</p>
                  <p className="text-xs text-muted-foreground">{best.barangay}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold tabular-nums ${conf!.color}`}>
                    {best.scores.overall}%
                  </p>
                  <p className={`text-xs font-medium ${conf!.color}`}>{conf!.label} Confidence</p>
                </div>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${conf!.bar}`}
                  style={{ width: `${best.scores.overall}%` }}
                />
              </div>
            </div>

            {/* Field-by-field breakdown */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Field Breakdown
              </p>
              <div className="grid grid-cols-2 gap-3">
                <FieldMatchRow
                  label="Name"
                  requestValue={request.name}
                  citizenValue={best.citizen_name}
                  score={best.scores.name}
                />
                <FieldMatchRow
                  label="Barangay"
                  requestValue={request.barangay}
                  citizenValue={best.barangay}
                  score={best.scores.barangay}
                />
                <FieldMatchRow
                  label="Email"
                  requestValue={request.email}
                  citizenValue={best.email}
                  score={best.scores.email}
                />
                <FieldMatchRow
                  label="Phone"
                  requestValue={request.phone_number}
                  citizenValue={best.contact_number}
                  score={best.scores.phone}
                />
              </div>
            </div>

            {/* Other potential matches */}
            {matches!.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Other Potential Matches
                </p>
                <div className="space-y-2">
                  {matches!.slice(1).map(m => {
                    const c = confidenceLevel(m.scores.overall)
                    return (
                      <div key={m.citizen_id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{m.citizen_name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">{m.barangay}</span>
                        </div>
                        <span className={`text-xs font-semibold tabular-nums ${c.color}`}>
                          {m.scores.overall}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left column */}
        <div className="space-y-4">

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Field label="Full Name"    value={request.name} />
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

        </div>{/* end left column */}

        {/* Right column — Match Analysis */}
        <MatchAnalysisCard requestId={id} request={request} />

      </div>{/* end 2-col grid */}
    </div>
  )
}
