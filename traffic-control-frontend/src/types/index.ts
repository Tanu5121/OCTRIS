export interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  risk_score: number
  risk_level: "GREEN" | "YELLOW" | "RED"
  congestion_level: string
  police_coverage: "MANNED" | "UNMANNED"
  updated_at: string
}

export interface PoliceUnit {
  id: string
  unit_name: string
  status: "AVAILABLE" | "DEPLOYED" | "BUSY" | "OFFLINE"
  latitude: number
  longitude: number
  assigned_location_id: string | null
}

export interface Recommendation {
  id: string
  location_id: string
  recommended_unit_id: string | null
  reason: string
  status: "PENDING" | "ACCEPTED" | "MODIFIED" | "REJECTED"
}