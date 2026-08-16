export type PoliceStatus =
  | "AVAILABLE"
  | "DEPLOYED"
  | "BUSY"
  | "OFFLINE";

export interface PoliceUnit {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: PoliceStatus;
}