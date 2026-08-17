from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter(
    prefix="/risk",
    tags=["Risk Analysis"]
)


class TrafficData(BaseModel):

    vehicle_count: int

    congestion_level: str

    accident_detected: bool = False


@router.post("/analyze")
def analyze_risk(data: TrafficData):

    score = 0

    # -------------------------
    # VEHICLE DENSITY
    # -------------------------

    if data.vehicle_count >= 40:

        score += 40

    elif data.vehicle_count >= 20:

        score += 25

    else:

        score += 10


    # -------------------------
    # CONGESTION
    # -------------------------

    congestion = (
        data.congestion_level.lower()
    )

    if congestion == "high":

        score += 40

    elif congestion == "medium":

        score += 25

    else:

        score += 10


    # -------------------------
    # ACCIDENT
    # -------------------------

    if data.accident_detected:

        score += 20


    # -------------------------
    # MAXIMUM 100
    # -------------------------

    score = min(score, 100)


    # -------------------------
    # RISK LEVEL
    # -------------------------

    if score >= 70:

        risk_level = "HIGH"

    elif score >= 40:

        risk_level = "MEDIUM"

    else:

        risk_level = "LOW"


    return {

        "risk_score": score,

        "risk_level": risk_level,

        "vehicle_count":
            data.vehicle_count,

        "congestion_level":
            data.congestion_level,

        "accident_detected":
            data.accident_detected

    }