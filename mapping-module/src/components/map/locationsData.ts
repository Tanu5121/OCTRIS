import type { RiskLocation } from "../../types/RiskLocation";

export const locations: RiskLocation[] = [
  {
    id: "loc_001",
    name: "Nagpur Central",
    latitude: 21.1458,
    longitude: 79.0882,
    risk_score: 87,
    risk_level: "RED",
    police_coverage: "UNMANNED",
  },
  {
    id: "loc_002",
    name: "Sitabuldi",
    latitude: 21.1497,
    longitude: 79.0882,
    risk_score: 64,
    risk_level: "YELLOW",
    police_coverage: "MANNED",
  },
  {
    id: "loc_003",
    name: "Wardha Road",
    latitude: 21.1200,
    longitude: 79.1000,
    risk_score: 32,
    risk_level: "GREEN",
    police_coverage: "MANNED",
  },
  {
    id: "loc_004",
    name: "Manish Nagar",
    latitude: 21.1098,
    longitude: 79.0736,
    risk_score: 91,
    risk_level: "RED",
    police_coverage: "UNMANNED",
  },
];