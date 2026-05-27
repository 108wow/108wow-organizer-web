from app import db
from datetime import datetime
import json


class BlogEditHistory(db.Model):
    __tablename__ = 'blog_edit_history'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    blog_post_id = db.Column(db.Integer, db.ForeignKey('blog_posts.id', ondelete='CASCADE'), nullable=False)
    edited_by = db.Column(db.String(100), default='')
    edited_at = db.Column(db.DateTime, default=datetime.utcnow)
    change_summary = db.Column(db.Text, default='')
    fields_changed = db.Column(db.Text, default='[]')  # JSON array of field names

    blog_post = db.relationship('BlogPost', backref=db.backref('edit_history', lazy=True,
                                                                cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'blog_post_id': self.blog_post_id,
            'edited_by': self.edited_by,
            'edited_at': self.edited_at.isoformat() if self.edited_at else None,
            'change_summary': self.change_summary,
            'fields_changed': json.loads(self.fields_changed) if self.fields_changed else [],
        }
