'use client'

import { useEffect, useState } from 'react'
import { Users, UserCheck, Megaphone, Accessibility, PersonStanding, HandHeart, UserCog } from 'lucide-react'
import StatCard from '@/components/statCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { CATEGORIES } from '@/lib/constants/others'
import { formatDate } from '@/lib/helpers'

const chartConfig = {
  count: { label: 'Citizens', color: 'hsl(221, 83%, 53%)' },
}

const statusChartConfig = {
  Active:      { label: 'Active',      color: '#22c55e' },
  Deceased:    { label: 'Deceased',    color: '#ef4444' },
  Transferred: { label: 'Transferred', color: '#a855f7' },
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) throw new Error('Failed to fetch')
        setData(await res.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const statusPieData = data
    ? [
        { name: 'Active',      value: data.citizenStats.active },
        { name: 'Deceased',    value: data.citizenStats.deceased },
        { name: 'Transferred', value: data.citizenStats.transferred },
      ]
    : []

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Citizens"   value={loading ? '—' : data?.citizenStats.total ?? 0}        icon={Users}          color="blue"   />
        <StatCard title="Total Staff"      value={loading ? '—' : data?.staffStats.total ?? 0}           icon={UserCog}        color="green"  />
        <StatCard title="Announcements"    value={loading ? '—' : data?.announcementStats.published ?? 0} icon={Megaphone}      color="yellow" />
        <StatCard title="Active Citizens"  value={loading ? '—' : data?.citizenStats.active ?? 0}        icon={UserCheck}      color="orange" />
      </div>

      {/* Secondary KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="PWDs"             value={loading ? '—' : data?.citizenStats.pwd ?? 0}         icon={Accessibility}   color="red"    />
        <StatCard title="Senior Citizens"  value={loading ? '—' : data?.citizenStats.senior ?? 0}      icon={PersonStanding}  color="blue"   />
        <StatCard title="4Ps Beneficiaries" value={loading ? '—' : data?.citizenStats.beneficiary ?? 0} icon={HandHeart}      color="green"  />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar chart — citizens by barangay */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Citizens by Barangay</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart data={data?.citizensByBarangay ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 60 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="barangay"
                    tick={{ fontSize: 10 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie chart — citizen status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Citizen Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
            ) : (
              <ChartContainer config={statusChartConfig} className="h-[260px] w-full">
                <PieChart>
                  <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                    {statusPieData.map((entry) => (
                      <Cell key={entry.name} fill={statusChartConfig[entry.name as keyof typeof statusChartConfig]?.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Bottom row — recent announcements + staff summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent announcements */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : !data?.recentAnnouncements?.length ? (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {data.recentAnnouncements.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORIES.find((c) => c.value === a.category)?.label ?? a.category} · {formatDate(a.published_at)}
                      </p>
                    </div>
                    <Badge
                      className={a.status === 'published' ? 'bg-green-500 shrink-0' : 'bg-yellow-500 shrink-0'}
                    >
                      {a.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Staff Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              [
                { label: 'Total Staff',  value: data?.staffStats.total,     color: 'bg-blue-500' },
                { label: 'Active',       value: data?.staffStats.active,     color: 'bg-green-500' },
                { label: 'Inactive',     value: data?.staffStats.inactive,   color: 'bg-gray-400' },
                { label: 'Suspended',    value: data?.staffStats.suspended,  color: 'bg-red-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </div>
                  <span className="text-sm font-bold">{value ?? 0}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
