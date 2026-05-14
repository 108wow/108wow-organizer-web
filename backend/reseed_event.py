from app import create_app, db
from app.models.hero import HeroSlide
from app.models.service import Service
from app.models.gallery import GalleryItem
from app.models.blog import BlogPost
from app.models.team import TeamMember
from app.models.client import Client
from app.models.company import CompanyStat
from app.models.page_hero import PageHero
from app.models.about_config import AboutConfig
import json

def reseed_event():
    app = create_app()
    with app.app_context():
        # Clear existing data
        HeroSlide.query.delete()
        Service.query.delete()
        GalleryItem.query.delete()
        BlogPost.query.delete()
        TeamMember.query.delete()
        Client.query.delete()
        CompanyStat.query.delete()
        PageHero.query.delete()
        AboutConfig.query.delete()

        # ─── Hero Slides ───
        heroes = [
            HeroSlide(title='รับจัดกิจกรรม ทุกรูปแบบ', ghost_text='ORGANIZER',
                       subtitle='กีฬาสี ปาร์ตี้ สัมมนา ทีมบิวดิ้ง ทริปท่องเที่ยว พร้อมเสิร์ฟความสนุกและคุณภาพระดับพรีเมียม',
                       image='https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=80', sort_order=1),
            HeroSlide(title='ดีไซน์ความต่าง ที่มากกว่าเที่ยว', ghost_text='TRAVEL',
                       subtitle='ออกแบบทริปและรูปแบบการท่องเที่ยวที่แตกต่าง เต็มไปด้วยความสนุกและรอยยิ้ม',
                       image='https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=1920&q=80', sort_order=2),
            HeroSlide(title='ประสบการณ์ 14 ปีเป็นประกัน', ghost_text='EXPERIENCE',
                       subtitle='บริการระดับมาตรฐาน MICE เปลี่ยนทุกไอเดียให้เป็นความประทับใจ',
                       image='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80', sort_order=3),
        ]
        db.session.add_all(heroes)

        # ─── Services ───
        services_data = [
            ('Team Building', 'กิจกรรมสร้างความสัมพันธ์ในองค์กร เสริมสร้างความสามัคคีและละลายพฤติกรรม', 'bi-people-fill', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80'),
            ('Sport Day', 'จัดงานกีฬาสีสุดมันส์ อุปกรณ์ครบครัน พร้อมทีมงานดำเนินกิจกรรมมืออาชีพ', 'bi-trophy-fill', 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600&q=80'),
            ('Company Outing', 'ทริปท่องเที่ยวประจำปี ที่มากกว่าการพักผ่อน แต่ได้ความทรงจำที่ยอดเยี่ยม', 'bi-airplane-fill', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80'),
            ('Party & Event', 'จัดงานเลี้ยงสังสรรค์ ปาร์ตี้ปีใหม่ งานกาล่าดินเนอร์ สุดอลังการ', 'bi-music-note-beamed', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'),
            ('Seminar & MICE', 'รับจัดงานสัมมนา ประชุมวิชาการ ระดับมาตรฐานสากล', 'bi-mic-fill', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80'),
            ('CSR Activities', 'กิจกรรมเพื่อสังคม คืนกำไรสู่สังคม สร้างภาพลักษณ์ที่ดีให้องค์กร', 'bi-heart-fill', 'https://images.unsplash.com/photo-1593113589914-00efce30a35f?w=600&q=80'),
            ('Event Production', 'ระบบแสง สี เสียง เวที และโปรดักชั่นแบบครบวงจร', 'bi-speaker-fill', 'https://images.unsplash.com/photo-1470229722913-7c090be5c5a4?w=600&q=80'),
            ('Virtual & Hybrid Event', 'งานอีเวนต์ออนไลน์และไฮบริด ตอบโจทย์ยุคดิจิทัล', 'bi-laptop', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&q=80'),
        ]
        for i, (title, desc, icon, img) in enumerate(services_data):
            db.session.add(Service(title=title, description=desc, icon=icon, image=img, sort_order=i+1))

        # ─── Gallery ───
        gallery_data = [
            ('กีฬาสีสุดมันส์ ประจำปี', 'Sport Day', 'ภาพบรรยากาศความสนุกสนานและสามัคคีในงานกีฬาสี', 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600&q=80'),
            ('Team Building ริมหาด', 'Team Building', 'กิจกรรมละลายพฤติกรรมและสร้างทีมเวิร์คที่ริมทะเล', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80'),
            ('Gala Dinner สุดหรู', 'Party', 'งานเลี้ยงขอบคุณพนักงานและฉลองความสำเร็จประจำปี', 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&q=80'),
            ('สัมมนาวิชาการระดับชาติ', 'Seminar', 'งานประชุมที่ได้มาตรฐาน MICE พร้อมระบบสมบูรณ์แบบ', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80'),
            ('Company Outing ลุยป่า', 'Trip', 'ทริปท่องเที่ยวเชิงผจญภัย สร้างประสบการณ์ใหม่ให้ทีม', 'https://images.unsplash.com/photo-1504280390227-351a2d05f0ba?w=600&q=80'),
            ('CSR ปลูกป่าชายเลน', 'CSR', 'กิจกรรมช่วยเหลือสังคมและสิ่งแวดล้อม', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80'),
        ]
        for i, (title, cat, desc, img) in enumerate(gallery_data):
            db.session.add(GalleryItem(title=title, category=cat, description=desc, image=img, sort_order=i+1))

        # ─── Blog ───
        blogs = [
            BlogPost(title='5 ไอเดียจัดงานกีฬาสีบริษัท ให้สนุกและปลอดภัย',
                     excerpt='รวมไอเดียเกมและการจัดการงานกีฬาสีให้ทุกคนมีส่วนร่วมและปลอดภัย',
                     tag='Sport Day', date='15 พ.ค. 2026', author='ทีมงาน 108',
                     image='https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600&q=80', status='published'),
            BlogPost(title='ทำไม Team Building ถึงสำคัญต่อองค์กร?',
                     excerpt='เรียนรู้ประโยชน์ของการทำกิจกรรมละลายพฤติกรรมที่มีต่อประสิทธิภาพการทำงาน',
                     tag='Team Building', date='10 พ.ค. 2026', author='ทีมงาน 108',
                     image='https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80', status='published'),
            BlogPost(title='เทรนด์การจัด Company Outing ปี 2026',
                     excerpt='อัปเดตสถานที่และรูปแบบทริปประจำปีที่พนักงานยุคใหม่ชื่นชอบ',
                     tag='Outing', date='05 พ.ค. 2026', author='ทีมงาน 108',
                     image='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80', status='published'),
        ]
        db.session.add_all(blogs)

        # ─── Team ───
        team_data = [
            ('ผู้บริหารจัดงาน', 'Event Director', 'เชี่ยวชาญการวางแผนงานระดับประเทศ', 'https://randomuser.me/api/portraits/men/32.jpg'),
            ('ครีเอทีฟไอเดีย', 'Creative Director', 'ผู้สร้างสรรค์ธีมงานและโชว์สุดอลังการ', 'https://randomuser.me/api/portraits/women/44.jpg'),
            ('หัวหน้าทีมสันทนาการ', 'Activity Lead', 'เอ็นเตอร์เทนเนอร์มืออาชีพ สร้างเสียงหัวเราะ', 'https://randomuser.me/api/portraits/men/67.jpg'),
            ('ผู้จัดการฝ่ายผลิต', 'Production Manager', 'ดูแลระบบแสง สี เสียง เวที แบบไร้ที่ติ', 'https://randomuser.me/api/portraits/women/68.jpg'),
        ]
        for i, (name, pos, bio, photo) in enumerate(team_data):
            db.session.add(TeamMember(name=name, position=pos, bio=bio, photo=photo, facebook='#', linkedin='#', sort_order=i+1))

        # ─── Clients ───
        clients_data = [
            ('PTT', 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/PTT_Public_Company_Limited_Logo.svg/1200px-PTT_Public_Company_Limited_Logo.svg.png', 'Corporate'),
            ('SCG', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/SCG_logo.svg/1200px-SCG_logo.svg.png', 'Corporate'),
            ('CP ALL', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/CP_All_logo.svg/1200px-CP_All_logo.svg.png', 'Corporate'),
            ('AIS', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/AIS_logo.svg/1200px-AIS_logo.svg.png', 'Corporate'),
            ('True', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/True_Corporation_logo.svg/1200px-True_Corporation_logo.svg.png', 'Corporate'),
            ('KBank', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Kasikornbank_logo.svg/1200px-Kasikornbank_logo.svg.png', 'Corporate'),
        ]
        for name, logo, cat in clients_data:
            db.session.add(Client(name=name, logo=logo, category=cat))

        # ─── Company Stats ───
        stats_data = [('ปีแห่งความสำเร็จ', '14'), ('กิจกรรมที่จัดมาแล้ว', '1,000+'), ('ผู้เข้าร่วมงานรวม', '150k+'), ('ทีมงานมืออาชีพ', '80+')]
        for i, (label, value) in enumerate(stats_data):
            db.session.add(CompanyStat(label=label, value=value, sort_order=i+1))

        # ─── Page Heroes ───
        page_heroes_data = {
            'about': ('เกี่ยวกับ 108 Organizer', 'เบื้องหลังความสำเร็จและรอยยิ้มในทุกกิจกรรม', 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1920&q=80'),
            'services': ('บริการของเรา', 'รับจัดกิจกรรมทุกรูปแบบ ด้วยทีมงานมืออาชีพ', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80'),
            'gallery': ('ผลงานที่ผ่านมา', 'ภาพความประทับใจจากหลากหลายองค์กรชั้นนำ', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80'),
            'blog': ('บทความ & ไอเดีย', 'สาระความรู้และไอเดียการจัดงานที่น่าสนใจ', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1920&q=80'),
            'team': ('ทีมงานคุณภาพ', 'ผู้อยู่เบื้องหลังการรังสรรค์ความสนุกให้องค์กรคุณ', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80'),
            'clients': ('ลูกค้าที่ไว้วางใจ', 'ขอบคุณทุกองค์กรที่เลือกใช้บริการ 108 Organizer', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1920&q=80'),
            'contact': ('ติดต่อเรา', 'พร้อมให้คำปรึกษาและออกแบบกิจกรรมสำหรับคุณโดยเฉพาะ', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1920&q=80'),
        }
        for key, (title, subtitle, image) in page_heroes_data.items():
            db.session.add(PageHero(page_key=key, title=title, subtitle=subtitle, image=image))

        # ─── About Config ───
        db.session.add(AboutConfig(
            id=1,
            video_thumbnail='https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
            video_url='https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1',
            core_values=json.dumps([
                {'icon': 'bi-emoji-smile-fill', 'title': 'เน้นรอยยิ้มและความสุขของลูกค้า'},
                {'icon': 'bi-star-fill', 'title': 'คุณภาพและมาตรฐานระดับ MICE'},
                {'icon': 'bi-lightning-fill', 'title': 'ครีเอทีฟและดีไซน์ความต่าง'},
                {'icon': 'bi-shield-check-fill', 'title': 'ปลอดภัยและดูแลอย่างมืออาชีพ'}
            ]),
            team_images=json.dumps([
                'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
                'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80'
            ]),
            banners=json.dumps([
                {'image': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&q=80', 'title': 'พร้อมหรือยัง? ที่จะเปลี่ยนปาร์ตี้ธรรมดา ให้เป็นความทรงจำที่ดีที่สุด'},
                {'image': 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=1000&q=80', 'title': 'ออกแบบความสนุกในแบบของคุณ ปรึกษาเราฟรี!'}
            ]),
            timeline=json.dumps([
                {'year': '2012', 'title': 'จุดเริ่มต้น 108', 'desc': 'รวมกลุ่มทีมงานสายสันทนาการที่รักความสนุก'},
                {'year': '2016', 'title': 'ขยายสู่ Corporate', 'desc': 'รับจัดงาน Team Building ให้บริษัทชั้นนำ'},
                {'year': '2020', 'title': 'มาตรฐาน MICE', 'desc': 'ยกระดับบริการสู่มาตรฐานสากลเต็มรูปแบบ'},
                {'year': '2026', 'title': 'ผู้นำ Organizer', 'desc': 'บริการครบวงจรมากกว่า 1,000 โปรเจกต์'}
            ])
        ))

        db.session.commit()
        print('Database re-seeded with Event Organizer theme successfully!')

if __name__ == '__main__':
    reseed_event()
