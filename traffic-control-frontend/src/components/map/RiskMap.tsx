import { useEffect, useState } from "react"

import {
  MapContainer,
  TileLayer,
} from "react-leaflet"

import "leaflet/dist/leaflet.css"

import { locations } from "./locationsData"

import RiskMarker from "./RiskMarker"
import PoliceMarker from "./PoliceMarker"
import MapControls from "./MapControls"
import MapLegend from "./MapLegend"

import { getPoliceUnits } from "../../services/api"
import type { PoliceUnit } from "../../services/api"

import {
  onPoliceUnitUpdated,
  onDeploymentUpdated,
} from "../../services/socket"


function RiskMap() {

  // ==================================================
  // POLICE UNITS
  // ==================================================

  const [policeUnits, setPoliceUnits] =
    useState<PoliceUnit[]>([])

  const [policeError, setPoliceError] =
    useState("")


  // ==================================================
  // MAP CONTROLS
  // ==================================================

  const [riskFilter, setRiskFilter] =
    useState<
      "ALL" | "RED" | "YELLOW" | "GREEN"
    >("ALL")

  const [showPolice, setShowPolice] =
    useState(true)

  const [showUnmanned, setShowUnmanned] =
    useState(true)


  // ==================================================
  // SELECTED LOCATION
  // ==================================================

  const [selectedLocationId, setSelectedLocationId] =
    useState<string | null>(null)


  // ==================================================
  // LOAD POLICE UNITS
  // ==================================================

  useEffect(() => {

    const loadPoliceUnits =
      async () => {

        try {

          const units =
            await getPoliceUnits()

          setPoliceUnits(units)

          setPoliceError("")

          console.log(
            "POLICE UNITS:",
            units
          )

        } catch (error) {

          console.error(
            "Unable to load police units:",
            error
          )

          setPoliceError(
            "Unable to load police units"
          )

        }

      }


    loadPoliceUnits()


    // ==================================================
    // LIVE POLICE UPDATE
    // ==================================================

    const removePoliceListener =
      onPoliceUnitUpdated(
        (updatedUnit) => {

          setPoliceUnits(
            (currentUnits) =>
              currentUnits.map(
                (unit) =>
                  unit.id === updatedUnit.id
                    ? updatedUnit
                    : unit
              )
          )

        }
      )


    // ==================================================
    // LIVE DEPLOYMENT UPDATE
    // ==================================================

    const removeDeploymentListener =
      onDeploymentUpdated(
        (updatedUnit) => {

          setPoliceUnits(
            (currentUnits) =>
              currentUnits.map(
                (unit) =>
                  unit.id === updatedUnit.id
                    ? updatedUnit
                    : unit
              )
          )

        }
      )


    return () => {

      removePoliceListener()

      removeDeploymentListener()

    }

  }, [])


  // ==================================================
  // LOCATION SELECTION
  // ==================================================

  const handleLocationSelect =
    (locationId: string) => {

      setSelectedLocationId(
        locationId
      )

      console.log(
        "Selected location:",
        locationId
      )

    }


  // ==================================================
  // FILTER RISK LOCATIONS
  // ==================================================

  const visibleLocations =
    locations.filter(
      (location) => {

        const matchesRisk =
          riskFilter === "ALL" ||
          location.risk_level === riskFilter


        const matchesUnmanned =
          showUnmanned ||
          location.police_coverage !==
            "UNMANNED"


        return (
          matchesRisk &&
          matchesUnmanned
        )

      }
    )


  // ==================================================
  // MAP
  // ==================================================

  return (

    <div
      style={{
        position: "relative",
        height: "420%",
        width: "100%",
      }}
    >

      <MapContainer

        center={[
          21.1458,
          79.0882,
        ]}

        zoom={12}

        style={{
          height: "100%",
          width: "100%",
        }}

      >

        {/* ==========================================
            OPEN STREET MAP
        ========================================== */}

        <TileLayer

          attribution="&copy; OpenStreetMap contributors"

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

        />


        {/* ==========================================
            RISK LOCATIONS
        ========================================== */}

        {visibleLocations.map(
          (location) => (

            <RiskMarker

              key={location.id}

              position={[
                location.latitude,
                location.longitude,
              ]}

              name={location.name}

              riskLevel={
                location.risk_level
              }

              riskScore={
                location.risk_score
              }

              policeCoverage={
                location.police_coverage
              }

              onSelect={() =>
                handleLocationSelect(
                  location.id
                )
              }

            />

          )
        )}


        {/* ==========================================
            POLICE UNITS
        ========================================== */}

        {showPolice &&
          policeUnits.map(
            (unit) => (

              <PoliceMarker

                key={unit.id}

                position={[
                  unit.latitude,
                  unit.longitude,
                ]}

                name={
                  unit.unit_name
                }

                status={
                  unit.status
                }

              />

            )
          )}


        {/* ==========================================
            MAP CONTROLS
        ========================================== */}

        <MapControls

          riskFilter={
            riskFilter
          }

          showPolice={
            showPolice
          }

          showUnmanned={
            showUnmanned
          }

          onRiskFilterChange={
            setRiskFilter
          }

          onShowPoliceChange={
            setShowPolice
          }

          onShowUnmannedChange={
            setShowUnmanned
          }

        />


        {/* ==========================================
            MAP LEGEND
        ========================================== */}

        <MapLegend />

      </MapContainer>


      {/* ============================================
          BACKEND ERROR
      ============================================ */}

      {policeError && (

        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            zIndex: 2000,
            background: "#dc2626",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
          }}
        >

          {policeError}

        </div>

      )}


      {/* ============================================
          SELECTED LOCATION
      ============================================ */}

      {selectedLocationId && (

        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 2000,
            background: "#0f172a",
            color: "white",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "12px",
            minWidth: "180px",
          }}
        >

          {(() => {

            const selectedLocation =
              locations.find(
                (location) =>
                  location.id ===
                  selectedLocationId
              )


            if (!selectedLocation) {
              return null
            }


            return (

              <>

                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  Selected Location
                </div>

                <div>
                  {selectedLocation.name}
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    color: "#cbd5e1",
                  }}
                >
                  Risk Score:{" "}
                  {
                    selectedLocation.risk_score
                  }
                </div>

                <div
                  style={{
                    color: "#cbd5e1",
                  }}
                >
                  Risk Level:{" "}
                  {
                    selectedLocation.risk_level
                  }
                </div>

                <button
                  onClick={() =>
                    setSelectedLocationId(
                      null
                    )
                  }
                  style={{
                    marginTop: "8px",
                    background: "#334155",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "5px 8px",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>

              </>

            )

          })()}

        </div>

      )}

    </div>

  )
}

export default RiskMap
