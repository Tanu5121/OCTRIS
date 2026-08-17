import sqlite3
from contextlib import contextmanager

from .config import settings


DATABASE_PATH = settings.database_url.replace("sqlite:///", "")


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(
        DATABASE_PATH,
        check_same_thread=False,
    )

    connection.row_factory = sqlite3.Row

    # Improve SQLite behavior for concurrent reads/writes.
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute("PRAGMA foreign_keys=ON")

    return connection


@contextmanager
def db():
    connection = get_connection()

    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def init_db():
    with db() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                event_id TEXT NOT NULL,
                event_type TEXT NOT NULL,

                location_id TEXT,
                location_name TEXT,

                severity TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,

                risk_score REAL,
                risk_level TEXT,

                reason TEXT,
                police_status TEXT,

                recommended_unit_id TEXT,

                status TEXT NOT NULL DEFAULT 'UNREAD',

                action_required INTEGER NOT NULL DEFAULT 0,

                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_notifications_status
            ON notifications(status);

            CREATE INDEX IF NOT EXISTS idx_notifications_created
            ON notifications(created_at);

            CREATE INDEX IF NOT EXISTS idx_notifications_event
            ON notifications(event_id);


            CREATE TABLE IF NOT EXISTS decisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                notification_id INTEGER NOT NULL,

                action TEXT NOT NULL,

                modified_reason TEXT,
                modified_police_status TEXT,
                modified_unit_id TEXT,

                operator_comment TEXT,

                created_at TEXT NOT NULL,

                FOREIGN KEY(notification_id)
                    REFERENCES notifications(id)
            );

            CREATE INDEX IF NOT EXISTS idx_decisions_notification
            ON decisions(notification_id);


            CREATE TABLE IF NOT EXISTS processed_events (
                event_id TEXT PRIMARY KEY,
                processed_at TEXT NOT NULL
            );
            """
        )