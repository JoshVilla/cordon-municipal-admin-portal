"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a ChartContainer")
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.color)
  if (!colorConfig.length) return null
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .filter(([, cfg]) => cfg.color)
          .map(([key, cfg]) => `[data-chart=${id}] { --color-${key}: ${cfg.color}; }`)
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: any[]
    label?: any
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(({ active, payload, className, indicator = "dot", hideLabel = false, hideIndicator = false, label, labelKey, nameKey }, ref) => {
  const { config } = useChart()

  if (!active || !payload?.length) return null

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!hideLabel && label && (
        <div className="font-medium">{label}</div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item: any, index: number) => {
          const key = nameKey || item.name || item.dataKey || "value"
          const itemConfig = config[key as keyof typeof config]
          return (
            <div key={index} className="flex items-center gap-2">
              {!hideIndicator && (
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color || itemConfig?.color }}
                />
              )}
              <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
              <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                {item.value?.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: Array<{ value: string; color: string }>
    nameKey?: string
  }
>(({ className, payload, nameKey }, ref) => {
  const { config } = useChart()
  if (!payload?.length) return null
  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-4 pt-3 text-xs", className)}>
      {payload.map((item) => {
        const key = nameKey || item.value
        const itemConfig = config[key as keyof typeof config]
        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <div className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
            {itemConfig?.label || item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
