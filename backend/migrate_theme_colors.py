from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE company_info ADD COLUMN primary_color VARCHAR(50) DEFAULT '#a3d900'"))
        db.session.commit()
        print("Added primary_color column.")
    except Exception as e:
        db.session.rollback()
        print("primary_color column already exists or error:", e)

    try:
        db.session.execute(text("ALTER TABLE company_info ADD COLUMN navy_color VARCHAR(50) DEFAULT '#0f172a'"))
        db.session.commit()
        print("Added navy_color column.")
    except Exception as e:
        db.session.rollback()
        print("navy_color column already exists or error:", e)
