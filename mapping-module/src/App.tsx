import RiskMap from "./components/map/RiskMap";
import { deployments } from "./components/map/deploymentData";
import { locations } from "./components/map/locationsData";
import { policeUnits } from "./components/map/policeData";
import { recommendedDeployment } from "./components/map/recommendedDeploymentData";
function App() {
  const handleLocationSelect = (locationId: string) => {
    console.log("Selected location:", locationId);
  };

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