from app import db
from datetime import datetime


class MailSettings(db.Model):
    """Singleton — only 1 row (id=1). SMTP config for outbound notifications."""
    __tablename__ = 'mail_settings'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    enabled = db.Column(db.Boolean, default=False)

    smtp_host = db.Column(db.String(255), default='')
    smtp_port = db.Column(db.Integer, default=587)
    smtp_user = db.Column(db.String(255), default='')
    smtp_password = db.Column(db.String(500), default='')
    use_tls = db.Column(db.Boolean, default=True)

    from_email = db.Column(db.String(255), default='')
    from_name = db.Column(db.String(255), default='')
    # Comma-separated: notifications can go to more than one inbox
    to_email = db.Column(db.String(500), default='')

    # Base URL of the site, used to link back to the admin inbox from the email
    site_url = db.Column(db.String(500), default='')

    # Outcome of the most recent send attempt, so the admin can see whether
    # notifications are actually going out without digging through server logs
    last_status = db.Column(db.String(20), default='')   # '' | 'success' | 'error'
    last_error = db.Column(db.Text, default='')
    last_sent_at = db.Column(db.DateTime, nullable=True)

    def recipients(self):
        """to_email split into a clean list."""
        return [addr.strip() for addr in (self.to_email or '').split(',') if addr.strip()]

    def is_ready(self):
        """True when there is enough config to attempt a send."""
        return bool(self.enabled and self.smtp_host and self.from_email and self.recipients())

    def to_dict(self):
        return {
            'enabled': bool(self.enabled),
            'smtpHost': self.smtp_host or '',
            'smtpPort': self.smtp_port or 587,
            'smtpUser': self.smtp_user or '',
            # Never send the password back to the client — only whether one is stored
            'hasPassword': bool(self.smtp_password),
            'useTls': bool(self.use_tls),
            'fromEmail': self.from_email or '',
            'fromName': self.from_name or '',
            'toEmail': self.to_email or '',
            'siteUrl': self.site_url or '',
            'isReady': self.is_ready(),
            'lastStatus': self.last_status or '',
            'lastError': self.last_error or '',
            'lastSentAt': self.last_sent_at.isoformat() + 'Z' if self.last_sent_at else None,
        }

    @staticmethod
    def get_or_create():
        settings = db.session.get(MailSettings, 1)
        if not settings:
            settings = MailSettings(id=1)
            db.session.add(settings)
            db.session.commit()
        return settings

    def record_result(self, ok, error=''):
        self.last_status = 'success' if ok else 'error'
        self.last_error = '' if ok else (error or 'ไม่ทราบสาเหตุ')[:2000]
        self.last_sent_at = datetime.utcnow()
