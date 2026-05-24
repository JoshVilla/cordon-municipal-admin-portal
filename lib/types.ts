export interface ActionItemProps {
    icon: React.ReactNode
    label: string
    onClick: (data?: any) => void
    hasPermission?: boolean
}
