from app import db
import json

class AboutConfig(db.Model):
    """Singleton — only 1 row (id=1) for the About page configuration."""
    __tablename__ = 'about_config'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    video_thumbnail = db.Column(db.String(255), default='https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80')
    video_url = db.Column(db.String(255), default='https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1')
    
    # Store complex structures as JSON Text
    core_values = db.Column(db.Text, default='[]')
    team_images = db.Column(db.Text, default='[]')
    banners = db.Column(db.Text, default='[]')
    timeline = db.Column(db.Text, default='[]')

    def to_dict(self):
        try:
            core_vals = json.loads(self.core_values)
        except:
            core_vals = []
            
        try:
            team_imgs = json.loads(self.team_images)
        except:
            team_imgs = []
            
        try:
            banner_items = json.loads(self.banners)
        except:
            banner_items = []
            
        try:
            timeline_items = json.loads(self.timeline)
        except:
            timeline_items = []

        return {
            'videoThumbnail': self.video_thumbnail,
            'videoUrl': self.video_url,
            'coreValues': core_vals,
            'teamImages': team_imgs,
            'banners': banner_items,
            'timeline': timeline_items
        }
