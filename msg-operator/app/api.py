from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from .database import db

from .schemas import (
    RiskRecommendationEvent,
    DecisionRequest,
)

from .services import (
    create_notification,
    mark_read,
    record_decision,
)


router = APIRouter(
    prefix="/api",
    tags=["MSG Operator"],
)


# ==================================================
# RECEIVE RISK EVENT
# ==================================================

@router.post("/events/risk")
def receive_risk_event(
    event: RiskRecommendationEvent,
):
    """
    Receive a risk/recommendation event.

    MSG Operator converts the received event
    into a notification.
    """

    notification_id, duplicate = create_notification(
        event
    )

    if duplicate:
        return {
            "success": True,
            "duplicate": True,
            "notification_id": None,
            "message": "Risk event already processed.",
        }

    return {
        "success": True,
        "duplicate": False,
        "notification_id": notification_id,
        "message": "Notification created.",
    }


# ==================================================
# GET NOTIFICATIONS
# ==================================================

@router.get("/notifications")
def get_notifications(
    unread_only: bool = False,
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),
):
    """Return notification history."""

    query = """
        SELECT *
        FROM notifications
    """

    if unread_only:
        query += """
            WHERE status = 'UNREAD'
        """

    query += """
        ORDER BY created_at DESC
        LIMIT ?
    """

    with db() as connection:

        rows = connection.execute(
            query,
            (limit,),
        ).fetchall()

    return [
        dict(row)
        for row in rows
    ]


# ==================================================
# GET ACTIVE NOTIFICATIONS
# ==================================================

@router.get("/notifications/active")
def get_active_notifications():
    """
    Return notifications that require
    operator action.
    """

    with db() as connection:

        rows = connection.execute(
            """
            SELECT *
            FROM notifications
            WHERE action_required = 1
            AND status IN (
                'UNREAD',
                'READ',
                'MODIFY'
            )
            ORDER BY created_at DESC
            """
        ).fetchall()

    return [
        dict(row)
        for row in rows
    ]


# ==================================================
# GET ONE NOTIFICATION
# ==================================================

@router.get(
    "/notifications/{notification_id}"
)
def get_notification(
    notification_id: int,
):
    """Return one notification by ID."""

    with db() as connection:

        row = connection.execute(
            """
            SELECT *
            FROM notifications
            WHERE id = ?
            """,
            (notification_id,),
        ).fetchone()

    if row is None:

        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    return dict(row)


# ==================================================
# MARK NOTIFICATION AS READ
# ==================================================

@router.patch(
    "/notifications/{notification_id}/read"
)
def read_notification(
    notification_id: int,
):
    """Mark a notification as read."""

    updated = mark_read(
        notification_id
    )

    if not updated:

        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    return {
        "success": True,
        "message": "Notification marked as read.",
    }


# ==================================================
# ACCEPT / MODIFY / REJECT
# ==================================================

@router.post(
    "/notifications/{notification_id}/decision"
)
def notification_decision(
    notification_id: int,
    request: DecisionRequest,
):
    """
    Record ACCEPT, MODIFY, or REJECT.
    """

    try:

        result = record_decision(
            notification_id,
            request,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    return {
        "success": True,

        "message": (
            f"{request.action} decision recorded."
        ),

        "decision": result,
    }


# ==================================================
# STATISTICS
# ==================================================

@router.get("/statistics")
def notification_statistics():
    """Return notification statistics."""

    with db() as connection:

        total = connection.execute(
            """
            SELECT COUNT(*)
            FROM notifications
            """
        ).fetchone()[0]

        unread = connection.execute(
            """
            SELECT COUNT(*)
            FROM notifications
            WHERE status = 'UNREAD'
            """
        ).fetchone()[0]

        read = connection.execute(
            """
            SELECT COUNT(*)
            FROM notifications
            WHERE status = 'READ'
            """
        ).fetchone()[0]

        pending = connection.execute(
            """
            SELECT COUNT(*)
            FROM notifications
            WHERE action_required = 1
            AND status IN (
                'UNREAD',
                'READ',
                'MODIFY'
            )
            """
        ).fetchone()[0]

        accepted = connection.execute(
            """
            SELECT COUNT(*)
            FROM notifications
            WHERE status = 'ACCEPT'
            """
        ).fetchone()[0]

        modified = connection.execute(
            """
            SELECT COUNT(*)
            FROM notifications
            WHERE status = 'MODIFY'
            """
        ).fetchone()[0]

        rejected = connection.execute(
            """
            SELECT COUNT(*)
            FROM notifications
            WHERE status = 'REJECT'
            """
        ).fetchone()[0]

    return {
        "total": total,
        "unread": unread,
        "read": read,
        "pending_actions": pending,
        "accepted": accepted,
        "modified": modified,
        "rejected": rejected,
    }