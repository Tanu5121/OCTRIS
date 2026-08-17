import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";

interface RiskMarkerProps {
  position: [number, number];
  name: string;
  riskLevel: string;
  riskScore: number;
  policeCoverage: string;
  onSelect?: () => void;
}

function RiskMarker({
  position,
  name,
  riskLevel,
  riskScore,
  policeCoverage,
  onSelect,
}: RiskMarkerProps) {
  let markerColor = "#22c55e";

  if (riskLevel === "RED") {
    markerColor = "#ef4444";
  } else if (riskLevel === "YELLOW") {
    markerColor = "#eab308";
  }

  const riskIcon = divIcon({
    className: "risk-marker-icon",
    html: `
      <div
        style="
          width: 24px;
          height: 24px;
          background: ${markerColor};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: white;
        "
        aria-label="Risk ${riskLevel}"
      >
        !
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  return (
    <Marker
  position={position}
  icon={riskIcon}
  zIndexOffset={1000}
  riseOnHover={true}
  eventHandlers={{
    click: () => {
      onSelect?.();
    },
  }}
>
      <Popup>
        <strong>Traffic Risk Location</strong>
        <br />
        {name}
        <br />
        Risk Level: {riskLevel}
        <br />
        Risk Score: {riskScore}
        <br />
        Police Coverage: {policeCoverage}
      </Popup>
    </Marker>
  );
}

export default RiskMarker;