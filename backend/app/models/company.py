from app import db


class CompanyInfo(db.Model):
    """Singleton — only 1 row (id=1)"""
    __tablename__ = 'company_info'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), default='SUSPENDED TECH')
    tagline = db.Column(db.String(255), default='')
    about = db.Column(db.Text, default='')
    mission = db.Column(db.Text, default='')
    vision = db.Column(db.Text, default='')
    address = db.Column(db.Text, default='')
    phone = db.Column(db.String(50), default='')
    email = db.Column(db.String(100), default='')
    logo_url = db.Column(db.String(500), default='')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'tagline': self.tagline,
            'about': self.about,
            'mission': self.mission,
            'vision': self.vision,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'logoUrl': self.logo_url,
        }


class CompanyStat(db.Model):
    __tablename__ = 'company_stats'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    label = db.Column(db.String(100), nullable=False)
    value = db.Column(db.String(50), default='0')
    sort_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'label': self.label,
            'value': self.value,
            'sortOrder': self.sort_order,
        }
