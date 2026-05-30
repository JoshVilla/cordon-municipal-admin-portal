"use client"

import { useState } from 'react'
import Container from '@/components/container'
import TitlePage from '@/components/titlePage'
import { cn } from '@/lib/utils'
import { Settings2, FileText } from 'lucide-react'
import GeneralSettingsTab from './_components/GeneralSettingsTab'
import DocumentRequestsTab from './_components/DocumentRequestsTab'

type Tab = 'general' | 'documents'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'general',   label: 'General Settings',   icon: <Settings2 size={14} /> },
  { id: 'documents', label: 'Document Requests', icon: <FileText size={14} /> },
]

const Page = () => {
  const [active, setActive] = useState<Tab>('general')

  return (
    <Container>
      <TitlePage
        title="Settings"
        description="Manage portal configuration and document request types"
      />

      <div className="flex gap-0 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              active === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'general'   && <GeneralSettingsTab />}
      {active === 'documents' && <DocumentRequestsTab />}
    </Container>
  )
}

export default Page
