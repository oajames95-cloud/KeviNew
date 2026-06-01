// ============================================================
// lib/hubspot/client.ts
// Thin server-side HubSpot client. Uses a PRIVATE APP access token
// (process.env.HUBSPOT_TOKEN, the `pat-...` value — NOT an OAuth client secret).
// Host is api.hubapi.com for all regions; HubSpot routes by token region, so an
// eu1 token works against the same host.
//
// API version: CRM v3 search endpoints. These are stable and verified working
// against the live portal. HubSpot's newer date-versioned APIs (2026-03) can be
// swapped in later by changing BASE — the search request/response shape is the
// same. Kept on v3 deliberately because it's proven against this account.
// ============================================================

const BASE = 'https://api.hubapi.com'

function token(): string {
  const t = process.env.HUBSPOT_TOKEN
  if (!t) throw new Error('HUBSPOT_TOKEN is not set')
  return t
}

export interface HubSpotSearchFilter {
  propertyName: string
  operator: string // EQ, GTE, LTE, LT, GT, IN, etc.
  value?: string
  values?: string[]
}

export interface HubSpotRecord {
  id: string
  properties: Record<string, string | null>
}

// POST /crm/v3/objects/{objectType}/search — paginated, returns up to `limit`
// per page. We page through `after` until exhausted (capped to avoid runaway).
export async function searchObjects(
  objectType: 'deals' | 'meetings' | 'emails',
  filters: HubSpotSearchFilter[],
  properties: string[]
): Promise<HubSpotRecord[]> {
  const out: HubSpotRecord[] = []
  let after: string | undefined = undefined
  let pages = 0

  do {
    const body: Record<string, unknown> = {
      filterGroups: [{ filters }],
      properties,
      limit: 100,
    }
    if (after) body.after = after

    const res = await fetch(`${BASE}/crm/v3/objects/${objectType}/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`HubSpot ${objectType} search ${res.status}: ${text.slice(0, 300)}`)
    }

    const data = await res.json()
    for (const r of data.results || []) {
      out.push({ id: r.id, properties: r.properties || {} })
    }
    after = data.paging?.next?.after
    pages++
  } while (after && pages < 10)

  return out
}
