from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


class AlertRequest(BaseModel):

    risk_score: int

    risk_level: str

    location: str


@router.post("/create")
def create_alert(data: AlertRequest):

    risk_level = data.risk_level.upper()


    # HIGH
    if risk_level == "HIGH":

        return {

            "alert": True,

            "alert_type":
                "HIGH_TRAFFIC_RISK",

            "message":
                f"High traffic risk detected at {data.location}!",

            "risk_score":
                data.risk_score,

            "location":
                data.location

        }


    # MEDIUM
    elif risk_level == "MEDIUM":

        return {

            "alert": True,

            "alert_type":
                "MEDIUM_TRAFFIC_RISK",

            "message":
                f"Moderate traffic risk detected at {data.location}.",

            "risk_score":
                data.risk_score,

            "location":
                data.location

        }


    # LOW
    else:

        return {

            "alert": False,

            "alert_type":
                "LOW_TRAFFIC_RISK",

            "message":
                f"Traffic conditions are normal at {data.location}.",

            "risk_score":
                data.risk_score,

            "location":
                data.location

        }