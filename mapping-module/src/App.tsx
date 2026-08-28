import RiskMap from "./components/map/RiskMap";
import { deployments } from "./components/map/deploymentData";
import { locations } from "./components/map/locationsData";
import { useEffect, useState } from "react";

import type { PoliceUnit } from "./types/PoliceUnit";
import type { RecommendedDeployment } from "./types/RecommendedDeployment";


// ==================================================
// AISHAWARYA RESPONSE TYPE
// ==================================================

interface AishwaryaUploadResponse {
  location: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  };

  risk_result: {
    risk_score: number;
    risk_level: "HIGH" | "MEDIUM" | "LOW";
  };
}


// ==================================================
// AISHAWARYA LOCATION → MAP LOCATION
// ==================================================

const aishwaryaLocationMap: Record<number, string> = {
  1: "loc_001",
  2: "loc_002",
};


// ==================================================
// APP
// ==================================================

function App() {

  // ==================================================
  // RISK LOCATIONS
  // ==================================================

  const [riskLocations, setRiskLocations] =
    useState(locations);


  // ==================================================
  // POLICE UNITS
  // ==================================================

  const [policeUnits, setPoliceUnits] =
    useState<PoliceUnit[]>([]);


  // ==================================================
  // DEPLOYMENT RECOMMENDATION
  // ==================================================

  const [
    recommendedDeployment,
    setRecommendedDeployment,
  ] = useState<RecommendedDeployment | undefined>(undefined);
  


  // ==================================================
  // SELECTED LOCATION FOR IMAGE UPLOAD
  // ==================================================

  const [
    selectedLocationId,
    setSelectedLocationId,
  ] = useState<number>(1);


  // ==================================================
  // FETCH DEPLOYMENT RECOMMENDATION
  // ==================================================

  const fetchRecommendation = async (
    locationId: string
  ) => {

    try {

      console.log(
        "FETCHING RECOMMENDATION FOR:",
        locationId
      );

      const response = await fetch(
        `http://127.0.0.1:5002/api/deployment/recommend/${locationId}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch deployment recommendation"
        );
      }

      const data = await response.json();

      console.log(
        "DEPLOYMENT RECOMMENDATION:",
        data
      );

      if (
        data.success &&
        data.recommendation
      ) {

        const recommendation =
          data.recommendation;

        setRecommendedDeployment({
          recommended_unit_id:
            recommendation.recommended_unit_id,

          recommended_location_id:
            recommendation.location_id,
        });

      } else {

        setRecommendedDeployment(undefined);

      }

    } catch (error) {

      console.error(
        "RECOMMENDATION ERROR:",
        error
      );

      setRecommendedDeployment(undefined);

    }

  };


  // ==================================================
  // LOCATION SELECTED ON MAP
  // ==================================================

  const handleLocationSelect = async (
    locationId: string
  ) => {

    console.log(
      "Selected location:",
      locationId
    );

    await fetchRecommendation(
      locationId
    );

  };


  // ==================================================
  // SEND RISK EVENT TO MSG OPERATOR
  // ==================================================

  const sendRiskToMsgOperator = async (
    locationId: string,
    locationName: string,
    riskScore: number,
    riskLevel: "RED" | "YELLOW" | "GREEN",
    recommendation: any
  ) => {

    try {

      const recommendedUnitId =
        recommendation?.recommended_unit_id ??
        null;


      const recommendedUnit =
        policeUnits.find(
          (unit) =>
            unit.id === recommendedUnitId
        );


      const event = {

        event_id:
          `TRAFFIC-${Date.now()}`,

        event_type:
          "RISK_UPDATE",

        location_id:
          locationId,

        location_name:
          locationName,

        risk_score:
          riskScore,

        risk_level:
          riskLevel,

        reason:
          recommendation?.reason ??
          "Traffic risk detected from image analysis.",

        police_status:
          recommendedUnit?.status ??
          null,

        recommended_unit_id:
          recommendedUnitId,

        red_duration_minutes:
          0,

        action_required:
          riskLevel === "RED" ||
          riskLevel === "YELLOW" ||
          recommendedUnitId !== null,

      };


      console.log(
        "SENDING RISK EVENT TO MSG OPERATOR:",
        event
      );


      const response = await fetch(
        "http://127.0.0.1:8001/api/events/risk",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(event),

        }
      );


      if (!response.ok) {

        throw new Error(
          `MSG Operator returned ${response.status}`
        );

      }


      const result =
        await response.json();


      console.log(
        "MSG OPERATOR RESPONSE:",
        result
      );


    } catch (error) {

      console.error(
        "Unable to send risk event to MSG Operator:",
        error
      );

    }

  };


  // ==================================================
  // TRAFFIC IMAGE UPLOAD
  // AISHAWARYA → RISK → DEPLOYMENT → MSG OPERATOR
  // ==================================================

  const handleTrafficImageUpload = async (
    file: File,
    locationId: number
  ) => {

    try {

      console.log(
        "Uploading traffic image..."
      );


      // ==================================================
      // 1. SEND IMAGE TO AISHAWARYA
      // ==================================================

      const formData =
        new FormData();


      formData.append(
        "file",
        file
      );


      formData.append(
        "location_id",
        String(locationId)
      );


      const response =
        await fetch(
          "http://127.0.0.1:8000/upload-image",
          {

            method: "POST",

            body: formData,

          }
        );


      if (!response.ok) {

        throw new Error(
          "Traffic analysis failed"
        );

      }


      const data:
        AishwaryaUploadResponse =
        await response.json();


      console.log(
        "AISHAWARYA TRAFFIC RESULT:",
        data
      );


      // ==================================================
      // 2. CONVERT RISK LEVEL
      // HIGH   → RED
      // MEDIUM → YELLOW
      // LOW    → GREEN
      // ==================================================

      const riskLevelMap = {

        HIGH: "RED",

        MEDIUM: "YELLOW",

        LOW: "GREEN",

      } as const;


      const newRiskLevel =
        riskLevelMap[
          data.risk_result.risk_level
        ];


      // ==================================================
      // 3. FIND MAP LOCATION ID
      // ==================================================

      const mapLocationId =
        aishwaryaLocationMap[
          data.location.id
        ];


      if (!mapLocationId) {

        console.error(
          "No map location found for Aishwarya location:",
          data.location.id
        );

        return;

      }


      // ==================================================
      // 4. UPDATE RISK LOCATION ON MAP
      // ==================================================

      setRiskLocations(
        (currentLocations) =>

          currentLocations.map(
            (location) => {

              if (
                location.id !==
                mapLocationId
              ) {

                return location;

              }


              return {

                ...location,

                name:
                  data.location.name,

                risk_score:
                  data.risk_result.risk_score,

                risk_level:
                  newRiskLevel,

              };

            }
          )
      );


      console.log(
        "MAP RISK LOCATION UPDATED:",
        {

          mapLocationId,

          name:
            data.location.name,

          riskScore:
            data.risk_result.risk_score,

          riskLevel:
            newRiskLevel,

        }
      );


      // ==================================================
      // 5. GET POLICE DEPLOYMENT RECOMMENDATION
      // VAIBHAVI BACKEND
      // ==================================================

      let recommendation =
        null;


      try {

        const recommendationResponse =
          await fetch(
            `http://127.0.0.1:5002/api/deployment/recommend/${mapLocationId}`
          );


        if (
          recommendationResponse.ok
        ) {

          const recommendationData =
            await recommendationResponse.json();


          if (
            recommendationData.success &&
            recommendationData.recommendation
          ) {

            recommendation =
              recommendationData.recommendation;


            console.log(
              "DEPLOYMENT RECOMMENDATION:",
              recommendation
            );


            setRecommendedDeployment({

              recommended_unit_id:
                recommendation.recommended_unit_id,

              recommended_location_id:
                recommendation.location_id,

            });

          } else {

            setRecommendedDeployment(undefined);

          }

        }

      } catch (error) {

        console.error(
          "Unable to get deployment recommendation:",
          error
        );

        setRecommendedDeployment(undefined);

      }


      // ==================================================
      // 6. SEND COMPLETE RISK EVENT
      // TO MSG OPERATOR
      // ==================================================

      await sendRiskToMsgOperator(

        mapLocationId,

        data.location.name,

        data.risk_result.risk_score,

        newRiskLevel,

        recommendation

      );


    } catch (error) {

      console.error(
        "Unable to analyze traffic:",
        error
      );

    }

  };


  // ==================================================
  // FETCH POLICE UNITS
  // ==================================================

  useEffect(() => {

    const fetchPoliceUnits =
      async () => {

        try {

          const response =
            await fetch(
              "http://127.0.0.1:5002/api/police/units"
            );


          if (!response.ok) {

            throw new Error(
              "Failed to fetch police units"
            );

          }


          const data =
            await response.json();


          const mappedUnits:
            PoliceUnit[] =
            data.units.map(
              (unit: any) => ({

                id:
                  unit.id,

                name:
                  unit.unit_name,

                latitude:
                  unit.latitude,

                longitude:
                  unit.longitude,

                status:
                  unit.status,

              })
            );


          setPoliceUnits(
            mappedUnits
          );


          console.log(
            "POLICE UNITS RECEIVED:",
            mappedUnits
          );


        } catch (error) {

          console.error(
            "Unable to load police units:",
            error
          );

        }

      };


    fetchPoliceUnits();

  }, []);


  // ==================================================
  // UI
  // ==================================================

  return (

    <div
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
      }}
    >


      {/* =============================================
          TRAFFIC IMAGE UPLOAD PANEL
          ============================================= */}

      <div
        style={{

          position: "absolute",

          top: "90px",

          left: "20px",

          zIndex: 2000,

          background: "white",

          padding: "12px",

          borderRadius: "8px",

          boxShadow:
            "0 2px 8px rgba(0,0,0,0.25)",

        }}
      >

        <div
          style={{

            fontWeight: "bold",

            marginBottom: "8px",

          }}
        >
          Traffic Risk Analysis
        </div>


        {/* LOCATION SELECT */}

        <div
          style={{

            marginBottom: "8px",

          }}
        >

          <label>

            Location:{" "}

            <select
              value={
                selectedLocationId
              }

              onChange={(event) =>
                setSelectedLocationId(
                  Number(
                    event.target.value
                  )
                )
              }
            >

              <option value={1}>
                Main Road
              </option>

              <option value={2}>
                University Road
              </option>

            </select>

          </label>

        </div>


        {/* IMAGE UPLOAD */}

        <input
          type="file"

          accept="image/*"

          onChange={(event) => {

            const file =
              event.target.files?.[0];


            if (file) {

              handleTrafficImageUpload(
                file,
                selectedLocationId
              );

            }

          }}
        />

      </div>


      {/* =============================================
          RISK MAP
          ============================================= */}

      <RiskMap

        riskLocations={
          riskLocations
        }

        policeUnits={
          policeUnits
        }

        deployments={
          deployments
        }

        recommendedDeployment={
          recommendedDeployment
        }

        onLocationSelect={
          handleLocationSelect
        }

      />

    </div>

  );

}


export default App;