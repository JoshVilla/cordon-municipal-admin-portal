import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'orange'
}

const colorMap = {
  blue:   { bg: 'bg-blue-50   dark:bg-blue-950',   icon: 'text-blue-700   dark:text-blue-400' },
  green:  { bg: 'bg-green-50  dark:bg-green-950',  icon: 'text-green-700  dark:text-green-400' },
  red:    { bg: 'bg-red-50    dark:bg-red-950',    icon: 'text-red-700    dark:text-red-400' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950', icon: 'text-yellow-700 dark:text-yellow-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950', icon: 'text-orange-700 dark:text-orange-400' },
}

const StatCard = ({ title, value, icon: Icon, color = 'blue' }: StatCardProps) => {
  const { bg, icon } = colorMap[color]
  return (
    <div className="flex items-center gap-4 bg-card border border-border rounded-2xl px-5 py-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={22} className={icon} />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-bold text-foreground leading-tight">{(value ?? 0).toLocaleString()}</p>
      </div>
    </div>
  )
}

export default StatCard