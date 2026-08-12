"""
Creates the line_settings and line_recipients tables used for LINE notifications.

Run once after pulling this change:
    python migrate_line_settings.py
"""
from app import create_app, db
from app.models.line_settings import LineSettings, generate_register_code
from sqlalchemy import text

app = create_app()
with app.app_context():
    # create_all only creates tables that don't exist yet — existing data is untouched
    db.create_all()
    print("Ensured line_settings and line_recipients tables exist.")

    # Added after the first release, so back-fill it for anyone who already migrated
    try:
        db.session.execute(text("ALTER TABLE line_settings ADD COLUMN register_code VARCHAR(10)"))
        db.session.commit()
        print("Added register_code column.")
    except Exception:
        db.session.rollback()
        print("register_code column already exists.")

    settings = db.session.get(LineSettings, 1)
    if not settings:
        settings = LineSettings(id=1)
        db.session.add(settings)

    if not settings.register_code:
        settings.register_code = generate_register_code()

    db.session.commit()
    print(f"Registration code: {settings.register_code}")
