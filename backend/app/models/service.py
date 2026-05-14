from app import db


class Service(db.Model):
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    icon = db.Column(db.String(100), default='bi-code-slash')
    image = db.Column(db.String(500), default='')
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'icon': self.icon,
            'image': self.image,
            'isActive': self.is_active,
            'sortOrder': self.sort_order,
        }
