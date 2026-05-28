import type { AccountStatus } from "@/types"

export const STATUS_LABELS: Record<AccountStatus, string> = {
  cold: "Cold",
  touched: "Touched",
  engaged: "Engaged",
  booked: "Booked",
  qualified: "Qualified",
  pipeline: "Pipeline",
  closed_lost: "Closed Lost",
}

// Badge classes: bg + text, meant for use with cn()
export const STATUS_COLORS: Record<AccountStatus, string> = {
  cold: "bg-slate-100 text-slate-600",
  touched: "bg-blue-50 text-blue-700",
  engaged: "bg-amber-50 text-amber-700",
  booked: "bg-indigo-50 text-indigo-700",
  qualified: "bg-purple-50 text-purple-700",
  pipeline: "bg-green-50 text-green-700",
  closed_lost: "bg-red-50 text-red-600",
}

// Display order — progression through funnel
export const STATUS_ORDER: AccountStatus[] = [
  "cold",
  "touched",
  "engaged",
  "booked",
  "qualified",
  "pipeline",
  "closed_lost",
]

/** heat_score thresholds */
export function heatLabel(heatScore: number): "hot" | "warm" | "cold" {
  if (heatScore >= 60) return "hot"
  if (heatScore >= 25) return "warm"
  return "cold"
}

export const HEAT_DOT: Record<"hot" | "warm" | "cold", string> = {
  hot: "bg-red-500",
  warm: "bg-amber-500",
  cold: "bg-slate-400",
}

export const HEAT_LABEL: Record<"hot" | "warm" | "cold", string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
}
