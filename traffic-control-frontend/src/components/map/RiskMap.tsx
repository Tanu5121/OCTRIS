import { useEffect, useState } from "react"
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { locations } from "./locationsData"
import { getPoliceUnits } from "../../services/api"
import type { PoliceUnit } from "../../services/api"
import {
  onPoliceUnitUpdated,
  onDeploymentUpdated,
} from "../../services/socket"

function getRiskColor(riskLevel: string) {
  if (riskLevel === "RED") {
    return "#ef4444"
  }

  if (riskLevel === "YELLOW") {
    return "#f59e0b"
  }

  return "#22c55e"
}

function getPoliceColor(status: string) {
  switch (status) {
    case "AVAILABLE":
      return "#22c55e"
    case "BUSY":
      return "#f59e0b"
    case "DEPLOYED":
      return "#3b82f6"
    case "OFFLINE":
      return "#ef4444"
    default:
      return "#94a3b8"
  }
}

function RiskMap() {
  const [filter, setFilter] = useState("ALL")
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  )
  const [policeUnits, setPoliceUnits] = useState<PoliceUnit[]>([])
  const [policeError, setPoliceError] = useState("")

  useEffect(() => {
    const loadPoliceUnits = async () => {
      try {
        const units = await getPoliceUnits()
        setPoliceUnits(units)
        setPoliceError("")
      } catch (error) {
        console.error(error)
        setPoliceError("Unable to load police units")
      }
    }

    loadPoliceUnits()

    const removePoliceListener = onPoliceUnitUpdated(
      (updatedUnit) => {
        setPoliceUnits((currentUnits) =>
          currentUnits.map((unit) =>
            unit.id === updatedUnit.id ? updatedUnit : unit
          )
        )
      }
    )

    const removeDeploymentListener = onDeploymentUpdated(
      (updatedUnit) => {
        setPoliceUnits((currentUnits) =>
          currentUnits.map((unit) =>
            unit.id === updatedUnit.id ? updatedUnit : unit
          )
        )
      }
    )

    return () => {
      removePoliceListener()
      removeDeploymentListener()
    }
  }, [])

  const filteredLocations = locations.filter((location) => {
    if (filter === "ALL") {
      return true
    }

    if (filter === "UNMANNED") {
      return location.police_coverage === "UNMANNED"
    }

    return location.risk_level === filter
  })

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg">
      {/* Filters */}
      <div className="absolute left-3 top-3 z-[1000] flex flex-wrap gap-2 rounded-lg bg-slate-900/95 p-2 shadow-lg">
        {["ALL", "RED", "YELLOW", "GREEN", "UNMANNED"].map(
          (option) => (
            <button
              key={option}
              onClick={() => {
                setFilter(option)
                setSelectedLocationId(null)
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                filter === option
                  ? "bg-orange-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {option}
            </button>
          )
        )}
      </div>

      {/* Selected Location */}
      {selectedLocationId && (
        <div className="absolute right-3 top-3 z-[1000] max-w-[220px] rounded-lg bg-slate-900/95 p-3 text-xs shadow-lg">
          {(() => {
            const selectedLocation = locations.find(
              (location) => location.id === selectedLocationId
            )

            if (!selectedLocation) {
              return null
            }

            return (
              <>
                <p className="font-semibold text-white">
                  Selected Location
                </p>

                <p className="mt-1 text-slate-300">
                  {selectedLocation.name}
                </p>

                <p className="mt-1 text-slate-400">
                  Risk: {selectedLocation.risk_score} (
                  {selectedLocation.risk_level})
                </p>

                <button
                  onClick={() => setSelectedLocationId(null)}
                  className="mt-2 rounded-md bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700"
                >
                  Clear
                </button>
              </>
            )
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-[1000] rounded-lg bg-slate-900/95 p-3 text-xs shadow-lg">
        <p className="mb-2 font-semibold text-white">
          Map Legend
        </p>

        <p className="mb-1 font-medium text-slate-400">
          Risk
        </p>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            RED
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            YELLOW
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            GREEN
          </div>
        </div>

        <p className="mb-2 mt-3 font-medium text-slate-400">
          Police
        </p>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-3 w-3 rounded-full bg-blue-500" />
            DEPLOYED
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            AVAILABLE
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            BUSY
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            OFFLINE
          </div>
        </div>
      </div>

      {/* Backend Error */}
      {policeError && (
        <div className="absolute bottom-3 left-3 z-[1000] rounded-md bg-red-500/90 px-3 py-2 text-xs text-white">
          {policeError}
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={[21.1458, 79.0882]}
        zoom={12}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Traffic Risk Locations */}
        {filteredLocations.map((location) => {
          const isSelected = location.id === selectedLocationId

          return (
            <CircleMarker
              key={location.id}
              center={[
                location.latitude,
                location.longitude,
              ]}
              radius={isSelected ? 15 : 10}
              pathOptions={{
                color: isSelected
                  ? "#ffffff"
                  : getRiskColor(location.risk_level),
                fillColor: getRiskColor(location.risk_level),
                fillOpacity: isSelected ? 1 : 0.8,
                weight: isSelected ? 4 : 2,
              }}
              eventHandlers={{
                click: () => {
                  setSelectedLocationId(location.id)
                },
              }}
            >
              <Popup>
                <div>
                  <strong>{location.name}</strong>
                  <br />
                  Risk Score: {location.risk_score}
                  <br />
                  Risk Level: {location.risk_level}
                  <br />
                  Congestion: {location.congestion_level}
                  <br />
                  Police Coverage:{" "}
                  {location.police_coverage}
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

        {/* Police Units */}
        {policeUnits.map((unit) => (
          <CircleMarker
            key={`police-${unit.id}`}
            center={[
              unit.latitude,
              unit.longitude,
            ]}
            radius={7}
            pathOptions={{
              color: getPoliceColor(unit.status),
              fillColor: getPoliceColor(unit.status),
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Popup>
              <div>
                <strong>{unit.unit_name}</strong>
                <br />
                Status: {unit.status}
                <br />
                Assigned:{" "}
                {unit.assigned_location_id
                  ? unit.assigned_location_id
                  : "None"}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

export default RiskMap