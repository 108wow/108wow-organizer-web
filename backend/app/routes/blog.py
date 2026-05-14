from flask import Blueprint, request, jsonify
from app import db
from app.models.blog import BlogPost
from app.routes.auth import token_required

blog_bp = Blueprint('blog', __name__)


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
    return jsonify(post.to_dict())


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
        date=data.get('date', ''),
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
    for key, attr in [('title', 'title'), ('excerpt', 'excerpt'), ('content', 'content'),
                      ('image', 'image'), ('author', 'author'), ('date', 'date'),
                      ('tag', 'tag'), ('status', 'status')]:
        if key in data:
            setattr(post, attr, data[key])
    db.session.commit()
    return jsonify(post.to_dict())


@blog_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_post(current_user, id):
    post = db.session.get(BlogPost, id)
    if not post:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
