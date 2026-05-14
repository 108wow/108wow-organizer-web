from app import db


class HeroSlide(db.Model):
    __tablename__ = 'hero_slides'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    ghost_text = db.Column(db.String(100), default='')
    subtitle = db.Column(db.Text, default='')
    image = db.Column(db.String(500), default='')
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'ghostText': self.ghost_text,
            'subtitle': self.subtitle,
            'image': self.image,
            'isActive': self.is_active,
            'sortOrder': self.sort_order,
        }
