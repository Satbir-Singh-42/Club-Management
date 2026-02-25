import { cn } from "@/lib/utils"
import { TypeIcon as type, LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  className?: string
}

export function StatsCard({ title, value, icon: Icon, className }: StatsCardProps) {
  return (
    <div className={cn("flex items-center gap-4 rounded-lg p-6 shadow-md", className)}>
      <div className="rounded-full bg-white p-2">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </div>
    </div>
  )
}