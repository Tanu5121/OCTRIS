from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime

from database import Base


class TrafficImage(Base):

    __tablename__ = "traffic_images"

    # IMAGE
    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, nullable=False)

    file_path = Column(String, nullable=False)

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    status = Column(
        String,
        default="uploaded"
    )

    # LOCATION
    location_id = Column(Integer, nullable=True)

    location_name = Column(String, nullable=True)

    latitude = Column(Float, nullable=True)

    longitude = Column(Float, nullable=True)

    # VEHICLES
    car_count = Column(Integer, default=0)

    motorcycle_count = Column(Integer, default=0)

    bus_count = Column(Integer, default=0)

    truck_count = Column(Integer, default=0)

    bicycle_count = Column(Integer, default=0)

    total_vehicles = Column(Integer, default=0)

    # TRAFFIC
    congestion_level = Column(
        String,
        nullable=True
    )

    # RISK
    risk_score = Column(
        Integer,
        nullable=True
    )

    risk_level = Column(
        String,
        nullable=True
    )

    # ALERT
    alert_active = Column(
        String,
        nullable=True
    )

    alert_type = Column(
        String,
        nullable=True
    )