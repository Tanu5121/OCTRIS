import { useEffect, useState } from "react";
import DeploymentLine from "./DeploymentLine";
import type { Deployment } from "../../types/Deployment";
import {
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import RecommendedDeploymentMarker from "./RecommendedDeploymentMarker";
import type { RecommendedDeployment } from "../../types/RecommendedDeployment";
import RiskMarker from "./RiskMarker";
import MapLegend from "./MapLegend";
import PoliceMarker from "./PoliceMarker";
import MapControls from "./MapControls";

import type { RiskLocation } from "../../types/RiskLocation";
import type { PoliceUnit } from "../../types/PoliceUnit";

type MapStatus =
  | "READY"
  | "LOADING"
  | "EMPTY"
  | "ERROR"
  | "RECONNECTING";

interface RiskMapProps {
  riskLocations: RiskLocation[];
  policeUnits: PoliceUnit[];
  deployments?: Deployment[];

  recommendedDeployment?: RecommendedDeployment;

  onLocationSelect: (locationId: string) => void;

  centerOnLocation?: string | null;

  mapStatus?: MapStatus;
}


function MapCenterController({
  locationId,
  locations,
}: {
  locationId?: string | null;
  locations: RiskLocation[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!locationId) {
      return;
    }

    const location = locations.find(
      (item) => item.id === locationId
    );

    if (location) {
      map.flyTo(
        [location.latitude, location.longitude],
        15
      );
    }
  }, [locationId, locations, map]);

  return null;
}


function MapStatusMessage({
  status,
}: {
  status: MapStatus;
}) {
  if (status === "READY") {
    return null;
  }

  let message = "";

  if (status === "LOADING") {
    message = "Map loading...";
  } else if (status === "EMPTY") {
    message = "No monitored locations.";
  } else if (status === "ERROR") {
    message = "Unable to load map data.";
  } else if (status === "RECONNECTING") {
    message = "Waiting for live updates...";
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        padding: "16px 24px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.25)",
        zIndex: 2000,
        fontWeight: 600,
        textAlign: "center",
        minWidth: "220px",
      }}
    >
      {message}
    </div>
  );
}

 function RiskMap({
  riskLocations,
  policeUnits,
  deployments = [],
  recommendedDeployment,
  onLocationSelect,
  centerOnLocation,
  mapStatus = "READY",
}: RiskMapProps) {
  const [showPolice, setShowPolice] =
    useState(true);

  const [riskFilter, setRiskFilter] = useState<
    "ALL" | "RED" | "YELLOW" | "GREEN"
  >("ALL");

  const [showUnmanned, setShowUnmanned] =
    useState(true);

  const [selectedLocationId, setSelectedLocationId] =
    useState<string | null>(null);

  const handleLocationSelect = (
    locationId: string
  ) => {
    setSelectedLocationId(locationId);

    onLocationSelect(locationId);
  };

  
  const effectiveStatus =
    mapStatus === "READY" &&
    riskLocations.length === 0
      ? "EMPTY"
      : mapStatus;

  const visibleLocations =
    riskLocations.filter((location) => {
      const matchesRisk =
        riskFilter === "ALL" ||
        location.risk_level === riskFilter;

      const matchesUnmanned =
        showUnmanned ||
        location.police_coverage !== "UNMANNED";

      return matchesRisk && matchesUnmanned;
    });

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
      }}
    >
      <MapContainer
        center={[21.1458, 79.0882]}
        zoom={12}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterController
          locationId={
            centerOnLocation ??
            selectedLocationId
          }
          locations={riskLocations}
        />

        {visibleLocations.map((location) => (
          <RiskMarker
            key={location.id}
            position={[
              location.latitude,
              location.longitude,
            ]}
            name={location.name}
            riskLevel={location.risk_level}
            riskScore={location.risk_score}
            policeCoverage={
              location.police_coverage
            }
            onSelect={() =>
              handleLocationSelect(
                location.id
              )
            }
          />
        ))}
        {deployments.map((deployment) => {
  const unit = policeUnits.find(
    (item) => item.id === deployment.unit_id
  );

  const location = riskLocations.find(
    (item) => item.id === deployment.location_id
  );

  if (!unit || !location) {
    return null;
  }

  return (
    <DeploymentLine
      key={`${deployment.unit_id}-${deployment.location_id}`}
      unitPosition={[
        unit.latitude,
        unit.longitude,
      ]}
      locationPosition={[
        location.latitude,
        location.longitude,
      ]}
    />
  );
})}
{recommendedDeployment && (() => {
  const unit = policeUnits.find(
    (item) =>
      item.id ===
      recommendedDeployment.recommended_unit_id
  );

  const location = riskLocations.find(
    (item) =>
      item.id ===
      recommendedDeployment.recommended_location_id
  );

  if (!unit || !location) {
    return null;
  }

  return (
    <RecommendedDeploymentMarker
      position={[
        location.latitude,
        location.longitude,
      ]}
      unitName={unit.name}
      locationName={location.name}
    />
  );
})()}

        {showPolice &&
          policeUnits.map((unit) => (
            <PoliceMarker
              key={unit.id}
              position={[
                unit.latitude,
                unit.longitude,
              ]}
              name={unit.name}
              status={unit.status}
            />
          ))}

        <MapControls
          riskFilter={riskFilter}
          showPolice={showPolice}
          showUnmanned={showUnmanned}
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

        <MapLegend />
      </MapContainer>

      <MapStatusMessage
        status={effectiveStatus}
      />
    </div>
  );
}

export default RiskMap;