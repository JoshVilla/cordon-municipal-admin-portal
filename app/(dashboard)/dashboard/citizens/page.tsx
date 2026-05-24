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
import { Eye, Pencil, Plus, Search, Trash2, Users, Accessibility, PersonStanding, HandHeart, Vote, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ActionItemProps } from '@/lib/types'
import DropdownActions from '@/components/dropdownActions'
import DeleteConfirmation from '@/components/deleteConfirmation'
import { checkPermission } from '@/lib/helpers'
import { showToast } from '@/lib/utils'
import { useSelector } from 'react-redux'

const barangays = [
  "Bagong Nayon", "Balite", "Burol", "Caingin", "Dampol I",
  "Dampol II-A", "Dampol II-B", "Dalig", "Ipil", "Loma de Gato",
  "Malhacan", "Pag-asa", "Paliwas", "Pandayan", "Santa Cruz",
  "Santo Cristo", "Saog", "Tabing Ilog",
]

const defaultFilters = {
  name: '',
  barangay: 'all',
  status: 'all',
  civil_status: 'all',
  is_pwd: 'all',
  is_senior_citizen: 'all',
  is_4ps_beneficiary: 'all',
  voter_status: 'all',
}

const Page = () => {
  const router = useRouter()
  const userData = useSelector((state: any) => state.auth.user)

  const [citizens, setCitizens] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState(defaultFilters)
  const [stats, setStats] = useState({ total: 0, pwd: 0, senior: 0, beneficiary: 0, registered_voters: 0 })
  const [deleteModal, setDeleteModal] = useState({ open: false, citizen: null as any })

  const tableHeaders = ['Name', 'Barangay', 'Status', 'Actions']

  const actionItems: ActionItemProps[] = [
    {
      icon: <Eye />,
      label: 'View',
      onClick: (data: any) => router.push(`/dashboard/citizens/${data.id}`),
      hasPermission: checkPermission(userData?.permissions, 'ACD')
    },
    {
      icon: <Pencil />,
      label: 'Edit',
      onClick: (data: any) => router.push(`/dashboard/citizens/editCitizen/${data.id}`),
      hasPermission: checkPermission(userData?.permissions, 'ACD')
    },
    {
      icon: <Trash2 />,
      label: 'Delete',
      onClick: (data: any) => setDeleteModal({ open: true, citizen: data }),
      hasPermission: checkPermission(userData?.permissions, 'ACD')
    }
  ]

  const buildBody = (f = filters, page = currentPage, limit = pageSize) => {
    const body: Record<string, any> = { page, limit }
    if (f.name) body.name = f.name
    if (f.barangay !== 'all') body.barangay = f.barangay
    if (f.status !== 'all') body.status = f.status
    if (f.civil_status !== 'all') body.civil_status = f.civil_status
    if (f.is_pwd !== 'all') body.is_pwd = f.is_pwd === 'true'
    if (f.is_senior_citizen !== 'all') body.is_senior_citizen = f.is_senior_citizen === 'true'
    if (f.is_4ps_beneficiary !== 'all') body.is_4ps_beneficiary = f.is_4ps_beneficiary === 'true'
    if (f.voter_status !== 'all') body.voter_status = f.voter_status
    return body
  }

  const fetchCitizens = async (f = filters, page = currentPage, limit = pageSize) => {
    setLoading(true)
    try {
      const res = await fetch("/api/citizen/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(f, page, limit)),
      })
      if (!res.ok) throw new Error("Failed to fetch citizens")
      const { data, count } = await res.json()
      setCitizens(data)
      setTotalItems(count ?? 0)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/citizen/stats")
      if (!res.ok) return
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchCitizens(filters, currentPage, pageSize)
  }, [currentPage, pageSize])

  const setField = (field: string, value: string) =>
    setFilters((f) => ({ ...f, [field]: value }))

  const handleSearch = () => {
    setCurrentPage(1)
    fetchCitizens(filters, 1, pageSize)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleReset = () => {
    setFilters(defaultFilters)
    setCurrentPage(1)
    fetchCitizens(defaultFilters, 1, pageSize)
  }

  const getFullName = (citizen: any) => {
    const middle = citizen.middle_name ? `${citizen.middle_name.charAt(0)}.` : ''
    const suffix = citizen.suffix ?? ''
    return `${citizen.first_name} ${middle} ${citizen.last_name} ${suffix}`.trim()
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500'
      case 'Deceased': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Container>
      <TitlePage title="Citizens" description="Manage citizen information" />
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4'>
        <StatCard title="Total Citizens" value={stats.total} icon={Users} color="blue" />
        <StatCard title="PWDs" value={stats.pwd} icon={Accessibility} color="orange" />
        <StatCard title="Senior Citizens" value={stats.senior} icon={PersonStanding} color="green" />
        <StatCard title="4Ps Beneficiaries" value={stats.beneficiary} icon={HandHeart} color="yellow" />
        <StatCard title="Registered Voters" value={stats.registered_voters} icon={Vote} color="red" />
      </div>

      <div className='bg-card border border-border p-4 rounded-lg'>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-sm font-semibold'>Citizen List</h1>
          <Button onClick={() => router.push('/dashboard/citizens/addCitizen')}>
            <Plus /> Add Citizen
          </Button>
        </div>

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-2 mb-4'>

          {/* Name search */}
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

          {/* Barangay */}
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

          {/* Status */}
          <Select value={filters.status} onValueChange={(v) => setField('status', v)}>
            <SelectTrigger className='h-9 text-sm w-36'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='Active'>Active</SelectItem>
              <SelectItem value='Deceased'>Deceased</SelectItem>
              <SelectItem value='Transferred'>Transferred</SelectItem>
            </SelectContent>
          </Select>

          {/* Civil Status */}
          <Select value={filters.civil_status} onValueChange={(v) => setField('civil_status', v)}>
            <SelectTrigger className='h-9 text-sm w-40'>
              <SelectValue placeholder='Civil Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Civil Status</SelectItem>
              {['Single', 'Married', 'Widowed', 'Separated', 'Annulled'].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* PWD */}
          <Select value={filters.is_pwd} onValueChange={(v) => setField('is_pwd', v)}>
            <SelectTrigger className='h-9 text-sm w-32'>
              <SelectValue placeholder='PWD' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>PWD (All)</SelectItem>
              <SelectItem value='true'>Yes</SelectItem>
              <SelectItem value='false'>No</SelectItem>
            </SelectContent>
          </Select>

          {/* Senior Citizen */}
          <Select value={filters.is_senior_citizen} onValueChange={(v) => setField('is_senior_citizen', v)}>
            <SelectTrigger className='h-9 text-sm w-40'>
              <SelectValue placeholder='Senior Citizen' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Senior (All)</SelectItem>
              <SelectItem value='true'>Yes</SelectItem>
              <SelectItem value='false'>No</SelectItem>
            </SelectContent>
          </Select>

          {/* 4Ps Beneficiary */}
          <Select value={filters.is_4ps_beneficiary} onValueChange={(v) => setField('is_4ps_beneficiary', v)}>
            <SelectTrigger className='h-9 text-sm w-36'>
              <SelectValue placeholder='4Ps' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>4Ps (All)</SelectItem>
              <SelectItem value='true'>Yes</SelectItem>
              <SelectItem value='false'>No</SelectItem>
            </SelectContent>
          </Select>

          {/* Voter Status */}
          <Select value={filters.voter_status} onValueChange={(v) => setField('voter_status', v)}>
            <SelectTrigger className='h-9 text-sm w-44'>
              <SelectValue placeholder='Voter Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Voter Status</SelectItem>
              <SelectItem value='Registered'>Registered</SelectItem>
              <SelectItem value='Not Registered'>Not Registered</SelectItem>
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
              {tableHeaders.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="text-center text-muted-foreground py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : citizens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="text-center text-muted-foreground py-10">
                  No citizens found.
                </TableCell>
              </TableRow>
            ) : (
              citizens.map((citizen: any) => (
                <TableRow key={citizen.id}>
                  <TableCell>{getFullName(citizen)}</TableCell>
                  <TableCell>{citizen.barangay}</TableCell>
                  <TableCell>
                    <Badge className={statusColor(citizen.status)}>{citizen.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownActions actionItems={actionItems} data={citizen} />
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
      <DeleteConfirmation
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, citizen: null })}
        onConfirm={async (data) => {
          const res = await fetch('/api/citizen/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: data.id }),
          })
          const result = await res.json()
          if (result.success) {
            setDeleteModal({ open: false, citizen: null })
            showToast.success(result.message)
            fetchStats()
            fetchCitizens(filters, currentPage, pageSize)
          } else {
            showToast.error(result.message)
          }
        }}
        data={deleteModal.citizen}
      />
    </Container>
  )
}

export default Page
