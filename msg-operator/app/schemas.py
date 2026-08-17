from typing import Optional, Literal

from pydantic import BaseModel, Field


Severity = Literal[
    "INFO",
    "WARNING",
    "CRITICAL",
]


DecisionAction = Literal[
    "ACCEPT",
    "MODIFY",
    "REJECT",
]
class DecisionRequest(BaseModel):
    action: DecisionAction

    modified_reason: Optional[str] = None

    modified_police_status: Optional[str] = None

    modified_unit_id: Optional[str] = None

    operator_comment: Optional[str] = None


class RiskRecommendationEvent(BaseModel):
    """
    Event received from the risk/recommendation module.
    MSG Operator does not make deployment decisions.
    """

    event_id: str = Field(min_length=1)
    event_type: str = "RISK_UPDATE"

    location_id: Optional[str] = None
    location_name: Optional[str] = None

    risk_score: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
    )

    risk_level: Optional[str] = None

    reason: Optional[str] = None

    police_status: Optional[str] = None

    recommended_unit_id: Optional[str] = None

    red_duration_minutes: Optional[int] = Field(
        default=None,
        ge=0,
    )

    action_required: bool = False


class DecisionRequest(BaseModel):
    action: DecisionAction

    modified_reason: Optional[str] = None
    modified_police_status: Optional[str] = None
    modified_unit_id: Optional[str] = None

    operator_comment: Optional[str] = None


class NotificationResponse(BaseModel):
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


class NotificationStats(BaseModel):
    total: int
    unread: int
    read: int
    pending_actions: int
    accepted: int
    modified: int
    rejected: int