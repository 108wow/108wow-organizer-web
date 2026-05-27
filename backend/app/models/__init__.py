# Import all models so SQLAlchemy registers them
from app.models.hero import HeroSlide
from app.models.service import Service
from app.models.gallery import GalleryItem
from app.models.blog import BlogPost
from app.models.blog_edit_history import BlogEditHistory
from app.models.team import TeamMember
from app.models.client import Client
from app.models.company import CompanyInfo, CompanyStat
from app.models.page_hero import PageHero
from app.models.home_config import HomeConfig
from app.models.contact import ContactMessage
from app.models.user import AdminUser
from app.models.about_config import AboutConfig
