"use client"

import React, { useEffect } from 'react'
import TitlePage from '@/components/titlePage'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProfileAvatar } from '@/components/profileAvatar'
import { useRouter } from 'next/navigation'
import { DEPARTMENTS } from '@/lib/constants/departments'
import StatusBadge from '@/components/statusBadge'
import StatCard from '@/components/statCard'
import { Users, UserCheck, UserX, ShieldAlert, EllipsisVertical, Shield, Eye, UserCog, Plus } from 'lucide-react'
import { showToast } from '@/lib/utils'
import { useSelector } from 'react-redux'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditPermissionsModal } from './modals/editPermissionModal'
import { EditStatusModal } from './modals/editAccountStatus'
import { checkPermission, getSuspensionEndDate } from '@/lib/helpers'
import DropdownActions from '@/components/dropdownActions'

interface StaffStats {
  total: number
  active: number
  inactive: number
  onLeave: number
  suspended: number
}

const page = () => {
  const router = useRouter()
  const userData = useSelector((state: any) => state.auth.user)

  const [staff, setStaff] = useState<any[]>([])
  const [permissionsModal, setPermissionsModal] = useState<{ open: boolean; staff: any | null }>({ open: false, staff: null })
  const [statusModal, setStatusModal] = useState<{ open: boolean; staff: any | null }>({ open: false, staff: null })
  const [statsStaff, setStatsStaff] = useState<StaffStats>({ total: 0, active: 0, inactive: 0, onLeave: 0, suspended: 0 })
  const [loading, setLoading] = useState(false)
  const headers: string[] = ['Name', 'Employee ID', 'Department', 'Role', 'Status', 'Actions']

  const actionItems = [
    { label: 'View Details', icon: <Eye className="h-4 w-4" />, onClick: (data: any) => goToStaffDetails(data.id), hasPermission: checkPermission(userData?.permissions, 'MSA') },
    { label: 'Edit Permissions', icon: <UserCog className="h-4 w-4" />, onClick: (data: any) => setPermissionsModal({ open: true, staff: data }), hasPermission: checkPermission(userData?.permissions, 'MSA') },
    { label: 'Edit Status', icon: <Shield className="h-4 w-4" />, onClick: (data: any) => setStatusModal({ open: true, staff: data }), hasPermission: checkPermission(userData?.permissions, 'MSA') },
  ]

  const fetchStaffs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff')
      const data = await response.json()
      setStaff(data.data)
      setStatsStaff(data.stats)
    } catch (error) {
      console.error(error)
      showToast.error('Failed to fetch staffs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStaffs() }, [])

  const goToAddStaff = () => router.push('/dashboard/staff/addStaff')
  const goToStaffDetails = (id: string) => router.push(`/dashboard/staff/${id}`)

  const renderTableData = () => {
    if (loading) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={headers.length} className='text-center text-muted-foreground'>
              Loading...
            </TableCell>
          </TableRow>
        </TableBody>
      )
    }
    if (staff.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={headers.length} className='text-center text-muted-foreground'>
              No staff found
            </TableCell>
          </TableRow>
        </TableBody>
      )
    }
    return (
      <TableBody>
        {staff.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className='flex items-center gap-2'>
                <ProfileAvatar name={member.name} imageUrl={member.profile_picture} />
                <div>
                  <p className='text-foreground text-sm font-medium'>
                    {member.name} {userData?.id === member?.id ? <span className='text-muted-foreground text-xs'>(You)</span> : ''}
                  </p>
                  <p className='text-xs text-muted-foreground'>{member.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className='text-foreground'>{member.employee_id}</TableCell>
            <TableCell className='text-foreground'>{DEPARTMENTS.find((dept) => dept.value === member.department)?.label}</TableCell>
            <TableCell className='text-foreground'>{member.role}</TableCell>
            <TableCell>
              <div className='flex flex-col items-start gap-1'>
                <StatusBadge status={member.status} />
                {member.suspend_duration && (
                  <p className='text-xs text-muted-foreground'>
                    Until {getSuspensionEndDate(member.suspend_duration)} 12:00 am
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <DropdownActions actionItems={actionItems} data={member} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    )
  }

  return (
    <div className='p-4 mt-6'>
      <TitlePage title='Staff Management' description='Manage municipal employees, roles and their credentials' />
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6'>
        <StatCard title='Total Staff' value={statsStaff.total} icon={Users} color='blue' />
        <StatCard title='Active' value={statsStaff.active} icon={UserCheck} color='green' />
        <StatCard title='Inactive' value={statsStaff.inactive} icon={UserX} color='red' />
        <StatCard title='Suspended' value={statsStaff.suspended} icon={ShieldAlert} color='orange' />
      </div>
      <div className='bg-card border border-border p-4 rounded-lg'>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-lg font-semibold'>Staff List</h1>
          <Button onClick={goToAddStaff} className='flex items-center gap-2'>
            <Plus />
            <span>Add Staff</span>
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

      <EditPermissionsModal
        open={permissionsModal.open}
        onClose={() => setPermissionsModal({ open: false, staff: null })}
        staff={permissionsModal.staff}
        onSave={async (staffId, permissions) => {
          const res = await fetch(`/api/staff/${staffId}/permissions`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions }),
          })
          if (!res.ok) throw new Error('Failed')
          await fetchStaffs()
        }}
      />
      <EditStatusModal
        open={statusModal.open}
        onClose={() => setStatusModal({ open: false, staff: null })}
        staff={statusModal.staff}
        onSave={async (staffId, status, suspendDays) => {
          const res = await fetch(`/api/staff/${staffId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status,
              suspend_duration: suspendDays ? parseInt(suspendDays) : null,
            }),
          })
          if (!res.ok) throw new Error('Failed')
          await fetchStaffs()
        }}
      />
    </div>
  )
}

export default page