from datetime import datetime, timezone
from typing import Optional

from .database import db
from .schemas import RiskRecommendationEvent, DecisionRequest


def utc_now() -> str:
    """Return the current UTC time as an ISO timestamp."""
    return datetime.now(timezone.utc).isoformat()


def determine_severity(
    risk_level: Optional[str],
    risk_score: Optional[float],
    action_required: bool,
) -> str:
    """
    Convert risk information into notification severity.

    MSG Operator does not calculate the risk score.
    It only assigns notification severity based on the
    information received from the upstream module.
    """

    if action_required:
        return "CRITICAL"

    if risk_level:
        level = risk_level.upper()

        if level == "RED":
            return "CRITICAL"

        if level == "YELLOW":
            return "WARNING"

        if level == "GREEN":
            return "INFO"

    if risk_score is not None:

        if risk_score >= 70:
            return "CRITICAL"

        if risk_score >= 40:
            return "WARNING"

    return "INFO"


def generate_message(
    event: RiskRecommendationEvent,
) -> tuple[str, str]:
    """Generate a clear, explainable notification."""

    location = (
        event.location_name
        or event.location_id
        or "Unknown location"
    )

    severity = determine_severity(
        event.risk_level,
        event.risk_score,
        event.action_required,
    )

    if severity == "CRITICAL":

        title = f"High-Risk Alert — {location}"

        message = (
            f"{location} is currently high risk."
        )

        if event.risk_score is not None:
            message += (
                f" Risk score: "
                f"{event.risk_score:.0f}/100."
            )

        if event.red_duration_minutes is not None:
            message += (
                f" Red condition duration: "
                f"{event.red_duration_minutes} minutes."
            )

        if event.police_status:
            message += (
                f" Police status: "
                f"{event.police_status}."
            )

        if event.reason:
            message += (
                f" Reason: {event.reason}."
            )

        if event.recommended_unit_id:
            message += (
                f" Recommendation available "
                f"for unit "
                f"{event.recommended_unit_id}."
            )

        return title, message

    if severity == "WARNING":

        title = f"Traffic Warning — {location}"

        message = (
            f"{location} requires monitoring."
        )

        if event.risk_score is not None:
            message += (
                f" Risk score: "
                f"{event.risk_score:.0f}/100."
            )

        if event.reason:
            message += (
                f" Reason: {event.reason}."
            )

        return title, message

    title = f"Traffic Update — {location}"

    message = (
        f"Traffic status updated for {location}."
    )

    if event.risk_score is not None:
        message += (
            f" Risk score: "
            f"{event.risk_score:.0f}/100."
        )

    return title, message


def is_duplicate(event_id: str) -> bool:
    """Check whether an event has already been processed."""

    with db() as connection:

        row = connection.execute(
            """
            SELECT event_id
            FROM processed_events
            WHERE event_id = ?
            """,
            (event_id,),
        ).fetchone()

        return row is not None


def create_notification(
    event: RiskRecommendationEvent,
):
    """
    Create a notification from an incoming event.

    Returns:
        (notification_id, duplicate)
    """

    if is_duplicate(event.event_id):
        return None, True

    now = utc_now()

    title, message = generate_message(event)

    severity = determine_severity(
        event.risk_level,
        event.risk_score,
        event.action_required,
    )

    with db() as connection:

        # Mark event as processed.
        connection.execute(
            """
            INSERT INTO processed_events
            (
                event_id,
                processed_at
            )
            VALUES (?, ?)
            """,
            (
                event.event_id,
                now,
            ),
        )

        # Create notification.
        cursor = connection.execute(
            """
            INSERT INTO notifications
            (
                event_id,
                event_type,
                location_id,
                location_name,
                severity,
                title,
                message,
                risk_score,
                risk_level,
                reason,
                police_status,
                recommended_unit_id,
                status,
                action_required,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event.event_id,
                event.event_type,
                event.location_id,
                event.location_name,
                severity,
                title,
                message,
                event.risk_score,
                event.risk_level,
                event.reason,
                event.police_status,
                event.recommended_unit_id,
                "UNREAD",
                int(event.action_required),
                now,
                now,
            ),
        )

        notification_id = cursor.lastrowid

    return notification_id, False


def mark_read(notification_id: int) -> bool:
    """Mark a notification as read."""

    with db() as connection:

        cursor = connection.execute(
            """
            UPDATE notifications
            SET status = 'READ',
                updated_at = ?
            WHERE id = ?
            """,
            (
                utc_now(),
                notification_id,
            ),
        )

        return cursor.rowcount > 0


def record_decision(
    notification_id: int,
    request: DecisionRequest,
):
    """
    Record the operator's ACCEPT, MODIFY, or REJECT decision.
    """

    now = utc_now()

    with db() as connection:

        # ==================================================
        # FIND NOTIFICATION
        # ==================================================

        notification = connection.execute(
            """
            SELECT *
            FROM notifications
            WHERE id = ?
            """,
            (notification_id,),
        ).fetchone()

        if notification is None:
            return None


        # ==================================================
        # VALIDATE MODIFY REQUEST
        # ==================================================

        if request.action == "MODIFY":

            if not request.modified_reason:
                raise ValueError(
                    "modified_reason is required for MODIFY."
                )

            if not request.modified_unit_id:
                raise ValueError(
                    "modified_unit_id is required for MODIFY."
                )


        # ==================================================
        # STORE OPERATOR DECISION
        # ==================================================

        connection.execute(
            """
            INSERT INTO decisions
            (
                notification_id,
                action,
                modified_reason,
                modified_police_status,
                modified_unit_id,
                operator_comment,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                notification_id,

                request.action,

                request.modified_reason,

                request.modified_police_status,

                request.modified_unit_id,

                request.operator_comment,

                now,
            ),
        )


        # ==================================================
        # UPDATE NOTIFICATION
        # ==================================================

        connection.execute(
            """
            UPDATE notifications
            SET
                status = ?,
                action_required = 0,
                updated_at = ?
            WHERE id = ?
            """,
            (
                request.action,

                now,

                notification_id,
            ),
        )


        # ==================================================
        # RETURN DECISION
        # ==================================================

        return {

            "notification_id":
                notification_id,

            "action":
                request.action,

            "operator_comment":
                request.operator_comment,

            "modified_reason":
                request.modified_reason,

            "modified_police_status":
                request.modified_police_status,

            "modified_unit_id":
                request.modified_unit_id,

            "recorded_at":
                now,
        }