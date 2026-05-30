"use client"

import { useState } from 'react'
import Container from '@/components/container'
import TitlePage from '@/components/titlePage'
import { cn } from '@/lib/utils'
import { Wrench, Eye, Layers } from 'lucide-react'
import DocumentTypeList from './_components/DocumentTypeList'
import FieldBuilder from './_components/FieldBuilder'
import FormPreview from './_components/FormPreview'
import { DocumentType, DocumentField } from './_types'

type ViewTab = 'builder' | 'preview'

const Page = () => {
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null)
  const [fields, setFields] = useState<DocumentField[]>([])
  const [activeTab, setActiveTab] = useState<ViewTab>('builder')

  const handleSelectType = (type: DocumentType) => {
    setSelectedType(type)
    setFields([])
    setActiveTab('builder')
  }

  return (
    <Container>
      <TitlePage
        title="Document Form Builder"
        description="Dynamically configure form fields for each document request type"
      />

      <div className="flex gap-4" style={{ height: 'calc(100vh - 200px)', minHeight: 600 }}>

        {/* ── Left: Document type list ─────────────────── */}
        <DocumentTypeList selected={selectedType} onSelect={handleSelectType} />

        {/* ── Right: Builder / Preview ─────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedType ? (
            <>
              {/* Tab strip */}
              <div className="flex gap-0 border-b border-border mb-4 shrink-0">
                <TabButton
                  active={activeTab === 'builder'}
                  onClick={() => setActiveTab('builder')}
                  icon={<Wrench size={13} />}
                  label="Field Builder"
                  count={fields.length}
                />
                <TabButton
                  active={activeTab === 'preview'}
                  onClick={() => setActiveTab('preview')}
                  icon={<Eye size={13} />}
                  label="Live Preview"
                />
              </div>

              {/* Panel */}
              <div className="flex-1 min-h-0">
                {activeTab === 'builder' ? (
                  <FieldBuilder
                    documentType={selectedType}
                    fields={fields}
                    onFieldsChange={setFields}
                  />
                ) : (
                  <FormPreview documentType={selectedType} fields={fields} />
                )}
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </Container>
  )
}

export default Page

/* ── Tab button ───────────────────────────────────────────────── */

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            'text-[10px] px-1.5 py-0 rounded-full font-mono min-w-[18px] text-center leading-[18px]',
            active
              ? 'bg-primary/15 text-primary'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

/* ── Empty state (no type selected) ──────────────────────────── */

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-card border border-border rounded-lg text-muted-foreground">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 mb-4">
        <Layers size={28} className="text-primary/40" />
      </div>
      <p className="text-sm font-medium text-foreground">Select a document type</p>
      <p className="text-xs mt-1.5 text-center max-w-[280px] leading-relaxed">
        Choose a document type from the left panel to start configuring its form fields.
      </p>
    </div>
  )
}
