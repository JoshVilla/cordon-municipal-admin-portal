"use client"

import { use, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import TitlePage from "@/components/titlePage"
import { CheckCircle2, XCircle } from "lucide-react"

interface Citizen {
  id: string
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  date_of_birth: string
  sex: string
  civil_status: string | null
  contact_number: string | null
  email: string | null
  barangay: string
  full_address: string | null
  is_senior_citizen: boolean
  is_pwd: boolean
  is_4ps_beneficiary: boolean
  voter_status: string
  status: string
  verification_status: string
}

const statusColor = (status: string) => {
  switch (status) {
    case "Active": return "bg-green-500"
    case "Deceased": return "bg-red-500"
    default: return "bg-gray-500"
  }
}

const getFullName = (c: Citizen) => {
  const middle = c.middle_name ? `${c.middle_name.charAt(0)}.` : ""
  const suffix = c.suffix && c.suffix !== "none" ? c.suffix : ""
  return [c.first_name, middle, c.last_name, suffix].filter(Boolean).join(" ")
}

const getAge = (dob: string) => {
  const birth = new Date(dob)
  const today = new Date()
  let years = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--
  if (years < 1) {
    let months = today.getMonth() - birth.getMonth() + (today.getFullYear() - birth.getFullYear()) * 12
    if (today.getDate() < birth.getDate()) months--
    return `${months} month${months !== 1 ? "s" : ""} old`
  }
  return `${years} year${years !== 1 ? "s" : ""} old`
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })

const BooleanBadge = ({ value }: { value: boolean }) =>
  value
    ? <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle2 className="w-4 h-4" /> Yes</span>
    : <span className="flex items-center gap-1 text-muted-foreground"><XCircle className="w-4 h-4" /> No</span>

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-0.5">
    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium">{value ?? <span className="text-muted-foreground italic">—</span>}</p>
  </div>
)

export default function CitizenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [citizen, setCitizen] = useState<Citizen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCitizen = async () => {
      try {
        const res = await fetch(`/api/citizen/${id}`)
        if (!res.ok) throw new Error("Citizen not found")
        const { data } = await res.json()
        setCitizen(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCitizen()
  }, [id])

  if (loading) {
    return (
      <div className="p-4 mt-6">
        <p className="text-muted-foreground">Loading citizen details...</p>
      </div>
    )
  }

  if (error || !citizen) {
    return (
      <div className="p-4 mt-6">
        <p className="text-destructive">{error ?? "Citizen not found."}</p>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 space-y-4">
      <TitlePage
        title={getFullName(citizen)}
        description={`Citizen ID: ${citizen.id}`}
        hasBackButton
      />

      <div className="flex items-center gap-2">
        <Badge className={statusColor(citizen.status)}>{citizen.status}</Badge>
        <Badge className={citizen.verification_status === 'verified' ? 'bg-blue-500' : citizen.verification_status === 'pending' ? 'bg-yellow-500' : citizen.verification_status === 'rejected' ? 'bg-red-500' : 'bg-gray-400'}>
          {citizen.verification_status === 'verified' ? 'Verified' : citizen.verification_status === 'pending' ? 'Pending' : citizen.verification_status === 'rejected' ? 'Rejected' : 'Not Verified'}
        </Badge>
        {citizen.is_senior_citizen && <Badge variant="outline">Senior Citizen</Badge>}
        {citizen.is_pwd && <Badge variant="outline">PWD</Badge>}
        {citizen.is_4ps_beneficiary && <Badge variant="outline">4Ps Beneficiary</Badge>}
      </div>

      {/* Personal Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Identity</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Field label="First Name" value={citizen.first_name} />
            <Field label="Middle Name" value={citizen.middle_name} />
            <Field label="Last Name" value={citizen.last_name} />
            <Field label="Suffix" value={citizen.suffix && citizen.suffix !== "none" ? citizen.suffix : null} />
            <Field label="Date of Birth" value={formatDate(citizen.date_of_birth)} />
            <Field label="Age" value={getAge(citizen.date_of_birth)} />
            <Field label="Sex" value={citizen.sex} />
            <Field label="Civil Status" value={citizen.civil_status} />
          </div>
        </CardContent>
      </Card>

      {/* Contact & Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact & Address</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Field label="Contact Number" value={citizen.contact_number} />
            <Field label="Email Address" value={citizen.email} />
            <Field label="Barangay" value={citizen.barangay} />
            <div className="col-span-2 md:col-span-3">
              <Field label="Full Address" value={citizen.full_address} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classification & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Classification</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Senior Citizen</p>
                <p className="text-xs text-muted-foreground">Ages 60 and above</p>
              </div>
              <BooleanBadge value={citizen.is_senior_citizen} />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Person with Disability (PWD)</p>
                <p className="text-xs text-muted-foreground">Requires valid PWD ID</p>
              </div>
              <BooleanBadge value={citizen.is_pwd} />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">4Ps Beneficiary</p>
                <p className="text-xs text-muted-foreground">Pantawid Pamilyang Pilipino Program</p>
              </div>
              <BooleanBadge value={citizen.is_4ps_beneficiary} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Voter Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{citizen.voter_status}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={statusColor(citizen.status)}>{citizen.status}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={citizen.verification_status === 'verified' ? 'bg-blue-500' : citizen.verification_status === 'pending' ? 'bg-yellow-500' : citizen.verification_status === 'rejected' ? 'bg-red-500' : 'bg-gray-400'}>
                {citizen.verification_status === 'verified' ? 'Verified' : citizen.verification_status === 'pending' ? 'Pending' : citizen.verification_status === 'rejected' ? 'Rejected' : 'Not Verified'}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
