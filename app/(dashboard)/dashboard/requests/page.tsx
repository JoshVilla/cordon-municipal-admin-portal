"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/container'
import TitlePage from '@/components/titlePage'
import StatCard from '@/components/statCard'
import DataPagination from '@/components/pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  FileText, Clock, CheckCircle2, XCircle, Loader2, Eye,
  Search, X, Pencil, CreditCard, ClipboardCheck,
} from 'lucide-react'
import { showToast } from '@/lib/utils'
import DropdownActions from '@/components/dropdownActions'
import { ActionItemProps } from '@/lib/types'
import { checkPermission } from '@/lib/helpers'
import { useSelector } from 'react-redux'

interface Submission {
  id: string
  reference_number: string | null
  document_type_id: string
  document_type_name: string
  status: string
  payment_status: string
  total_amount: number
  admin_notes: string | null
  created_at: string
  updated_at: string
}

interface Stats {
  total: number
  pending: number
  reviewing: number
  approved: number
  rejected: number
  completed: number
  unpaid: number
  paid: number
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
    year: 'numeric', month: 'short', day: 'numeric',
  })

const formatAmount = (n: number) =>
  `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

const defaultFilters = { reference: '', status: 'all', payment_status: 'all', document_type_id: 'all' }

export default function DocumentRequestsPage() {
  const router = useRouter()
  const userData = useSelector((state:any) => state.auth.user)

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [totalItems, setTotalItems]   = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize]       = useState(10)
  const [loading, setLoading]         = useState(false)
  const [filters, setFilters]         = useState(defaultFilters)
  const [stats, setStats]             = useState<Stats>({
    total: 0, pending: 0, reviewing: 0,
    approved: 0, rejected: 0, completed: 0,
    unpaid: 0, paid: 0,
  })

  // document type options for filter dropdown
  const [docTypes, setDocTypes] = useState<{ id: string; name: string }[]>([])

  // edit modal
  const [editModal, setEditModal] = useState<{
    open: boolean
    submission: Submission | null
    status: string
    payment_status: string
  }>({ open: false, submission: null, status: '', payment_status: '' })
  const [editLoading, setEditLoading] = useState(false)

  const tableHeaders = [
    'Reference No.', 'Document Type', 'Status',
    'Payment', 'Amount', 'Submitted', 'Actions',
  ]

  const actionItems: ActionItemProps[] = [
    {
      icon: <Eye />,
      label: 'View Details',
      onClick: (row: Submission) => router.push(`/dashboard/requests/${row.id}`),
      hasPermission: checkPermission(userData?.permissions, 'ADR')
    },
    {
      icon: <Pencil />,
      label: 'Update Status',
      onClick: (row: Submission) =>
        setEditModal({
          open: true,
          submission: row,
          status: row.status,
          payment_status: row.payment_status,
        }),
        hasPermission: checkPermission(userData?.permissions, 'ADR')
    },
  ]

  useEffect(() => {
    // load document type options once
    fetch('/api/document-forms')
      .then(r => r.json())
      .then(({ data }) => setDocTypes(data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchSubmissions(filters, currentPage, pageSize)
  }, [currentPage, pageSize])

  const buildBody = (f = filters, page = currentPage, limit = pageSize) => {
    const body: Record<string, any> = { page, limit }
    if (f.reference)                          body.reference        = f.reference
    if (f.status !== 'all')                   body.status           = f.status
    if (f.payment_status !== 'all')           body.payment_status   = f.payment_status
    if (f.document_type_id !== 'all')         body.document_type_id = f.document_type_id
    return body
  }

  const fetchSubmissions = async (f = filters, page = currentPage, limit = pageSize) => {
    setLoading(true)
    try {
      const res = await fetch('/api/document-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(f, page, limit)),
      })
      if (!res.ok) throw new Error('Failed to fetch.')
      const { data, count, stats: s } = await res.json()
      setSubmissions(data ?? [])
      setTotalItems(count ?? 0)
      setStats(s)
    } catch {
      showToast.error('Failed to load document requests.')
    } finally {
      setLoading(false)
    }
  }

  const setField = (k: string, v: string) => setFilters(f => ({ ...f, [k]: v }))

  const handleSearch = () => {
    setCurrentPage(1)
    fetchSubmissions(filters, 1, pageSize)
  }

  const handleReset = () => {
    setFilters(defaultFilters)
    setCurrentPage(1)
    fetchSubmissions(defaultFilters, 1, pageSize)
  }

  const handleUpdateSubmission = async () => {
    if (!editModal.submission) return
    setEditLoading(true)
    try {
      const res = await fetch(`/api/document-submissions/${editModal.submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status:         editModal.status,
          payment_status: editModal.payment_status,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
      showToast.success(result.message)
      setEditModal({ open: false, submission: null, status: '', payment_status: '' })
      fetchSubmissions(filters, currentPage, pageSize)
    } catch (err: any) {
      showToast.error(err.message ?? 'Failed to update.')
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <Container>
      <TitlePage
        title="Document Requests"
        description="Manage and process citizen document request submissions"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
        <StatCard title="Total"      value={stats.total}     icon={FileText}      color="blue"   />
        <StatCard title="Pending"    value={stats.pending}   icon={Clock}         color="yellow" />
        <StatCard title="Reviewing"  value={stats.reviewing} icon={Loader2}       color="blue"   />
        <StatCard title="Approved"   value={stats.approved}  icon={CheckCircle2}  color="green"  />
        <StatCard title="Completed"  value={stats.completed} icon={ClipboardCheck} color="green" />
        <StatCard title="Rejected"   value={stats.rejected}  icon={XCircle}       color="red"    />
      </div>

      {/* Payment summary chips */}
      <div className="flex gap-2 mb-4">
        <span className="flex items-center gap-1.5 text-xs bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 px-3 py-1.5 rounded-full">
          <CreditCard size={12} /> {stats.unpaid} Unpaid
        </span>
        <span className="flex items-center gap-1.5 text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-full">
          <CreditCard size={12} /> {stats.paid} Paid
        </span>
      </div>

      {/* Table card */}
      <div className="bg-card border border-border p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Submission List</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reference no..."
              value={filters.reference}
              onChange={e => setField('reference', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="pl-8 h-9 text-sm"
            />
          </div>

          <Select value={filters.document_type_id} onValueChange={v => setField('document_type_id', v)}>
            <SelectTrigger className="h-9 text-sm w-44">
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {docTypes.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={v => setField('status', v)}>
            <SelectTrigger className="h-9 text-sm w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.payment_status} onValueChange={v => setField('payment_status', v)}>
            <SelectTrigger className="h-9 text-sm w-32">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment</SelectItem>
              {PAYMENT_OPTIONS.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" className="h-9 gap-1.5" onClick={handleSearch}>
            <Search size={13} /> Search
          </Button>
          <Button size="sm" variant="outline" className="h-9 gap-1.5" onClick={handleReset}>
            <X size={13} /> Reset
          </Button>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              {tableHeaders.map(h => <TableHead key={h}>{h}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="text-center text-muted-foreground py-12">
                  Loading...
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="py-14">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText size={36} className="opacity-20" />
                    <p className="text-sm">No submissions found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              submissions.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">
                    {row.reference_number ?? <span className="text-muted-foreground italic">—</span>}
                  </TableCell>
                  <TableCell className="text-sm">{row.document_type_name}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColor(row.status)} capitalize text-xs`}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${paymentColor(row.payment_status)} capitalize text-xs`}>
                      {row.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatAmount(row.total_amount)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(row.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownActions actionItems={actionItems} data={row} />
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

      {/* Edit status modal */}
      <Dialog
        open={editModal.open}
        onOpenChange={open => !open && setEditModal({ open: false, submission: null, status: '', payment_status: '' })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Submission</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Reference:{' '}
              <span className="font-mono font-medium text-foreground">
                {editModal.submission?.reference_number ?? '—'}
              </span>
            </p>

            <div className="space-y-1.5">
              <p className="text-xs font-medium">Status</p>
              <Select
                value={editModal.status}
                onValueChange={v => setEditModal(m => ({ ...m, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium">Payment Status</p>
              <Select
                value={editModal.payment_status}
                onValueChange={v => setEditModal(m => ({ ...m, payment_status: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModal({ open: false, submission: null, status: '', payment_status: '' })}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSubmission} disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  )
}
