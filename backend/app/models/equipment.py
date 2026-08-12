from app import db
import uuid
import json
from datetime import datetime

class Equipment(db.Model):
    __tablename__ = 'equipment'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), default='ทั่วไป')
    description = db.Column(db.Text, default='')
    cover_image = db.Column(db.String(500), default='')
    images_data = db.Column(db.Text, default='[]')  # JSON array of image URLs
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def images(self):
        try:
            return json.loads(self.images_data) if self.images_data else []
        except (json.JSONDecodeError, TypeError):
            return []

    @images.setter
    def images(self, val):
        if isinstance(val, list):
            self.images_data = json.dumps(val)
        elif isinstance(val, str):
            self.images_data = val
        else:
            self.images_data = '[]'

    def to_dict(self):
        imgs = self.images
        cover = self.cover_image or (imgs[0] if imgs else '')
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'coverImage': cover,
            'images': imgs,
            'sortOrder': self.sort_order,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
