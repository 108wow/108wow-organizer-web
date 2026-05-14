from app import create_app, db
from app.models.company import CompanyInfo, CompanyStat

app = create_app()
with app.app_context():
    info = CompanyInfo.query.get(1)
    if info:
        info.name = '108 WOWSPORT DAY ORGANIZER'
        info.about = '''เปลี่ยนทุกไอเดียให้เป็นความประทับใจไปกับ 108 🚀 เราคือ Organizer สายครีเอทีฟที่รับจัดงานทุกรูปแบบ: งานอีเว้นท์ กีฬาสี ปาร์ตี้ สัมมนา ทีมบิวดิ้ง ทริปท่องเที่ยว ประสบการณ์ 14 ปีเป็นประกัน พร้อมเสิร์ฟความสนุกและงานคุณภาพระดับพรีเมียมให้คุณถึงที่ ทุกทริป ทุกกิจกรรม ดีไซน์ความต่าง ที่มากกว่าเที่ยว เรามีความเชี่ยวชาญ ในการออกแบบทริป รูปแบบการท่องเที่ยวที่แตกต่าง ที่เต็มไปด้วยความสนุก และคุณภาพ ด้วยงานบริการอันเป็นเลิศ ตามมาตราฐาน MICE โดยถือว่า ” ความสุขและรอยยิ้ม ” ของลูกค้าคือเป้าหมายสำคัญ'''
        info.tagline = 'เปลี่ยนทุกไอเดียให้เป็นความประทับใจไปกับ 108 🚀'
        info.mission = '” ความสุขและรอยยิ้ม ” ของลูกค้าคือเป้าหมายสำคัญ'
        info.vision = 'ดีไซน์ความต่าง ที่มากกว่าเที่ยว พร้อมเสิร์ฟความสนุกและงานคุณภาพระดับพรีเมียม'

    stats = CompanyStat.query.all()
    if len(stats) > 0:
        stats[0].value = '14'
        stats[0].label = 'ปีประสบการณ์'

    db.session.commit()
    print('Company info updated successfully!')
