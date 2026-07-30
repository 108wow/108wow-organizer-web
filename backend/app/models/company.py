from app import db


class CompanyInfo(db.Model):
    """Singleton — only 1 row (id=1)"""
    __tablename__ = 'company_info'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), default='SUSPENDED TECH')
    footer_name = db.Column(db.String(255), default='')
    tagline = db.Column(db.String(255), default='')
    about = db.Column(db.Text, default='')
    mission = db.Column(db.Text, default='')
    vision = db.Column(db.Text, default='')
    address = db.Column(db.Text, default='')
    phone = db.Column(db.String(50), default='')
    email = db.Column(db.String(100), default='')
    office_hours = db.Column(db.String(255), default='จันทร์ - ศุกร์ 09:00 - 18:00\nปิดเสาร์-อาทิตย์')
    logo_url = db.Column(db.String(500), default='')
    google_map_embed = db.Column(db.Text, default='')
    facebook = db.Column(db.String(500), default='')
    show_facebook = db.Column(db.Boolean, default=True)
    line_id = db.Column(db.String(255), default='')
    show_line = db.Column(db.Boolean, default=True)
    instagram = db.Column(db.String(500), default='')
    show_instagram = db.Column(db.Boolean, default=True)
    cta_title = db.Column(db.String(255), default='พร้อมเปลี่ยนไอเดียให้เป็นงานสุดว้าวหรือยัง?')
    cta_subtitle = db.Column(db.Text, default='ไม่ว่าจะเป็นงานกีฬาปาร์ตี้ สัมมนา หรือทีมบิวดิ้ง เราพร้อมดูแลทุกขั้นตอนให้งานของคุณออกมาสมบูรณ์แบบที่สุด ทักมาคุยกันได้เลย!')
    cta_button_text = db.Column(db.String(100), default='ทักมาคุยกับเรา')
    cta_button_link = db.Column(db.String(255), default='/contact')
    primary_color = db.Column(db.String(50), default='#a3d900')
    navy_color = db.Column(db.String(50), default='#0f172a')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'footerName': self.footer_name or self.name,
            'tagline': self.tagline,
            'about': self.about,
            'mission': self.mission,
            'vision': self.vision,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'officeHours': self.office_hours or '',
            'logoUrl': self.logo_url,
            'googleMapEmbed': self.google_map_embed or '',
            'facebook': self.facebook or '',
            'showFacebook': self.show_facebook if self.show_facebook is not None else True,
            'lineId': self.line_id or '',
            'showLine': self.show_line if self.show_line is not None else True,
            'instagram': self.instagram or '',
            'showInstagram': self.show_instagram if self.show_instagram is not None else True,
            'ctaTitle': self.cta_title,
            'ctaSubtitle': self.cta_subtitle,
            'ctaButtonText': self.cta_button_text,
            'ctaButtonLink': self.cta_button_link,
            'primaryColor': self.primary_color or '#a3d900',
            'navyColor': self.navy_color or '#0f172a',
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
