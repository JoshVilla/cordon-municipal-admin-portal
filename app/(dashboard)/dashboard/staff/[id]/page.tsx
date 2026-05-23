'use client'
import React, { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { showToast } from '@/lib/utils'
import TitlePage from '@/components/titlePage'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import StatusBadge from '@/components/statusBadge'
import { DEPARTMENTS } from '@/lib/constants/departments'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/helpers'

interface StaffInfo {
    id: string
    name: string
    email: string
    role: string
    status: string
    created_at: string
    profile_picture: string
    employee_id: string
    department: string
}

const page = () => {

    const [staffInfo, setStaffInfo] = React.useState<StaffInfo | null>(null)
    const [loading, setLoading] = React.useState(true)

    const params = useParams()
    const id = params.id

    const fetchStaffInfo = async () => {
        try {
            const response = await fetch(`/api/staff/staffInfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
        const data = await response.json()
        console.log(data)
        setStaffInfo(data.data)
        setLoading(false)
        } catch (error) {
            console.error(error)
            showToast.error('Failed to fetch staff info')
            setLoading(false)
        }
    }

    const getDepartmentLabel = (department: string) => {
        return DEPARTMENTS.find(dept => dept.value === department)?.label || department
    }

    useEffect(() => {
        fetchStaffInfo()
    }, [])

    if (loading) {
        return (
            <div className='p-4 mt-6'>
                <TitlePage title='Staff Details' description='View and manage staff information' hasBackButton/>
                <div className='p-4'>
                    <Card>
                        <CardHeader>
                        </CardHeader>
                        <CardContent>
                            <div className='flex gap-4'>
                                <Avatar className='w-32 h-32' >
                                    <AvatarImage src=''  />
                                    <AvatarFallback></AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className='flex gap-4 items-center'>
                                        <h1 className='text-3xl font-bold'>Loading...</h1>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }
    
  return (
    <div className='p-4 mt-6'>
        <TitlePage title='Staff Details' description='View and manage staff information' hasBackButton/>

        <div className='p-4'>
            <Card>
                <CardHeader>
                </CardHeader>
                <CardContent>
                    <div className='flex gap-4'>
                        <Avatar className='w-32 h-32' >
                            <AvatarImage src={staffInfo?.profile_picture}  />
                            <AvatarFallback>{staffInfo?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                           <div className='flex gap-4 items-center'>
                             <h1 className='text-3xl font-bold'>{staffInfo?.name}</h1>
                             <StatusBadge status={staffInfo?.status as 'active' | 'inactive' | 'suspended'} />
                           </div>
                           <h1 className='text-lg mt-2'>{getDepartmentLabel(staffInfo?.department || '')}</h1>
                           <div className='flex gap-4 mt-4'>
                            <div className='flex flex-col gap-2'>
                              <p className='text-sm text-gray-500'>EMPLOYEE ID</p>
                              <p className='font-semibold' style={{ color: "#1A4FA0" }}>{staffInfo?.employee_id}</p>
                            </div>
                            <Separator orientation="vertical" />
                            <div className='flex flex-col gap-2'>
                              <p className='text-sm text-gray-500'>JOINED DATE</p>
                              <p className='font-semibold' style={{ color: "#1A4FA0" }}>{formatDate(staffInfo?.created_at || '')}</p>
                            </div>
                           </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

export default page
