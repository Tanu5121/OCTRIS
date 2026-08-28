import { Marker, Popup } from "react-leaflet"
import { divIcon } from "leaflet"

interface PoliceMarkerProps {
  position: [number, number]
  name: string
  status: "AVAILABLE" | "DEPLOYED" | "BUSY" | "OFFLINE"
}

function getStatusColor(
  status: PoliceMarkerProps["status"]
) {
  switch (status) {
    case "AVAILABLE":
      return "#22c55e" // Green

    case "DEPLOYED":
      return "#2563eb" // Blue

    case "BUSY":
      return "#facc15" // Yellow

    case "OFFLINE":
      return "#dc2626" // Red

    default:
      return "#64748b" // Grey
  }
}

function PoliceMarker({
  position,
  name,
  status,
}: PoliceMarkerProps) {
  const statusColor = getStatusColor(status)

  const policeIcon = divIcon({
    className: "police-marker-icon",

    html: `
      <div
        style="
          width: 34px;
          height: 34px;
          background: ${statusColor};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          font-size: 17px;
          font-family: Arial, sans-serif;
        "
        aria-label="Police ${name} ${status}"
      >
        👮
      </div>
    `,

    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  })

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
        Status:{" "}
        <strong
          style={{
            color: statusColor,
          }}
        >
          {status}
        </strong>
      </Popup>
    </Marker>
  )
}

export default PoliceMarker