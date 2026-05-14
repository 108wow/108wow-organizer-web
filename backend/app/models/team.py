from app import db


class TeamMember(db.Model):
    __tablename__ = 'team_members'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    position = db.Column(db.String(255), default='')
    bio = db.Column(db.Text, default='')
    photo = db.Column(db.String(500), default='')
    facebook = db.Column(db.String(300), default='')
    linkedin = db.Column(db.String(300), default='')
    sort_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'position': self.position,
            'bio': self.bio,
            'photo': self.photo,
            'facebook': self.facebook,
            'linkedin': self.linkedin,
            'sortOrder': self.sort_order,
        }
