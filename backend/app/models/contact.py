from app import db
from datetime import datetime


class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), default='')
    subject = db.Column(db.String(500), default='')
    body = db.Column(db.Text, default='')
    status = db.Column(db.String(20), default='unread')  # unread / read
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'body': self.body,
            'status': self.status,
            'date': self.created_at.strftime('%d %b %Y') if self.created_at else '',
            # Full timestamp so the admin inbox can show time and relative dates
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
        }
