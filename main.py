from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Depends,
    Form,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import os
import shutil


# ==================================================
# DATABASE
# ==================================================

from database import (
    engine,
    get_db,
    Base
)

from models import TrafficImage


# ==================================================
# LOCATION
# ==================================================

from api.locations import (
    router as locations_router,
    get_location_by_id
)


# ==================================================
# RISK
# ==================================================

from api.risk import (
    router as risk_router,
    TrafficData,
    analyze_risk
)


# ==================================================
# ALERTS
# ==================================================

from api.alerts import (
    router as alerts_router,
    AlertRequest,
    create_alert
)


# ==================================================
# DASHBOARD
# ==================================================

from api.dashboard import (
    router as dashboard_router
)


# ==================================================
# YOLO
# ==================================================

from ai.yolo_detector import (
    detect_traffic
)


# ==================================================
# CREATE DATABASE TABLES
# ==================================================

Base.metadata.create_all(
    bind=engine
)


# ==================================================
# FASTAPI
# ==================================================

app = FastAPI(
    title="Traffic Intelligence API",
    version="1.0.0"
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",

        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==================================================
# ROUTERS
# ==================================================

app.include_router(
    locations_router
)

app.include_router(
    risk_router
)

app.include_router(
    alerts_router
)

app.include_router(
    dashboard_router
)


# ==================================================
# IMAGE STORAGE
# ==================================================

UPLOAD_FOLDER = "uploaded_images"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ==================================================
# HOME
# ==================================================

@app.get("/")
def home():

    return {
        "message":
            "Traffic Intelligence Backend is running!"
    }


# ==================================================
# UPLOAD IMAGE + COMPLETE ANALYSIS
# ==================================================

@app.post("/upload-image")
async def upload_image(

    file: UploadFile = File(...),

    location_id: int = Form(...),

    db: Session = Depends(get_db)

):

    # ==================================================
    # 1. CHECK LOCATION
    # ==================================================

    location = get_location_by_id(
        location_id
    )

    if location is None:

        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )


    # ==================================================
    # 2. SAVE IMAGE
    # ==================================================

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    # ==================================================
    # 3. YOLO DETECTION
    # ==================================================

    yolo_result = detect_traffic(
        file_path
    )


    # ==================================================
    # 4. VEHICLE COUNTS
    # ==================================================

    counts = yolo_result.get(
        "counts",
        {}
    )

    car_count = counts.get(
        "car",
        0
    )

    motorcycle_count = counts.get(
        "motorcycle",
        0
    )

    bus_count = counts.get(
        "bus",
        0
    )

    truck_count = counts.get(
        "truck",
        0
    )

    bicycle_count = counts.get(
        "bicycle",
        0
    )


    # ==================================================
    # 5. TOTAL VEHICLES
    # ==================================================

    total_vehicles = (
        car_count
        + motorcycle_count
        + bus_count
        + truck_count
        + bicycle_count
    )


    # ==================================================
    # 6. CONGESTION
    # ==================================================

    if total_vehicles >= 40:

        congestion_level = "high"

    elif total_vehicles >= 20:

        congestion_level = "medium"

    else:

        congestion_level = "low"


    # ==================================================
    # 7. RISK CALCULATION
    # ==================================================

    traffic_data = TrafficData(

        vehicle_count=total_vehicles,

        congestion_level=congestion_level,

        accident_detected=False
    )

    risk_result = analyze_risk(
        traffic_data
    )


    # ==================================================
    # 8. ALERT
    # ==================================================

    alert_data = AlertRequest(

        risk_score=
            risk_result["risk_score"],

        risk_level=
            risk_result["risk_level"],

        location=
            location["name"]
    )

    alert_result = create_alert(
        alert_data
    )


    # ==================================================
    # 9. SAVE EVERYTHING TO DATABASE
    # ==================================================

    traffic_image = TrafficImage(

        filename=file.filename,

        file_path=file_path,

        status="analyzed",

        # LOCATION
        location_id=location["id"],

        location_name=location["name"],

        latitude=location["latitude"],

        longitude=location["longitude"],

        # VEHICLES
        car_count=car_count,

        motorcycle_count=
            motorcycle_count,

        bus_count=bus_count,

        truck_count=truck_count,

        bicycle_count=
            bicycle_count,

        total_vehicles=
            total_vehicles,

        # TRAFFIC
        congestion_level=
            congestion_level,

        # RISK
        risk_score=
            risk_result["risk_score"],

        risk_level=
            risk_result["risk_level"],

        # ALERT
        alert_active=
            str(alert_result["alert"]),

        alert_type=
            alert_result["alert_type"]
    )


    db.add(
        traffic_image
    )

    db.commit()

    db.refresh(
        traffic_image
    )


    # ==================================================
    # 10. FINAL RESPONSE
    # ==================================================

    return {

        "message":
            "Traffic image uploaded and analyzed successfully!",

        "image_id":
            traffic_image.id,

        "filename":
            traffic_image.filename,

        "status":
            traffic_image.status,

        # LOCATION + COORDINATES
        "location": {

            "id":
                location["id"],

            "name":
                location["name"],

            "latitude":
                location["latitude"],

            "longitude":
                location["longitude"]
        },

        # YOLO
        "yolo_result": {

            "counts":
                counts,

            "total_vehicles":
                total_vehicles,

            "detections":
                yolo_result.get(
                    "detections",
                    []
                )
        },

        # RISK
        "risk_result": {

            "risk_score":
                risk_result["risk_score"],

            "risk_level":
                risk_result["risk_level"],

            "vehicle_count":
                risk_result["vehicle_count"],

            "congestion_level":
                risk_result["congestion_level"],

            "accident_detected":
                risk_result["accident_detected"]
        },

        # ALERT
        "alert_result":
            alert_result
    }