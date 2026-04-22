import { mockAccountPatterns, mockReps } from "@/lib/mock-data"
import { PatternsClient } from "./patterns-client"

export const dynamic = "force-dynamic"

export default async function PatternsPage() {
  // Use mock data - in production this would come from Supabase
  const patterns = mockAccountPatterns
  const reps = mockReps

  return <PatternsClient patterns={patterns} reps={reps} />
}
