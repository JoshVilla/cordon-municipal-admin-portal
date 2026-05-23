'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Container from '@/components/container'
import TitlePage from '@/components/titlePage'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface AnnouncementInfo {
    category: string
    content: string
    cover_image: string
    created_at: string
    created_by: number
    id: string
    title: string
    end_date: string
    start_date: string
    status: string
    target_audience: string
    visibility: boolean
    published_at: string
}

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const formatLabel = (str: string) =>
    str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function AnnouncementDetail() {
    const [announcement, setAnnouncement] = useState<AnnouncementInfo | null>(null)
    const params = useParams()
    const id = params.id

    const fetchAnnouncement = async () => {
        const response = await fetch(`/api/announcement/announcementInfo?id=${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
        const data = await response.json()
        setAnnouncement(data.data)
    }

    useEffect(() => {
        fetchAnnouncement()
    }, [])

    return (
        <Container>
            <TitlePage title="Announcement Detail" description="View and manage announcement details" hasBackButton />

            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start'>

                {/* Left card */}
                <div className='bg-card rounded-xl border border-border overflow-hidden'>
                    {/* Cover image */}
                    {announcement?.cover_image ? (
                        <div className='relative w-full h-56'>
                            <Image
                                src={announcement.cover_image}
                                alt="Announcement Cover"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-56 bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground text-sm">No cover image</p>
                        </div>
                    )}

                    {/* Content */}
                    <div className='p-5'>
                        <h1 className='text-2xl font-bold text-foreground mb-3'>
                            {announcement?.title}
                        </h1>

                        {/* Badges */}
                        <div className='flex flex-wrap gap-2 mb-4'>
                            {announcement?.category && (
                                <Badge variant="outline" className='text-xs'>
                                    {formatLabel(announcement.category)}
                                </Badge>
                            )}
                            {announcement?.status && (
                                <Badge className='text-xs bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100'>
                                    {formatLabel(announcement.status)}
                                </Badge>
                            )}
                            {announcement?.target_audience && (
                                <Badge variant="outline" className='text-xs'>
                                    {formatLabel(announcement.target_audience)}
                                </Badge>
                            )}
                        </div>

                        {/* Rich text content */}
                        <div
                            className='text-sm text-foreground leading-relaxed'
                            dangerouslySetInnerHTML={{ __html: announcement?.content || '' }}
                        />
                    </div>
                </div>

                {/* Right card */}
                <div className='bg-card rounded-xl border border-border p-5'>
                    <p className='text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4'>
                        Announcement Information
                    </p>

                    <div className='space-y-1'>
                        {[
                            { label: 'Category', value: announcement ? formatLabel(announcement.category) : '—' },
                            { label: 'Status', value: announcement ? formatLabel(announcement.status) : '—', isStatus: true },
                            { label: 'Audience', value: announcement ? formatLabel(announcement.target_audience) : '—' },
                            { label: 'Visibility', value: announcement ? (announcement.visibility ? 'Public' : 'Private') : '—' },
                            { label: 'Start date', value: announcement?.start_date ? formatDate(announcement.start_date) : '—' },
                            { label: 'End date', value: announcement?.end_date ? formatDate(announcement.end_date) : '—' },
                            { label: 'Published at', value: announcement?.published_at ? formatDate(announcement.published_at) : '—' },
                            { label: 'Created at', value: announcement?.created_at ? formatDate(announcement.created_at) : '—' },
                        ].map(({ label, value, isStatus }) => (
                            <div key={label} className='flex items-center justify-between py-3 border-b border-border last:border-0'>
                                <span className='text-sm text-muted-foreground'>{label}</span>
                                {isStatus ? (
                                    <Badge className='text-xs bg-blue-600 hover:bg-blue-600 text-white uppercase tracking-wide'>
                                        {value}
                                    </Badge>
                                ) : (
                                    <span className='text-sm text-foreground'>{value}</span>
                                )}
                            </div>
                        ))}
                        <div className='mt-4'>
                            <p className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                               Visible from – to
                            </p>
                            {[
                            { label: 'Start date', value: announcement?.start_date ? formatDate(announcement.start_date) : '—' },
                            { label: 'End date', value: announcement?.end_date ? formatDate(announcement.end_date) : '—' },
                        ].map(({ label, value }) => (
                            <div key={label} className='flex items-center justify-between py-3 border-b border-border last:border-0'>
                                <span className='text-sm text-muted-foreground'>{label}</span>
                                <span className='text-sm text-foreground'>{value}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>

            </div>
        </Container>
    )
}