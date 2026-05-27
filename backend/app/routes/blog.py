from flask import Blueprint, request, jsonify
from app import db
from app.models.blog import BlogPost
from app.models.blog_edit_history import BlogEditHistory
from app.routes.auth import token_required
import json

blog_bp = Blueprint('blog', __name__)

TRACKED_FIELDS = ['title', 'excerpt', 'content', 'image', 'author', 'tag', 'status']
FIELD_LABELS = {
    'title': 'หัวข้อ',
    'excerpt': 'เนื้อหาย่อ',
    'content': 'เนื้อหาเต็ม',
    'image': 'ภาพปก',
    'author': 'ผู้เขียน',
    'tag': 'แท็ก',
    'status': 'สถานะ',
}


@blog_bp.route('', methods=['GET'])
def list_published():
    """Public: only published posts"""
    posts = BlogPost.query.filter_by(status='published').order_by(BlogPost.created_at.desc()).all()
    return jsonify([p.to_dict() for p in posts])


@blog_bp.route('/all', methods=['GET'])
@token_required
def list_all(current_user):
    """Admin: all posts including drafts"""
    posts = BlogPost.query.order_by(BlogPost.created_at.desc()).all()
    return jsonify([p.to_dict() for p in posts])


@blog_bp.route('/<int:id>', methods=['GET'])
def get_post(id):
    post = db.session.get(BlogPost, id)
    if not post:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(post.to_dict(include_history=True))


@blog_bp.route('', methods=['POST'])
@token_required
def create_post(current_user):
    data = request.get_json()
    post = BlogPost(
        title=data.get('title', ''),
        excerpt=data.get('excerpt', ''),
        content=data.get('content', ''),
        image=data.get('image', ''),
        author=data.get('author', ''),
        tag=data.get('tag', ''),
        status=data.get('status', 'draft'),
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201


@blog_bp.route('/<int:id>', methods=['PUT'])
@token_required
def update_post(current_user, id):
    post = db.session.get(BlogPost, id)
    if not post:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json()

    # Track what changed
    changed_fields = []
    for key in TRACKED_FIELDS:
        if key in data:
            old_val = getattr(post, key, '') or ''
            new_val = data[key] or ''
            if old_val != new_val:
                changed_fields.append(key)

    # Apply updates
    for key in TRACKED_FIELDS:
        if key in data:
            setattr(post, key, data[key])

    # Record edit history if something changed
    if changed_fields:
        # Build human-readable summary
        change_summary = data.get('change_summary', '')
        if not change_summary:
            labels = [FIELD_LABELS.get(f, f) for f in changed_fields]
            change_summary = 'แก้ไข: ' + ', '.join(labels)

        history = BlogEditHistory(
            blog_post_id=post.id,
            edited_by=getattr(current_user, 'username', 'admin'),
            change_summary=change_summary,
            fields_changed=json.dumps(changed_fields, ensure_ascii=False),
        )
        db.session.add(history)

    db.session.commit()
    return jsonify(post.to_dict(include_history=True))


@blog_bp.route('/<int:id>/history', methods=['GET'])
def get_post_history(id):
    """Get edit history for a blog post"""
    post = db.session.get(BlogPost, id)
    if not post:
        return jsonify({'error': 'Not found'}), 404
    history = BlogEditHistory.query.filter_by(blog_post_id=id).order_by(BlogEditHistory.edited_at.desc()).all()
    return jsonify([h.to_dict() for h in history])


@blog_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_post(current_user, id):
    post = db.session.get(BlogPost, id)
    if not post:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
