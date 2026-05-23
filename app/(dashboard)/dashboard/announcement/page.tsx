'use client'
import TitlePage from '@/components/titlePage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, EllipsisVertical, Search, X } from 'lucide-react'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { formatDate } from '@/lib/helpers'
import { CATEGORIES, AUDIENCE } from '@/lib/constants/others'

const STATUS_OPTIONS = [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
]

const page = () => {
    const router = useRouter()
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(false)

    // ── Filters ──
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [category, setCategory] = useState('all')
    const [target, setTarget] = useState('all')
    const [visibility, setVisibility] = useState('all')

    const fetchAnnouncements = async (filters?: {
        search?: string
        status?: string
        category?: string
        target_audience?: string
        visibility?: string
    }) => {
        try {
            setLoading(true)
            const body: Record<string, any> = {}
            if (filters?.status && filters.status !== 'all') body.status = filters.status
            if (filters?.category && filters.category !== 'all') body.category = filters.category
            if (filters?.target_audience && filters.target_audience !== 'all') body.target_audience = filters.target_audience
            if (filters?.visibility && filters.visibility !== 'all') body.visibility = filters.visibility === 'true'
            if (filters?.search) body.search = filters.search

            const response = await fetch('/api/announcement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await response.json()
            setAnnouncements(data.data ?? [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => { fetchAnnouncements() }, [])

    // ── Trigger on Search button or Enter key ──
    const handleSearch = () => {
        fetchAnnouncements({ search, status, category, target_audience: target, visibility })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch()
    }

    const handleReset = () => {
        setSearch('')
        setStatus('all')
        setCategory('all')
        setTarget('all')
        setVisibility('all')
        fetchAnnouncements()
    }

    const renderVisibility = (v: boolean) => v ? 'Shown' : 'Hidden'

    const headers = ['Title', 'Category', 'Status', 'Visibility', 'Target', 'Created At', 'Actions']

    const renderTableData = () => {
        if (loading) return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={headers.length} className="text-center text-muted-foreground py-10">
                        Loading...
                    </TableCell>
                </TableRow>
            </TableBody>
        )

        if (announcements.length === 0) return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={headers.length} className="text-center text-muted-foreground py-10">
                        No announcements found
                    </TableCell>
                </TableRow>
            </TableBody>
        )

        return (
            <TableBody>
                {announcements.map((announcement: any) => (
                    <TableRow key={announcement.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{announcement.title}</TableCell>
                        <TableCell>{CATEGORIES.find((c) => c.value === announcement.category)?.label ?? '—'}</TableCell>
                        <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${announcement.status === 'published'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}>
                                {announcement.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className={`text-xs font-medium ${announcement.visibility ? 'text-green-600' : 'text-red-500'}`}>
                                {renderVisibility(announcement.visibility)}
                            </span>
                        </TableCell>
                        <TableCell>{AUDIENCE.find((a) => a.value === announcement.target_audience)?.label ?? '—'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(announcement.published_at)}</TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/announcement/${announcement.id}`)}>
                                <EllipsisVertical />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        )
    }

    return (
        <div className='p-4 mt-6'>
            <TitlePage title="Announcements" description="Manage announcements for your municipality" />

            <div className='bg-card border border-border p-4 rounded-lg'>

                {/* Top bar */}
                <div className='flex justify-between items-center mb-4'>
                    <h1 className='text-sm font-semibold'>Announcement List</h1>
                    <Button onClick={() => router.push('/dashboard/announcement/addAnnouncement')}>
                        <Plus />
                        Add Announcement
                    </Button>
                </div>

                {/* Filters */}
                <div className='flex flex-wrap items-center gap-2 mb-4'>

                    {/* Search */}
                    <div className='relative flex-1 min-w-[180px] max-w-xs'>
                        <Search size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
                        <Input
                            placeholder='Search title...'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className='pl-8 h-9 text-sm'
                        />
                    </div>

                    {/* Status */}
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className='h-9 text-sm w-36'>
                            <SelectValue placeholder='Status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Status</SelectItem>
                            {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Category */}
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className='h-9 text-sm w-44'>
                            <SelectValue placeholder='Category' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Categories</SelectItem>
                            {CATEGORIES.map((c) => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Target */}
                   <select
  value={target}
  onChange={(e) => setTarget(e.target.value)}
  className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground cursor-pointer outline-none focus:border-ring transition-colors"
>
  <option value="all">All Audiences</option>
  {AUDIENCE.map((a) => (
    <option key={a.value} value={a.value}>{a.label}</option>
  ))}
</select>

                    {/* Visibility */}
                    <Select value={visibility} onValueChange={setVisibility}>
                        <SelectTrigger className='h-9 text-sm w-36'>
                            <SelectValue placeholder='Visibility' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All</SelectItem>
                            <SelectItem value='true'>Shown</SelectItem>
                            <SelectItem value='false'>Hidden</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Search button */}
                    <Button size='sm' className='h-9 gap-1.5' onClick={handleSearch}>
                        <Search size={13} />
                        Search
                    </Button>

                    {/* Reset */}
                    <Button size='sm' variant='outline' className='h-9 gap-1.5' onClick={handleReset}>
                        <X size={13} />
                        Reset
                    </Button>

                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map((header) => (
                                <TableHead key={header}>{header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    {renderTableData()}
                </Table>
            </div>
        </div>
    )
}

export default page