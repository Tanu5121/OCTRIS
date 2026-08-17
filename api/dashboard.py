from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import TrafficImage

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# ==========================================
# DASHBOARD SUMMARY
# ==========================================

@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db)
):

    total_images = db.query(TrafficImage).count()

    latest_images = (
        db.query(TrafficImage)
        .order_by(TrafficImage.id.desc())
        .limit(5)
        .all()
    )

    images = []

    for image in latest_images:

        images.append({
            "id": image.id,
            "filename": image.filename,
            "status": image.status,
            "location_id": image.location_id,
            "location_name": image.location_name,
            "latitude": image.latitude,
            "longitude": image.longitude,
            "total_vehicles": image.total_vehicles,
            "congestion_level": image.congestion_level,
            "risk_score": image.risk_score,
            "risk_level": image.risk_level
        })

    return {
        "total_images": total_images,
        "latest_images": images
    }


# ==========================================
# MAP DATA
# ==========================================

@router.get("/map-data")
def get_map_data(
    db: Session = Depends(get_db)
):

    records = (
        db.query(TrafficImage)
        .filter(
            TrafficImage.latitude.isnot(None),
            TrafficImage.longitude.isnot(None),
            TrafficImage.risk_score.isnot(None)
        )
        .order_by(TrafficImage.id.desc())
        .all()
    )

    locations = []

    for image in records:

        locations.append({

            "image_id": image.id,

            "location_id": image.location_id,

            "location_name": image.location_name,

            "latitude": image.latitude,

            "longitude": image.longitude,

            "risk_score": image.risk_score,

            "risk_level": image.risk_level,

            "total_vehicles": image.total_vehicles,

            "congestion_level": image.congestion_level,

            "alert_active": image.alert_active,

            "alert_type": image.alert_type

        })

    return {
        "locations": locations
    }