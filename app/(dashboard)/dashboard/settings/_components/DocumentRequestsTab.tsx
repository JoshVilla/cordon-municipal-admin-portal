"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { showToast } from '@/lib/utils'
import DeleteConfirmation from '@/components/deleteConfirmation'
import DocumentRequestModal from './DocumentRequestModal'
import { Plus, Search, X, Pencil, Trash2, FileText, Calendar } from 'lucide-react'

export interface DocumentRequestType {
  id: string
  name: string
  description: string
  price: number
  processing_days: number
  is_active: boolean
  requires_appointment: boolean
  has_pdf_template: boolean
  created_at: string
  updated_at: string
}

const tableHeaders = [
  'Document Name', 'Price (₱)', 'Processing Days',
  'Appointment', 'PDF Template', 'Status', 'Actions',
]

export default function DocumentRequestsTab() {
  const [documents, setDocuments] = useState<DocumentRequestType[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal] = useState<{ open: boolean; doc: DocumentRequestType | null }>({ open: false, doc: null })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; doc: DocumentRequestType | null }>({ open: false, doc: null })

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async (s = search, f = statusFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (s) params.set('search', s)
      if (f !== 'all') params.set('status', f)

      const res = await fetch(`/api/document-requests?${params}`)
      if (!res.ok) throw new Error('Failed to fetch.')
      const { data } = await res.json()
      setDocuments(data ?? [])
    } catch {
      showToast.error('Failed to load document request types.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => fetchDocuments(search, statusFilter)

  const handleReset = () => {
    setSearch('')
    setStatusFilter('all')
    fetchDocuments('', 'all')
  }

  const handleToggleActive = async (doc: DocumentRequestType) => {
    const next = !doc.is_active
    setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, is_active: next } : d))
    try {
      const res = await fetch(`/api/document-requests/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: next }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
      showToast.success(`${doc.name} is now ${next ? 'active' : 'inactive'}.`)
    } catch (err: any) {
      setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, is_active: doc.is_active } : d))
      showToast.error(err.message ?? 'Failed to update status.')
    }
  }

  const handleDelete = async (doc: DocumentRequestType) => {
    try {
      const res = await fetch(`/api/document-requests/${doc.id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
      showToast.success(result.message)
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
      setDeleteDialog({ open: false, doc: null })
    } catch (err: any) {
      showToast.error(err.message ?? 'Failed to delete.')
    }
  }

  const handleModalSave = (saved: DocumentRequestType, isNew: boolean) => {
    if (isNew) {
      setDocuments((prev) => [saved, ...prev])
    } else {
      setDocuments((prev) => prev.map((d) => d.id === saved.id ? saved : d))
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FileText size={15} className="text-primary" />
            Document Request Types
          </h2>
          <Button
            size="sm"
            className="gap-1.5 h-9"
            onClick={() => setModal({ open: true, doc: null })}
          >
            <Plus size={13} /> Add Document Type
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search document name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8 h-9 text-sm"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <SelectTrigger className="h-9 text-sm w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" className="h-9 gap-1.5" onClick={handleSearch}>
            <Search size={13} /> Search
          </Button>
          <Button size="sm" variant="outline" className="h-9 gap-1.5" onClick={handleReset}>
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
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="py-14">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <FileText size={36} className="opacity-20" />
                    <p className="text-sm">No document request types found.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setModal({ open: true, doc: null })}
                    >
                      <Plus size={13} className="mr-1.5" /> Add your first document type
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{doc.description}</p>
                  </TableCell>
                  <TableCell className="text-sm">₱{doc.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Calendar size={12} className="text-muted-foreground" />
                      {doc.processing_days}d
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={doc.requires_appointment ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {doc.requires_appointment ? 'Required' : 'Not Required'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={doc.has_pdf_template ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {doc.has_pdf_template ? 'Available' : 'None'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={doc.is_active}
                      onCheckedChange={() => handleToggleActive(doc)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setModal({ open: true, doc })}
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteDialog({ open: true, doc })}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DocumentRequestModal
        open={modal.open}
        doc={modal.doc}
        onClose={() => setModal({ open: false, doc: null })}
        onSave={handleModalSave}
      />

      <DeleteConfirmation
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, doc: null })}
        onConfirm={handleDelete}
        data={deleteDialog.doc}
      />
    </div>
  )
}
