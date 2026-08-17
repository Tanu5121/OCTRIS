const API_BASE_URL = "http://localhost:5002"

// ─────────────────────────────────────────────
// Police Units
// ─────────────────────────────────────────────

export interface PoliceUnit {
  id: string
  unit_name: string
  status: "AVAILABLE" | "BUSY" | "DEPLOYED" | "OFFLINE"
  latitude: number
  longitude: number
  assigned_location_id: string | null
}

interface PoliceUnitsResponse {
  success: boolean
  units: PoliceUnit[]
}

export async function getPoliceUnits(): Promise<PoliceUnit[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/police/units`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch police units")
  }

  const data: PoliceUnitsResponse = await response.json()

  if (!data.success) {
    throw new Error("Police units request failed")
  }

  return data.units
}

// ─────────────────────────────────────────────
// Deployment Recommendation
// ─────────────────────────────────────────────

export interface DeploymentRecommendation {
  id: string
  location_id: string
  recommended_unit_id: string
  reason: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
}

interface RecommendationResponse {
  success: boolean
  recommendation?: DeploymentRecommendation
  reason?: string
}

export async function getDeploymentRecommendation(
  locationId: string
): Promise<DeploymentRecommendation> {
  const response = await fetch(
    `${API_BASE_URL}/api/deployment/recommend/${locationId}`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch deployment recommendation")
  }

  const data: RecommendationResponse = await response.json()

  if (!data.success || !data.recommendation) {
    throw new Error(
      data.reason || "No deployment recommendation available"
    )
  }

  return data.recommendation
}

export async function acceptDeployment(
  recommendationId: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/deployment/accept`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recommendation_id: recommendationId,
      }),
    }
  )

  if (!response.ok) {
    throw new Error("Failed to accept deployment")
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(
      data.reason || "Unable to accept deployment"
    )
  }

  return data
}