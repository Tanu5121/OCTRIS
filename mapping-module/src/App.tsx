import RiskMap from "./components/map/RiskMap";
import { deployments } from "./components/map/deploymentData";
import { locations } from "./components/map/locationsData";
import { useEffect, useState } from "react";
import { recommendedDeployment } from "./components/map/recommendedDeploymentData";
import type { PoliceUnit } from "./types/PoliceUnit";
function App() {
   const [policeUnits, setPoliceUnits] = useState<PoliceUnit[]>([]);

  const handleLocationSelect = (locationId: string) => {
    console.log("Selected location:", locationId);
    
  };

  useEffect(() => {
  const fetchPoliceUnits = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5002/api/police/units"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch police units");
      }

      const data = await response.json();

      const mappedUnits: PoliceUnit[] = data.units.map((unit: any) => ({
        id: unit.id,
        name: unit.unit_name,
        latitude: unit.latitude,
        longitude: unit.longitude,
        status: unit.status,
      }));

      setPoliceUnits(mappedUnits);
      console.log("POLICE UNITS RECEIVED:", mappedUnits);
    } catch (error) {
      console.error("Unable to load police units:", error);
    }
  };

  fetchPoliceUnits();
}, []);
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
      }}
    >
      <RiskMap
  riskLocations={locations}
  policeUnits={policeUnits}
  deployments={deployments}
  recommendedDeployment={recommendedDeployment}
  onLocationSelect={handleLocationSelect}
/>
    </div>
  );
}

export default App;