from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE home_config ADD COLUMN navbar_config TEXT"))
        db.session.commit()
        print("OK: navbar_config column added")
    except Exception as e:
        if 'Duplicate column' in str(e) or 'already exists' in str(e):
            print("Column already exists, skipping.")
        else:
            raise e
