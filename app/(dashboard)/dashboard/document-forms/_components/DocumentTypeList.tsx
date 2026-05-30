"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { showToast, cn } from '@/lib/utils'
import { DocumentType } from '../_types'
import { Search, FileText, ChevronRight } from 'lucide-react'

interface Props {
  selected: DocumentType | null
  onSelect: (type: DocumentType) => void
}

export default function DocumentTypeList({ selected, onSelect }: Props) {
  const [types, setTypes] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchTypes()
  }, [])

  const fetchTypes = async (s = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (s) params.set('search', s)
      const res = await fetch(`/api/document-forms?${params}`)
      if (!res.ok) throw new Error('Failed to fetch.')
      const { data } = await res.json()
      setTypes(data ?? [])
    } catch {
      showToast.error('Failed to load document types.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = types.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-72 flex flex-col bg-card border border-border rounded-lg overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h2 className="text-sm font-semibold mb-2.5 flex items-center gap-1.5">
          <FileText size={14} className="text-primary" />
          Document Types
        </h2>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-md" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText size={28} className="mx-auto mb-2 opacity-20" />
            <p className="text-xs">No document types found.</p>
            <p className="text-[11px] mt-1 opacity-70">
              Add types in Settings → Document Requests.
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filtered.map((type) => (
              <button
                key={type.id}
                onClick={() => onSelect(type)}
                className={cn(
                  'w-full text-left rounded-md px-3 py-2.5 transition-colors',
                  selected?.id === type.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent text-foreground'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate leading-tight">{type.name}</p>
                    {type.description && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {type.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!type.is_active && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                        Inactive
                      </Badge>
                    )}
                    <ChevronRight
                      size={13}
                      className={cn(
                        'transition-transform shrink-0',
                        selected?.id === type.id
                          ? 'text-primary translate-x-0.5'
                          : 'text-muted-foreground'
                      )}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer count */}
      <div className="px-3 py-2 border-t border-border bg-muted/30">
        <p className="text-[10px] text-muted-foreground">
          {types.length} type{types.length !== 1 ? 's' : ''} total
        </p>
      </div>
    </div>
  )
}
