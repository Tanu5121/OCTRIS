import { Polyline } from "react-leaflet";

interface DeploymentLineProps {
  unitPosition: [number, number];
  locationPosition: [number, number];
}

function DeploymentLine({
  unitPosition,
  locationPosition,
}: DeploymentLineProps) {
  return (
    <Polyline
      positions={[
        unitPosition,
        locationPosition,
      ]}
      pathOptions={{
        color: "#2563eb",
        weight: 3,
        opacity: 0.7,
        dashArray: "8 6",
      }}
    />
  );
}

export default DeploymentLine;