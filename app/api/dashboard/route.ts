import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const [citizensRes, staffRes, announcementsRes, recentAnnouncementsRes] = await Promise.all([
      supabase.from('citizens').select('status, barangay, is_pwd, is_senior_citizen, is_4ps_beneficiary'),
      supabase.from('staffs').select('status'),
      supabase.from('announcements').select('status', { count: 'exact' }),
      supabase.from('announcements').select('id, title, status, category, published_at').order('published_at', { ascending: false }).limit(5),
    ])

    if (citizensRes.error) throw citizensRes.error
    if (staffRes.error) throw staffRes.error
    if (announcementsRes.error) throw announcementsRes.error

    const citizens = citizensRes.data ?? []
    const staff = staffRes.data ?? []
    const announcements = announcementsRes.data ?? []

    // Citizen stats
    const citizenStats = {
      total: citizens.length,
      active: citizens.filter((c) => c.status === 'Active').length,
      deceased: citizens.filter((c) => c.status === 'Deceased').length,
      transferred: citizens.filter((c) => c.status === 'Transferred').length,
      pwd: citizens.filter((c) => c.is_pwd).length,
      senior: citizens.filter((c) => c.is_senior_citizen).length,
      beneficiary: citizens.filter((c) => c.is_4ps_beneficiary).length,
    }

    // Citizens by barangay (top 10)
    const barangayMap: Record<string, number> = {}
    for (const c of citizens) {
      if (c.barangay) barangayMap[c.barangay] = (barangayMap[c.barangay] ?? 0) + 1
    }
    const citizensByBarangay = Object.entries(barangayMap)
      .map(([barangay, count]) => ({ barangay, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Staff stats
    const staffStats = {
      total: staff.length,
      active: staff.filter((s) => s.status === 'active').length,
      inactive: staff.filter((s) => s.status === 'inactive').length,
      suspended: staff.filter((s) => s.status === 'suspended').length,
    }

    // Announcement stats
    const announcementStats = {
      total: announcements.length,
      published: announcements.filter((a) => a.status === 'published').length,
      draft: announcements.filter((a) => a.status === 'draft').length,
    }

    return NextResponse.json({
      citizenStats,
      citizensByBarangay,
      staffStats,
      announcementStats,
      recentAnnouncements: recentAnnouncementsRes.data ?? [],
    })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
