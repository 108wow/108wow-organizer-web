"""
Creates the mail_settings table used for contact-form email notifications.

Run once after pulling this change:
    python migrate_mail_settings.py
"""
from app import create_app, db
from app.models.mail_settings import MailSettings

app = create_app()
with app.app_context():
    # create_all only creates tables that don't exist yet — existing data is untouched
    db.create_all()
    print("Ensured mail_settings table exists.")

    settings = db.session.get(MailSettings, 1)
    if not settings:
        db.session.add(MailSettings(id=1))
        db.session.commit()
        print("Created default (disabled) mail settings row.")
    else:
        print("Mail settings row already present.")
