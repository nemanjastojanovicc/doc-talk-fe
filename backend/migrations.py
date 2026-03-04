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


def _migration_003_add_missing_patient_columns(connection: sqlite3.Connection) -> None:
    if not _column_exists(connection, "patient", "email"):
        connection.execute("ALTER TABLE patient ADD COLUMN email TEXT")

    if not _column_exists(connection, "patient", "phoneNumber"):
        connection.execute("ALTER TABLE patient ADD COLUMN phoneNumber TEXT")

    if not _column_exists(connection, "patient", "medicalRecord"):
        connection.execute("ALTER TABLE patient ADD COLUMN medicalRecord TEXT DEFAULT '{}' ")

    if not _column_exists(connection, "patient", "vitals"):
        connection.execute("ALTER TABLE patient ADD COLUMN vitals TEXT DEFAULT '{}' ")

    if not _column_exists(connection, "patient", "lifestyle"):
        connection.execute("ALTER TABLE patient ADD COLUMN lifestyle TEXT DEFAULT '{}' ")

    if not _column_exists(connection, "patient", "assignedDoctorIds"):
        connection.execute("ALTER TABLE patient ADD COLUMN assignedDoctorIds TEXT DEFAULT '[]' ")

    if not _column_exists(connection, "patient", "isActive"):
        connection.execute("ALTER TABLE patient ADD COLUMN isActive INTEGER DEFAULT 1")

    if not _column_exists(connection, "patient", "createdAt"):
        connection.execute("ALTER TABLE patient ADD COLUMN createdAt TEXT")

    if not _column_exists(connection, "patient", "updatedAt"):
        connection.execute("ALTER TABLE patient ADD COLUMN updatedAt TEXT")


MIGRATIONS: List[Migration] = [
    ("001_add_account_role_and_password_salt", _migration_001_add_account_role_and_password_salt),
    ("002_add_patient_account_link", _migration_002_add_patient_account_link),
    ("003_add_missing_patient_columns", _migration_003_add_missing_patient_columns),
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
