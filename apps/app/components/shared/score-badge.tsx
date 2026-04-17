import { cn } from "@/lib/utils"

interface ScoreBadgeProps {
  score: number
  size?: "sm" | "md" | "lg"
  isDrift?: boolean
  className?: string
}

function getScoreColor(score: number, isDrift = false) {
  if (isDrift) {
    // For drift score, lower is better
    if (score <= 20) return "text-success bg-success/10"
    if (score <= 40) return "text-warning bg-warning/10"
    return "text-destructive bg-destructive/10"
  }
  if (score >= 75) return "text-success bg-success/10"
  if (score >= 50) return "text-warning bg-warning/10"
  return "text-destructive bg-destructive/10"
}

export function ScoreBadge({ score, size = "md", isDrift = false, className }: ScoreBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded font-mono font-semibold tabular-nums",
        size === "sm" && "text-[11px] px-1.5 py-0.5",
        size === "md" && "text-xs px-2 py-1",
        size === "lg" && "text-sm px-2.5 py-1",
        getScoreColor(score, isDrift),
        className
      )}
    >
      {score}
    </span>
  )
}

export function ScoreBar({
  score,
  isDrift = false,
  className,
}: {
  score: number
  isDrift?: boolean
  className?: string
}) {
  let barColor = "bg-success"
  if (isDrift) {
    barColor = score <= 20 ? "bg-success" : score <= 40 ? "bg-warning" : "bg-destructive"
  } else {
    barColor = score >= 75 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-destructive"
  }

  return (
    <div className={cn("h-1.5 w-full rounded-full bg-muted overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all", barColor)}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}
