from app import db
from datetime import datetime


class BlogPost(db.Model):
    __tablename__ = 'blog_posts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    excerpt = db.Column(db.Text, default='')
    content = db.Column(db.Text, default='')          # HTML content from Rich Text Editor
    image = db.Column(db.String(500), default='')     # Cover image
    author = db.Column(db.String(100), default='')
    tag = db.Column(db.String(100), default='')
    status = db.Column(db.String(20), default='draft')  # draft / published
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_history=False):
        result = {
            'id': self.id,
            'title': self.title,
            'excerpt': self.excerpt,
            'content': self.content,
            'image': self.image,
            'author': self.author,
            'tag': self.tag,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_history and hasattr(self, 'edit_history'):
            result['edit_history'] = [h.to_dict() for h in
                                      sorted(self.edit_history, key=lambda x: x.edited_at, reverse=True)]
        return result
