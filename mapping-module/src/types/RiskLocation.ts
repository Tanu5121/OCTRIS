export type RiskLevel = "GREEN" | "YELLOW" | "RED";

export type PoliceCoverage = "MANNED" | "UNMANNED";

export interface RiskLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  risk_level: RiskLevel;
  police_coverage: PoliceCoverage;
}