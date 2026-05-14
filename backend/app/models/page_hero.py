from app import db


class PageHero(db.Model):
    __tablename__ = 'page_heroes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    page_key = db.Column(db.String(50), unique=True, nullable=False)  # about, services, gallery, etc.
    title = db.Column(db.String(255), default='')
    subtitle = db.Column(db.String(500), default='')
    image = db.Column(db.String(500), default='')

    def to_dict(self):
        return {
            'id': self.id,
            'pageKey': self.page_key,
            'title': self.title,
            'subtitle': self.subtitle,
            'image': self.image,
        }
