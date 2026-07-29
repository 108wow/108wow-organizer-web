from app import create_app, db
from app.models.equipment import Equipment

app = create_app()
with app.app_context():
    # Only seed if table is empty
    if Equipment.query.count() == 0:
        sample_items = [
            {
                "name": "ชุดลูกบอลยักษ์สปอร์ตเดย์ (Mega Bouncing Balls)",
                "category": "อุปกรณ์เกม / สันทนาการ",
                "description": "ลูกบอลยักษ์สีสันสดใสขนาด 1.5 เมตร เหมาะสำหรับเกมแข่งขันสปอร์ตเดย์ เกมวิบาก และกิจกรรมละลายพฤติกรรมสร้างความสนุกสนานให้องค์กร",
                "cover_image": "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80"
                ],
                "sort_order": 1
            },
            {
                "name": "ชุดลำโพงและเครื่องเสียงพกพา (Outdoor Sound System)",
                "category": "เครื่องเสียง / ลำโพง",
                "description": "ชุดลำโพงคอลัมน์และเพาเวอร์แอมป์ 1000W พร้อมไมโครโฟนไร้สาย 4 ตัว คลุมพื้นที่จัดกิจกรรมกลางแจ้ง เสียงดังคมชัดรอบทิศทาง",
                "cover_image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
                ],
                "sort_order": 2
            },
            {
                "name": "ซุ้มประตูพองลมทางเข้างาน (Inflatable Arch Banner)",
                "category": "อุปกรณ์ตกแต่ง / ซุ้มประตู",
                "description": "ซุ้มพองลมปล่อยตัวนักกีฬาขนาดกว้าง 8 เมตร ปรับแต่งป้ายโลโก้สปอนเซอร์และธีมงานได้ตามต้องการ มาพร้อมพัดลมโบลเวอร์เสียงเงียบ",
                "cover_image": "https://images.unsplash.com/photo-1561489413-985b06da5bee?auto=format&fit=crop&w=800&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1561489413-985b06da5bee?auto=format&fit=crop&w=800&q=80"
                ],
                "sort_order": 3
            },
            {
                "name": "ถ้วยรางวัลและเหรียญดีไซน์พรีเมียม (Custom Trophies & Medals)",
                "category": "อุปกรณ์กีฬา",
                "description": "ชุดถ้วยรางวัลสปอร์ตเดย์แบบอะคริลิคคริสตัลและโลหะ พร้อมบริการสลักชื่อทีมและโลโก้บริษัทสำหรับงานแข่งขันกีฬาสี",
                "cover_image": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80"
                ],
                "sort_order": 4
            }
        ]

        for data in sample_items:
            eq = Equipment(
                name=data["name"],
                category=data["category"],
                description=data["description"],
                cover_image=data["cover_image"],
                images=data["images"],
                sort_order=data["sort_order"]
            )
            db.session.add(eq)

        db.session.commit()
        print("Sample equipment seeded successfully!")
    else:
        print("Equipment table already has data, skipping seed.")
