"use client"

import { use, useEffect, useState } from "react"
import { UserPen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { showToast } from "@/lib/utils"
import TitlePage from "@/components/titlePage"

const barangays = [
  "Bagong Nayon", "Balite", "Burol", "Caingin", "Dampol I",
  "Dampol II-A", "Dampol II-B", "Dalig", "Ipil", "Loma de Gato",
  "Malhacan", "Pag-asa", "Paliwas", "Pandayan", "Santa Cruz",
  "Santo Cristo", "Saog", "Tabing Ilog",
]

const defaultForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  dateOfBirth: "",
  sex: "",
  civilStatus: "",
  contactNumber: "",
  email: "",
  barangay: "",
  fullAddress: "",
  isSeniorCitizen: false,
  isPWD: false,
  is4PsBeneficiary: false,
  voterStatus: "Registered",
  status: "Active",
  isVerified: "not_verified",
}

export default function EditCitizenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const setField = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }))

  useEffect(() => {
    const fetchCitizen = async () => {
      try {
        const res = await fetch(`/api/citizen/${id}`)
        if (!res.ok) throw new Error("Failed to load citizen")
        const { data } = await res.json()
        setForm({
          firstName: data.first_name ?? "",
          middleName: data.middle_name ?? "",
          lastName: data.last_name ?? "",
          suffix: data.suffix ?? "",
          dateOfBirth: data.date_of_birth ?? "",
          sex: data.sex ?? "",
          civilStatus: data.civil_status ?? "",
          contactNumber: data.contact_number ?? "",
          email: data.email ?? "",
          barangay: data.barangay ?? "",
          fullAddress: data.full_address ?? "",
          isSeniorCitizen: data.is_senior_citizen ?? false,
          isPWD: data.is_pwd ?? false,
          is4PsBeneficiary: data.is_4ps_beneficiary ?? false,
          voterStatus: data.voter_status ?? "Registered",
          status: data.status ?? "Active",
          isVerified: data.is_verified ?? "not_verified",
        })
      } catch (err: any) {
        showToast.error(err.message)
      } finally {
        setFetching(false)
      }
    }
    fetchCitizen()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/citizen/editCitizen", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      showToast.success(data.message)
    } catch (error: any) {
      showToast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="py-8 px-4">
        <p className="text-muted-foreground">Loading citizen data...</p>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 space-y-4">
      <TitlePage title="Edit Citizen" description="Update citizen information" hasBackButton />

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Personal Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Identity</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4 space-y-1.5">
                <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                <Input
                  id="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="col-span-3 space-y-1.5">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  placeholder="Middle Name"
                  value={form.middleName}
                  onChange={(e) => setField("middleName", e.target.value)}
                />
              </div>
              <div className="col-span-3 space-y-1.5">
                <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                <Input
                  id="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Suffix</Label>
                <Select value={form.suffix} onValueChange={(v) => setField("suffix", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="Jr.">Jr.</SelectItem>
                    <SelectItem value="Sr.">Sr.</SelectItem>
                    <SelectItem value="II">II</SelectItem>
                    <SelectItem value="III">III</SelectItem>
                    <SelectItem value="IV">IV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of Birth <span className="text-destructive">*</span></Label>
                <Input
                  id="dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setField("dateOfBirth", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sex <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  {["Male", "Female"].map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={form.sex === s ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setField("sex", s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Civil Status</Label>
                <Select value={form.civilStatus} onValueChange={(v) => setField("civilStatus", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Single", "Married", "Widowed", "Separated", "Annulled"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact & Address</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  placeholder="+63 917 123 4567"
                  value={form.contactNumber}
                  onChange={(e) => setField("contactNumber", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="citizen@example.com"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Barangay <span className="text-destructive">*</span></Label>
              <Select value={form.barangay} onValueChange={(v) => setField("barangay", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Barangay" />
                </SelectTrigger>
                <SelectContent>
                  {barangays.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                placeholder="House number, Street, Subdivision..."
                value={form.fullAddress}
                onChange={(e) => setField("fullAddress", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Classification + Side panels */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Classification</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6 space-y-4">
                {[
                  { field: "isSeniorCitizen", label: "Senior Citizen", description: "Ages 60 and above" },
                  { field: "isPWD", label: "Person with Disability (PWD)", description: "Requires valid PWD ID validation" },
                  { field: "is4PsBeneficiary", label: "4Ps Beneficiary", description: "Pantawid Pamilyang Pilipino Program" },
                ].map(({ field, label, description }) => (
                  <div key={field} className="flex items-start gap-3">
                    <Checkbox
                      id={field}
                      checked={form[field as keyof typeof form] as boolean}
                      onCheckedChange={(v) => setField(field, v)}
                      className="mt-0.5"
                    />
                    <div>
                      <label htmlFor={field} className="text-sm font-medium cursor-pointer">{label}</label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  Voter Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={form.voterStatus}
                  onValueChange={(v) => setField("voterStatus", v)}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Registered" id="registered" />
                    <Label htmlFor="registered" className="font-normal cursor-pointer">Registered</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Not Registered" id="not-registered" />
                    <Label htmlFor="not-registered" className="font-normal cursor-pointer">Not Registered</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Deceased">Deceased</SelectItem>
                    <SelectItem value="Transferred">Transferred</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Active records are visible in reports.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={form.isVerified} onValueChange={(v) => setField("isVerified", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_verified">Not Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 pb-6">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : <><UserPen className="mr-2 h-4 w-4" />Save Changes</>}
          </Button>
        </div>

      </form>
    </div>
  )
}
