from app import db
from datetime import datetime


class BlogPost(db.Model):
    __tablename__ = 'blog_posts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    excerpt = db.Column(db.Text, default='')
    content = db.Column(db.Text, default='')
    image = db.Column(db.String(500), default='')
    author = db.Column(db.String(100), default='')
    date = db.Column(db.String(50), default='')
    tag = db.Column(db.String(100), default='')
    status = db.Column(db.String(20), default='draft')  # draft / published
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'excerpt': self.excerpt,
            'content': self.content,
            'image': self.image,
            'author': self.author,
            'date': self.date,
            'tag': self.tag,
            'status': self.status,
        }
