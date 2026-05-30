import { DocumentField } from '../_types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const FIELD_TYPE_COLORS: Record<string, string> = {
  text:     'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  textarea: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  number:   'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  email:    'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
  phone:    'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
  date:     'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800',
  select:   'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
  checkbox: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
  radio:    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  file:     'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
}

interface Props {
  field: DocumentField
  onEdit: (field: DocumentField) => void
  onDelete: (field: DocumentField) => void
  onToggleRequired: (field: DocumentField) => void
}

export default function FieldCard({ field, onEdit, onDelete, onToggleRequired }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 bg-card border border-border rounded-lg group transition-all',
        isDragging
          ? 'shadow-xl opacity-80 ring-2 ring-primary/30 z-50'
          : 'hover:border-primary/30 hover:shadow-sm'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing p-0.5 shrink-0 touch-none transition-colors"
        tabIndex={-1}
      >
        <GripVertical size={16} />
      </button>

      {/* Order badge */}
      <span className="text-[10px] font-mono text-muted-foreground w-5 shrink-0 text-center select-none">
        {field.sort_order + 1}
      </span>

      {/* Field info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-medium truncate">{field.field_label}</span>
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-1.5 py-0 h-4 border font-mono shrink-0',
              FIELD_TYPE_COLORS[field.field_type]
            )}
          >
            {field.field_type}
          </Badge>
          {field.is_required && (
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-destructive shrink-0">
              required
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono truncate">
          {field.field_name}
        </p>
        {field.placeholder && (
          <p className="text-[11px] text-muted-foreground/50 mt-0.5 truncate italic">
            "{field.placeholder}"
          </p>
        )}
        {field.select_options && field.select_options.length > 0 && (
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
            Options: {field.select_options.slice(0, 3).join(', ')}
            {field.select_options.length > 3 && ` +${field.select_options.length - 3} more`}
          </p>
        )}
      </div>

      {/* Required toggle */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-muted-foreground hidden md:block">Required</span>
        <Switch
          checked={field.is_required}
          onCheckedChange={() => onToggleRequired(field)}
          className="scale-75 origin-right"
        />
      </div>

      {/* Action buttons — reveal on hover */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => onEdit(field)}
        >
          <Pencil size={12} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(field)}
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  )
}
