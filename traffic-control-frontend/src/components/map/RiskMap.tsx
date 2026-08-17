import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { locations } from "./locationsData"

function getRiskColor(riskLevel: string) {
  if (riskLevel === "RED") {
    return "#ef4444"
  }

  if (riskLevel === "YELLOW") {
    return "#f59e0b"
  }

  return "#22c55e"
}

function RiskMap() {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-lg">
      <MapContainer
        center={[21.1458, 79.0882]}
        zoom={12}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => (
          <CircleMarker
            key={location.id}
            center={[location.latitude, location.longitude]}
            radius={10}
            pathOptions={{
              color: getRiskColor(location.risk_level),
              fillColor: getRiskColor(location.risk_level),
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div>
                <strong>{location.name}</strong>
                <br />
                Risk Score: {location.risk_score}
                <br />
                Risk Level: {location.risk_level}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

export default RiskMap