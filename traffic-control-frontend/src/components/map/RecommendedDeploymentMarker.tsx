import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";

interface RecommendedDeploymentMarkerProps {
  position: [number, number];
  unitName: string;
  locationName: string;
}

function RecommendedDeploymentMarker({
  position,
  unitName,
  locationName,
}: RecommendedDeploymentMarkerProps) {
  const recommendationIcon = divIcon({
    className: "recommended-deployment-marker",
    html: `
      <div
        style="
          width: 34px;
          height: 34px;
          background: #f59e0b;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          font-size: 18px;
        "
        aria-label="Recommended deployment"
      >
        ★
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  return (
    <Marker
      position={position}
      icon={recommendationIcon}
    >
      <Popup>
        <strong>⭐ RECOMMENDED</strong>
        <br />
        Police Unit: {unitName}
        <br />
        Location: {locationName}
        <br />
        <strong>Recommendation only</strong>
      </Popup>
    </Marker>
  );
}

export default RecommendedDeploymentMarker;