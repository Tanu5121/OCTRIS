from dataclasses import dataclass
from typing import Optional


@dataclass
class Notification:
    id: int
    event_id: str
    event_type: str

    location_id: Optional[str]
    location_name: Optional[str]

    severity: str
    title: str
    message: str

    risk_score: Optional[float]
    risk_level: Optional[str]

    reason: Optional[str]
    police_status: Optional[str]

    recommended_unit_id: Optional[str]

    status: str
    action_required: bool

    created_at: str
    updated_at: str