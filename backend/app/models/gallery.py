from app import db


class GalleryItem(db.Model):
    __tablename__ = 'gallery_items'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    category = db.Column(db.String(100), default='Web')
    image = db.Column(db.String(500), default='')
    album_url = db.Column(db.String(500), default='')
    sort_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'image': self.image,
            'albumUrl': self.album_url,
            'sortOrder': self.sort_order,
        }
