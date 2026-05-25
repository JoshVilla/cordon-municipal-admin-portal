"use client"
import Container from '@/components/container'
import DataPagination from '@/components/pagination'
import TitlePage from '@/components/titlePage'
import StatCard from '@/components/statCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Eye, Pencil, Search, ClipboardList, Clock, CheckCircle2, XCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ActionItemProps } from '@/lib/types'
import DropdownActions from '@/components/dropdownActions'
import { checkPermission } from '@/lib/helpers'
import { showToast } from '@/lib/utils'
import { useSelector } from 'react-redux'

const barangays = [
  "Bagong Nayon", "Balite", "Burol", "Caingin", "Dampol I",
  "Dampol II-A", "Dampol II-B", "Dalig", "Ipil", "Loma de Gato",
  "Malhacan", "Pag-asa", "Paliwas", "Pandayan", "Santa Cruz",
  "Santo Cristo", "Saog", "Tabing Ilog",
]

const defaultFilters = { name: '', barangay: 'all', status: 'all' }

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
  new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })

const Page = () => {
  const router = useRouter()
  const userData = useSelector((state: any) => state.auth.user)

  const [requests, setRequests] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState(defaultFilters)
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 })
  const [editModal, setEditModal] = useState({ open: false, request: null as any, status: '' })
  const [editLoading, setEditLoading] = useState(false)

  const tableHeaders = ['Name', 'Email', 'Barangay', 'ID Type', 'Phone Number', 'Status', 'Submitted', 'Actions']

  const actionItems: ActionItemProps[] = [
    {
      icon: <Eye />,
      label: 'View',
      onClick: (data: any) => router.push(`/dashboard/verification-request/${data.id}`),
      hasPermission: checkPermission(userData?.permissions, 'ACD'),
    },
    {
      icon: <Pencil />,
      label: 'Edit Status',
      onClick: (data: any) => setEditModal({ open: true, request: data, status: data.status }),
      hasPermission: checkPermission(userData?.permissions, 'ACD'),
    },
  ]

  const buildBody = (f = filters, page = currentPage, limit = pageSize) => {
    const body: Record<string, any> = { page, limit }
    if (f.name) body.name = f.name
    if (f.barangay !== 'all') body.barangay = f.barangay
    if (f.status !== 'all') body.status = f.status
    return body
  }

  const fetchRequests = async (f = filters, page = currentPage, limit = pageSize) => {
    setLoading(true)
    try {
      const res = await fetch('/api/verification-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(f, page, limit)),
      })
      if (!res.ok) throw new Error('Failed to fetch verification requests')
      const { data, count, stats: newStats } = await res.json()
      setRequests(data)
      setTotalItems(count ?? 0)
      setStats(newStats)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests(filters, currentPage, pageSize)
  }, [currentPage, pageSize])

  const setField = (field: string, value: string) =>
    setFilters((f) => ({ ...f, [field]: value }))

  const handleSearch = () => {
    setCurrentPage(1)
    fetchRequests(filters, 1, pageSize)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleReset = () => {
    setFilters(defaultFilters)
    setCurrentPage(1)
    fetchRequests(defaultFilters, 1, pageSize)
  }

  const handleUpdateStatus = async () => {
    setEditLoading(true)
    try {
      const res = await fetch(`/api/verification-request/${editModal.request.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editModal.status }),
      })
      const result = await res.json()
      if (res.ok) {
        showToast.success(result.message)
        setEditModal({ open: false, request: null, status: '' })
        fetchRequests(filters, currentPage, pageSize)
      } else {
        showToast.error(result.message)
      }
    } catch {
      showToast.error('Failed to update status.')
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <Container>
      <TitlePage title="Verification Requests" description="Manage citizen verification requests" />

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
        <StatCard title="Total Requests" value={stats.total}    icon={ClipboardList}  color="blue"   />
        <StatCard title="Pending"        value={stats.pending}  icon={Clock}          color="yellow" />
        <StatCard title="Verified"       value={stats.verified} icon={CheckCircle2}   color="green"  />
        <StatCard title="Rejected"       value={stats.rejected} icon={XCircle}        color="red"    />
      </div>

      <div className='bg-card border border-border p-4 rounded-lg'>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-sm font-semibold'>Verification Request List</h1>
        </div>

        <div className='flex flex-wrap items-center gap-2 mb-4'>
          <div className='relative flex-1 min-w-[180px] max-w-xs'>
            <Search size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search name...'
              value={filters.name}
              onChange={(e) => setField('name', e.target.value)}
              onKeyDown={handleKeyDown}
              className='pl-8 h-9 text-sm'
            />
          </div>

          <Select value={filters.barangay} onValueChange={(v) => setField('barangay', v)}>
            <SelectTrigger className='h-9 text-sm w-44'>
              <SelectValue placeholder='Barangay' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Barangays</SelectItem>
              {barangays.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(v) => setField('status', v)}>
            <SelectTrigger className='h-9 text-sm w-36'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='verified'>Verified</SelectItem>
              <SelectItem value='rejected'>Rejected</SelectItem>
              <SelectItem value='not_verified'>Not Verified</SelectItem>
            </SelectContent>
          </Select>

          <Button size='sm' className='h-9 gap-1.5' onClick={handleSearch}>
            <Search size={13} /> Search
          </Button>
          <Button size='sm' variant='outline' className='h-9 gap-1.5' onClick={handleReset}>
            <X size={13} /> Reset
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              {tableHeaders.map((h) => <TableHead key={h}>{h}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="text-center text-muted-foreground py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="text-center text-muted-foreground py-10">
                  No verification requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req: any) => (
                <TableRow key={req.id}>
                  <TableCell>{req.name}</TableCell>
                  <TableCell>{req.email}</TableCell>
                  <TableCell>{req.barangay}</TableCell>
                  <TableCell>{req.id_type}</TableCell>
                  <TableCell>{req.phone_number ?? '—'}</TableCell>
                  <TableCell>
                    <Badge className={statusColor(req.status)}>{statusLabel(req.status)}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(req.created_at)}</TableCell>
                  <TableCell>
                    <DropdownActions actionItems={actionItems} data={req} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <DataPagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <Dialog
        open={editModal.open}
        onOpenChange={(open) => !open && setEditModal({ open: false, request: null, status: '' })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Verification Status</DialogTitle>
          </DialogHeader>
          <div className='space-y-3 py-2'>
            <p className='text-sm text-muted-foreground'>
              Update status for{' '}
              <span className='font-medium text-foreground'>{editModal.request?.name}</span>
            </p>
            <Select
              value={editModal.status}
              onValueChange={(v) => setEditModal((m) => ({ ...m, status: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='verified'>Verified</SelectItem>
                <SelectItem value='rejected'>Rejected</SelectItem>
                <SelectItem value='not_verified'>Not Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setEditModal({ open: false, request: null, status: '' })}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default Page
