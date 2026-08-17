from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import TrafficImage


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db)
):

    # -------------------------
    # TOTAL IMAGES
    # -------------------------

    total_images = (
        db.query(TrafficImage).count()
    )


    # -------------------------
    # LATEST 5
    # -------------------------

    latest_images = (

        db.query(TrafficImage)

        .order_by(
            TrafficImage.id.desc()
        )

        .limit(5)

        .all()

    )


    images = []


    for image in latest_images:

        images.append({

            "id":
                image.id,

            "filename":
                image.filename,

            "status":
                image.status,

            "uploaded_at":
                image.uploaded_at,

            "location": {

                "id":
                    image.location_id,

                "name":
                    image.location_name,

                "latitude":
                    image.latitude,

                "longitude":
                    image.longitude

            },

            "vehicles": {

                "cars":
                    image.car_count,

                "motorcycles":
                    image.motorcycle_count,

                "buses":
                    image.bus_count,

                "trucks":
                    image.truck_count,

                "bicycles":
                    image.bicycle_count,

                "total":
                    image.total_vehicles

            },

            "congestion":
                image.congestion_level,

            "risk": {

                "score":
                    image.risk_score,

                "level":
                    image.risk_level

            },

            "alert": {

                "active":
                    image.alert_active,

                "type":
                    image.alert_type

            }

        })


    return {

        "total_images":
            total_images,

        "latest_images":
            images

    }