import sqlite3
from typing import Callable, List, Tuple


Migration = Tuple[str, Callable[[sqlite3.Connection], None]]


def _ensure_schema_migrations_table(connection: sqlite3.Connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id TEXT PRIMARY KEY,
            applied_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )


def _column_exists(connection: sqlite3.Connection, table: str, column: str) -> bool:
    cursor = connection.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())


def _migration_001_add_account_role_and_password_salt(connection: sqlite3.Connection) -> None:
    if not _column_exists(connection, "account", "passwordSalt"):
        connection.execute("ALTER TABLE account ADD COLUMN passwordSalt TEXT")

    if not _column_exists(connection, "account", "role"):
        connection.execute("ALTER TABLE account ADD COLUMN role TEXT DEFAULT 'user'")

    connection.execute(
        """
        UPDATE account
        SET role = 'user'
        WHERE role IS NULL OR TRIM(role) = ''
        """
    )

    connection.execute(
        """
        UPDATE account
        SET role = 'user'
        WHERE role = 'standard'
        """
    )

    connection.execute(
        """
        UPDATE account
        SET roles = '[\"user\"]'
        WHERE roles IS NULL OR TRIM(roles) = '' OR roles = '[]'
        """
    )


def _migration_002_add_patient_account_link(connection: sqlite3.Connection) -> None:
    if not _column_exists(connection, "patient", "patientAccountId"):
        connection.execute("ALTER TABLE patient ADD COLUMN patientAccountId TEXT")


def _migration_003_create_patient_ai_chat_message_table(connection: sqlite3.Connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS patientaichatmessage (
            id TEXT PRIMARY KEY,
            patientId TEXT,
            accountId TEXT,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            createdAt TEXT
        )
        """
    )
    connection.execute(
        "CREATE INDEX IF NOT EXISTS idx_patientaichatmessage_patientId ON patientaichatmessage (patientId)"
    )
    connection.execute(
        "CREATE INDEX IF NOT EXISTS idx_patientaichatmessage_accountId ON patientaichatmessage (accountId)"
    )


MIGRATIONS: List[Migration] = [
    ("001_add_account_role_and_password_salt", _migration_001_add_account_role_and_password_salt),
    ("002_add_patient_account_link", _migration_002_add_patient_account_link),
    ("003_create_patient_ai_chat_message_table", _migration_003_create_patient_ai_chat_message_table),
]


def run_migrations(db_file: str) -> None:
    connection = sqlite3.connect(db_file)
    try:
        _ensure_schema_migrations_table(connection)

        for migration_id, migration_fn in MIGRATIONS:
            cursor = connection.execute(
                "SELECT 1 FROM schema_migrations WHERE id = ?", (migration_id,)
            )
            already_applied = cursor.fetchone() is not None
            if already_applied:
                continue

            migration_fn(connection)
            connection.execute(
                "INSERT INTO schema_migrations (id) VALUES (?)", (migration_id,)
            )

        connection.commit()
    finally:
        connection.close()
