"""
Seed the database with mock data (matching frontend mockData.js).
Run: python -c "from app.seed import seed_all; seed_all()"
"""
from app import create_app, db
from app.models.hero import HeroSlide
from app.models.service import Service
from app.models.gallery import GalleryItem
from app.models.blog import BlogPost
from app.models.team import TeamMember
from app.models.client import Client
from app.models.company import CompanyInfo, CompanyStat
from app.models.page_hero import PageHero
from app.models.home_config import HomeConfig
from app.models.about_config import AboutConfig
from app.models.contact import ContactMessage
from app.models.user import AdminUser
import json


def seed_all():
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()

        # Skip if data already exists
        if HeroSlide.query.first():
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # ─── Hero Slides ───
        heroes = [
            HeroSlide(title='นวัตกรรมดิจิทัล เพื่อธุรกิจยุคใหม่', ghost_text='INNOVATION',
                       subtitle='เราคือพาร์ทเนอร์ด้านเทคโนโลยีที่จะพาธุรกิจของคุณก้าวไปอีกขั้น ด้วยโซลูชันที่ออกแบบมาเฉพาะสำหรับคุณ',
                       image='https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80', sort_order=1),
            HeroSlide(title='ออกแบบ พัฒนา ส่งมอบ', ghost_text='DESIGN',
                       subtitle='ทีมผู้เชี่ยวชาญพร้อมสร้างสรรค์ผลงานคุณภาพ ตั้งแต่ไอเดียจนถึงผลลัพธ์ที่จับต้องได้',
                       image='https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80', sort_order=2),
            HeroSlide(title='เชื่อมต่อโลกด้วยเทคโนโลยี', ghost_text='CONNECT',
                       subtitle='โซลูชันครบวงจร Web, Mobile, Cloud ที่ตอบโจทย์ทุกความต้องการ',
                       image='https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80', sort_order=3),
        ]
        db.session.add_all(heroes)

        # ─── Services ───
        services_data = [
            ('Web Development', 'พัฒนาเว็บไซต์และเว็บแอปพลิเคชัน ด้วยเทคโนโลยีล่าสุด ตอบโจทย์ทุกธุรกิจ', 'bi-code-slash', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80'),
            ('Mobile App', 'สร้างแอปมือถือ iOS และ Android ที่สวยงามและใช้งานง่าย', 'bi-phone', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80'),
            ('UI/UX Design', 'ออกแบบ User Interface และ Experience ที่เข้าใจง่ายและน่าใช้', 'bi-palette', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80'),
            ('Cloud Solutions', 'ออกแบบและวางระบบ Cloud Infrastructure ที่ปลอดภัยและ scalable', 'bi-cloud-check', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&q=80'),
            ('Data Analytics', 'วิเคราะห์ข้อมูลเชิงลึก ช่วยตัดสินใจทางธุรกิจได้อย่างแม่นยำ', 'bi-graph-up-arrow', 'https://images.unsplash.com/photo-1560439514-4e9645039924?w=400&q=80'),
            ('Consulting', 'ให้คำปรึกษาด้านเทคโนโลยีครบวงจร วางแผนกลยุทธ์ดิจิทัล', 'bi-lightbulb', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80'),
            ('SEO Optimization', 'ปรับแต่งเว็บไซต์ให้ติดอันดับหน้าแรกของ Google เพิ่มยอดผู้เข้าชม', 'bi-search', 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&q=80'),
            ('Cyber Security', 'ปกป้องระบบและข้อมูลสำคัญของธุรกิจคุณจากภัยคุกคามทางไซเบอร์', 'bi-shield-lock', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80'),
        ]
        for i, (title, desc, icon, img) in enumerate(services_data):
            db.session.add(Service(title=title, description=desc, icon=icon, image=img, sort_order=i+1))

        # ─── Gallery ───
        gallery_data = [
            ('E-Commerce Platform', 'Web', 'แพลตฟอร์มช้อปปิ้งออนไลน์ที่รองรับผู้ใช้งานกว่าแสนคน', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'),
            ('Banking Mobile App', 'Mobile', 'แอปพลิเคชันการเงินที่เน้นความปลอดภัยและ UX ที่ยอดเยี่ยม', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80'),
            ('Dashboard Analytics', 'Web', 'ระบบจัดการข้อมูลและออกรายงานสำหรับองค์กรขนาดใหญ่', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80'),
            ('Travel Application', 'Mobile', 'แอปวางแผนการท่องเที่ยวพร้อมระบบจองอัจฉริยะ', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80'),
            ('Restaurant System', 'Web', 'ระบบจัดการร้านอาหารและสั่งอาหารผ่านคิวอาร์โค้ด', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80'),
            ('Healthcare Platform', 'Design', 'ออกแบบระบบ Telemedicine สำหรับปรึกษาแพทย์ออนไลน์', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80'),
        ]
        for i, (title, cat, desc, img) in enumerate(gallery_data):
            db.session.add(GalleryItem(title=title, category=cat, description=desc, image=img, sort_order=i+1))

        # ─── Blog ───
        blogs = [
            BlogPost(title='เทรนด์เทคโนโลยี 2026 ที่ธุรกิจต้องรู้',
                     excerpt='สำรวจเทคโนโลยีล่าสุดที่จะเปลี่ยนโลกธุรกิจในปีนี้ ตั้งแต่ AI จนถึง Quantum Computing',
                     tag='Technology', date='20 เม.ย. 2026', author='สมชาย วิทยากร',
                     image='https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80', status='published'),
            BlogPost(title='วิธีเลือก Tech Stack ที่เหมาะกับโปรเจกต์',
                     excerpt='คู่มือการเลือกเทคโนโลยีที่เหมาะสม ช่วยให้โปรเจกต์ของคุณประสบความสำเร็จ',
                     tag='Development', date='15 เม.ย. 2026', author='พิมพ์ พัฒนา',
                     image='https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80', status='published'),
            BlogPost(title='UX Design สำหรับ Mobile-First',
                     excerpt='เคล็ดลับการออกแบบ UX ที่ดีสำหรับแอปมือถือ เพิ่มการมีส่วนร่วมของผู้ใช้',
                     tag='Design', date='10 เม.ย. 2026', author='กิตติ ดีไซน์',
                     image='https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&q=80', status='published'),
        ]
        db.session.add_all(blogs)

        # ─── Team ───
        team_data = [
            ('สมชาย วิทยากร', 'CEO & Founder', 'ผู้ก่อตั้งและผู้นำวิสัยทัศน์', 'https://randomuser.me/api/portraits/men/32.jpg'),
            ('สุดา เทคโนโลยี', 'CTO', 'ผู้เชี่ยวชาญด้านเทคโนโลยี', 'https://randomuser.me/api/portraits/women/44.jpg'),
            ('กิตติ ดีไซน์', 'Lead Designer', 'นักออกแบบ UX/UI มากประสบการณ์', 'https://randomuser.me/api/portraits/men/67.jpg'),
            ('พิมพ์ พัฒนา', 'Senior Developer', 'Full-stack developer มืออาชีพ', 'https://randomuser.me/api/portraits/women/68.jpg'),
            ('ธนา มาร์เก็ต', 'Marketing Director', 'ผู้เชี่ยวชาญการตลาดดิจิทัล', 'https://randomuser.me/api/portraits/men/75.jpg'),
            ('นารี โปรเจกต์', 'Project Manager', 'ผู้จัดการโปรเจกต์คุณภาพ', 'https://randomuser.me/api/portraits/women/65.jpg'),
        ]
        for i, (name, pos, bio, photo) in enumerate(team_data):
            db.session.add(TeamMember(name=name, position=pos, bio=bio, photo=photo, facebook='#', linkedin='#', sort_order=i+1))

        # ─── Clients ───
        clients_data = [
            ('Google', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/google.svg', 'Technology'),
            ('Microsoft', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoft.svg', 'Technology'),
            ('Amazon', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazon.svg', 'Technology'),
            ('Meta', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/meta.svg', 'Technology'),
            ('Apple', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/apple.svg', 'Technology'),
            ('GitHub', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/github.svg', 'Technology'),
            ('GitLab', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/gitlab.svg', 'Technology'),
            ('Docker', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/docker.svg', 'Technology'),
            ('Spotify', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/spotify.svg', 'Social & Media'),
            ('Netflix', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/netflix.svg', 'Social & Media'),
            ('LinkedIn', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg', 'Social & Media'),
            ('Twitter', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/x.svg', 'Social & Media'),
            ('YouTube', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg', 'Social & Media'),
            ('TikTok', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg', 'Social & Media'),
            ('Line', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/line.svg', 'Social & Media'),
            ('Slack', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/slack.svg', 'Social & Media'),
            ('IBM', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ibm.svg', 'Enterprise & Cloud'),
            ('Intel', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/intel.svg', 'Enterprise & Cloud'),
            ('Oracle', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/oracle.svg', 'Enterprise & Cloud'),
            ('SAP', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/sap.svg', 'Enterprise & Cloud'),
            ('Salesforce', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/salesforce.svg', 'Enterprise & Cloud'),
            ('Adobe', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/adobe.svg', 'Enterprise & Cloud'),
            ('Shopify', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/shopify.svg', 'Enterprise & Cloud'),
            ('Stripe', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/stripe.svg', 'Enterprise & Cloud'),
            ('Figma', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/figma.svg', 'Enterprise & Cloud'),
            ('Notion', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/notion.svg', 'Enterprise & Cloud'),
            ('Zoom', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/zoom.svg', 'Enterprise & Cloud'),
            ('Grab', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/grab.svg', 'Enterprise & Cloud'),
            ('Agoda', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/agoda.svg', 'Enterprise & Cloud'),
            ('Samsung', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/samsung.svg', 'Hardware & Automotive'),
            ('NVIDIA', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nvidia.svg', 'Hardware & Automotive'),
            ('Tesla', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tesla.svg', 'Hardware & Automotive'),
            ('Sony', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/sony.svg', 'Hardware & Automotive'),
            ('LG', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/lg.svg', 'Hardware & Automotive'),
            ('Huawei', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/huawei.svg', 'Hardware & Automotive'),
            ('Xiaomi', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/xiaomi.svg', 'Hardware & Automotive'),
        ]
        for name, logo, cat in clients_data:
            db.session.add(Client(name=name, logo=logo, category=cat))

        # ─── Company Info ───
        db.session.add(CompanyInfo(
            id=1,
            name='SUSPENDED TECH',
            tagline='Innovation Simplified',
            about='SUSPENDED TECH ก่อตั้งขึ้นด้วยความมุ่งมั่นที่จะนำเทคโนโลยีดิจิทัลมาช่วยยกระดับธุรกิจไทย เราเชื่อว่าเทคโนโลยีที่ดีต้องเข้าถึงง่ายและสร้างคุณค่าที่แท้จริง',
            mission='สร้างสรรค์โซลูชันเทคโนโลยีที่เปลี่ยนแปลงวิธีการทำธุรกิจ ให้เข้าถึงง่ายและมีประสิทธิภาพสูงสุด',
            vision='เป็นผู้นำด้านเทคโนโลยีดิจิทัลในภูมิภาคเอเชียตะวันออกเฉียงใต้ ที่ได้รับความไว้วางใจจากองค์กรชั้นนำ',
            address='123 อาคารอินโนเวชั่น ถ.สุขุมวิท กรุงเทพฯ 10110',
            phone='+66 2 123 4567',
            email='contact@suspendedtech.com',
        ))

        # ─── Company Stats ───
        stats_data = [('ปีประสบการณ์', '10+'), ('โปรเจกต์สำเร็จ', '250+'), ('ลูกค้าที่ไว้วางใจ', '120+'), ('ทีมผู้เชี่ยวชาญ', '50+')]
        for i, (label, value) in enumerate(stats_data):
            db.session.add(CompanyStat(label=label, value=value, sort_order=i+1))

        # ─── Page Heroes ───
        page_heroes_data = {
            'about': ('เกี่ยวกับเรา', 'ทำความรู้จักกับเราและเส้นทางที่ผ่านมา', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80'),
            'services': ('บริการของเรา', 'โซลูชันครบวงจรเพื่อยกระดับธุรกิจของคุณ', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80'),
            'gallery': ('ผลงานของเรา', 'ภาพบรรยากาศและผลงานที่ผ่านมาของเรา', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80'),
            'blog': ('บทความและข่าวสาร', 'อัปเดตเทรนด์เทคโนโลยีและความรู้ใหม่ๆ', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920&q=80'),
            'team': ('ทีมงานของเรา', 'ผู้เชี่ยวชาญที่พร้อมขับเคลื่อนความสำเร็จให้คุณ', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80'),
            'clients': ('ลูกค้าของเรา', 'ความสำเร็จของลูกค้าคือความสำเร็จของเรา', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1920&q=80'),
            'contact': ('ติดต่อเรา', 'เราพร้อมรับฟังและให้คำปรึกษาสำหรับโปรเจกต์ของคุณ', 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80'),
        }
        for key, (title, subtitle, image) in page_heroes_data.items():
            db.session.add(PageHero(page_key=key, title=title, subtitle=subtitle, image=image))

        # ─── Home Config ───
        db.session.add(HomeConfig(
            id=1,
            show_about=True, show_services=True, services_limit=4,
            selected_services=json.dumps([1, 2, 3, 4, 5, 6, 7, 8]),
            show_why_us=True, show_stats=True, show_customers=True,
            customers_limit=6, show_cta=True,
        ))

        # ─── About Config ───
        db.session.add(AboutConfig(
            id=1,
            video_thumbnail='https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
            video_url='https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1',
            core_values=json.dumps([
                {'icon': 'bi-heart-fill', 'title': 'มีความรัก ความเข้าใจต่อกัน'},
                {'icon': 'bi-people-fill', 'title': 'ซื่อสัตย์ สามัคคี รักในองค์กร'},
                {'icon': 'bi-star-fill', 'title': 'ทำงานด้วยความสุข มุ่งสู่ความสำเร็จ'},
                {'icon': 'bi-lightbulb-fill', 'title': 'สร้างสรรค์และพัฒนาตนเองอยู่เสมอ'}
            ]),
            team_images=json.dumps([
                'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
                'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80'
            ]),
            banners=json.dumps([
                {'image': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80', 'title': 'กิจกรรมสันทนาการที่พร้อมตอบสนองทุกเป้าหมาย'},
                {'image': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1000&q=80', 'title': 'คุณพร้อมแล้วหรือยัง ที่จะพัฒนาสู่ความสำเร็จครั้งใหม่'}
            ]),
            timeline=json.dumps([
                {'year': '2016', 'title': 'ก่อตั้งบริษัท', 'desc': 'ทีมเล็กๆ 3 คน'},
                {'year': '2019', 'title': 'ขยายทีมงาน', 'desc': 'เติบโตสู่ 20 คน'},
                {'year': '2022', 'title': 'สำนักงานใหม่', 'desc': 'ใจกลางสุขุมวิท'},
                {'year': '2026', 'title': 'ผู้นำตลาด', 'desc': 'ผู้นำเทคโนโลยี'}
            ])
        ))

        # ─── Default Admin User (plain text password) ───
        db.session.add(AdminUser(
            username='admin',
            password='admin123',  # Plain text — dual-mode login will match this
            display_name='Admin User',
        ))

        db.session.commit()
        print("[OK] Database seeded successfully!")
        print("   Admin login: username=admin, password=admin123")


if __name__ == '__main__':
    seed_all()
