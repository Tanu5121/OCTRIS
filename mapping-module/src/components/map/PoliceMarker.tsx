import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";

interface PoliceMarkerProps {
  position: [number, number];
  name: string;
  status: string;
}

function PoliceMarker({
  position,
  name,
  status,
}: PoliceMarkerProps) {
  let statusColor = "#22c55e";

  if (status === "DEPLOYED") {
    statusColor = "#f97316";
  } else if (status === "BUSY") {
    statusColor = "#ef4444";
  }
  else if (status === "OFFLINE") {
  statusColor = "#6b7280"; 
}

  const policeIcon = divIcon({
    className: "police-marker-icon",
    html: `
      <div
        style="
          width: 30px;
          height: 30px;
          background: ${statusColor};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          font-size: 16px;
        "
         aria-label="Police ${status}"
      >
        👮
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  return (
     
  <Marker
    position={position}
    icon={policeIcon}
    zIndexOffset={2000}
    riseOnHover={true}
  >
    <Popup>
      <strong>Police Unit {name}</strong>
      <br />
      Status: {status}
    </Popup>
  </Marker>
);
  
}

export default PoliceMarker;