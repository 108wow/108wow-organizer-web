import random
from app import db
from app.utils import mask_secret
from datetime import datetime


def generate_register_code():
    """6-digit code staff type into the bot chat to enrol themselves."""
    return f'{random.randint(0, 999999):06d}'


class LineSettings(db.Model):
    """Singleton — only 1 row (id=1). LINE Messaging API credentials."""
    __tablename__ = 'line_settings'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    enabled = db.Column(db.Boolean, default=False)
    channel_access_token = db.Column(db.Text, default='')
    channel_secret = db.Column(db.String(255), default='')

    # Typing this code in the bot chat activates the sender as a recipient.
    # Without it, anyone who adds the Official Account (customers included)
    # would start receiving other people's enquiry details.
    register_code = db.Column(db.String(10), default=generate_register_code)

    # Base URL of the site, used to link back to the admin inbox from the message
    site_url = db.Column(db.String(500), default='')

    last_status = db.Column(db.String(20), default='')   # '' | 'success' | 'error'
    last_error = db.Column(db.Text, default='')
    last_sent_at = db.Column(db.DateTime, nullable=True)

    def is_ready(self):
        """True when there is enough config and at least one selected recipient."""
        if not (self.enabled and self.channel_access_token):
            return False
        return LineRecipient.query.filter_by(is_active=True).count() > 0

    def to_dict(self):
        active = LineRecipient.query.filter_by(is_active=True).count()
        pending = LineRecipient.query.filter_by(is_active=False, is_blocked=False).count()
        return {
            'enabled': bool(self.enabled),
            # Credentials are never sent back to the client
            'hasAccessToken': bool(self.channel_access_token),
            'hasChannelSecret': bool(self.channel_secret),
            # Preview only — the full values come from the /reveal endpoint on demand
            'accessTokenMasked': mask_secret(self.channel_access_token),
            'accessTokenLength': len(self.channel_access_token or ''),
            'channelSecretMasked': mask_secret(self.channel_secret),
            'channelSecretLength': len(self.channel_secret or ''),
            'siteUrl': self.site_url or '',
            'registerCode': self.register_code or '',
            'activeRecipients': active,
            'pendingRecipients': pending,
            'isReady': bool(self.enabled and self.channel_access_token and active),
            'lastStatus': self.last_status or '',
            'lastError': self.last_error or '',
            'lastSentAt': self.last_sent_at.isoformat() + 'Z' if self.last_sent_at else None,
        }

    @staticmethod
    def get_or_create():
        settings = db.session.get(LineSettings, 1)
        if not settings:
            settings = LineSettings(id=1)
            db.session.add(settings)
            db.session.commit()
        return settings

    def record_result(self, ok, error=''):
        self.last_status = 'success' if ok else 'error'
        self.last_error = '' if ok else (error or 'ไม่ทราบสาเหตุ')[:2000]
        self.last_sent_at = datetime.utcnow()


class LineRecipient(db.Model):
    """
    A LINE user who can receive notifications.

    Rows arrive either from the webhook (someone added the Official Account as a
    friend) or by an admin pasting a userId. `is_active` is the admin's choice of
    who actually gets notified.
    """
    __tablename__ = 'line_recipients'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    line_user_id = db.Column(db.String(64), unique=True, nullable=False)
    display_name = db.Column(db.String(255), default='')
    picture_url = db.Column(db.String(500), default='')
    is_active = db.Column(db.Boolean, default=True)
    # 'follow' = registered itself through the webhook, 'manual' = added by admin
    source = db.Column(db.String(20), default='follow')
    is_blocked = db.Column(db.Boolean, default=False)  # user unfollowed the OA
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'lineUserId': self.line_user_id,
            'displayName': self.display_name or '(ไม่ทราบชื่อ)',
            'pictureUrl': self.picture_url or '',
            'isActive': bool(self.is_active),
            'isBlocked': bool(self.is_blocked),
            'source': self.source or 'follow',
            'createdAt': self.created_at.isoformat() + 'Z' if self.created_at else None,
        }
