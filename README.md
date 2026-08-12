<div align="center">
  <h1>🎉 108 WOW SPORT DAY ORGANIZER</h1>
  <p><strong>แพลตฟอร์มเว็บไซต์อย่างเป็นทางการสำหรับบริษัทรับจัดงานและออร์แกไนเซอร์</strong></p>
</div>

---

## 📖 เกี่ยวกับโปรเจกต์
โปรเจกต์นี้เป็นเว็บไซต์ Full-Stack แบบครบวงจรที่ถูกออกแบบมาเพื่อ **108 WOW SPORT DAY ORGANIZER** โดยเฉพาะ ตัวเว็บเน้นความสวยงาม ทันสมัย ใช้งานง่าย และมาพร้อมกับ **ระบบจัดการหลังบ้าน (CMS)** ที่ให้แอดมินสามารถเข้ามาแก้ไขข้อความ อัปเดตผลงาน และเปลี่ยนรูปภาพได้เองโดยไม่ต้องยุ่งกับโค้ดอีกต่อไป

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### หน้าบ้าน (Frontend)
*   **Framework:** React 19 + Vite (ทำงานรวดเร็วและทันสมัย)
*   **Styling:** Vanilla CSS & Bootstrap 5 (ออกแบบ UI ระดับพรีเมียม สไตล์นิตยสาร)
*   **Routing:** React Router DOM (เปลี่ยนหน้าเว็บได้แบบไม่ต้องโหลดหน้าใหม่)
*   **UX/UI:** รองรับมือถือ 100%, มีระบบปัดเลื่อน (Swipe Carousel), แอนิเมชันลื่นไหล, และปุ่มติดต่อแบบ Speed Dial

### หลังบ้าน (Backend & API)
*   **Framework:** Python + Flask 3.1
*   **Database:** MySQL (ทำงานร่วมกับ SQLAlchemy ORM อย่างปลอดภัย)
*   **Authentication:** JWT (JSON Web Tokens) (ระบบ Login สำหรับแอดมิน)
*   **Storage:** Cloudinary (ระบบฝากไฟล์รูปภาพบนคลาวด์ ป้องกันรูปหายเมื่อเซิร์ฟเวอร์รีสตาร์ท)

## ✨ ฟีเจอร์เด่น (Key Features)

### 👥 สำหรับผู้ใช้งานทั่วไป (User)
- **Dynamic Landing Page:** หน้าแรกดึงดูดสายตา โหลดไว จัดเรียงข้อมูลสวยงามอ่านง่าย
- **Responsive Design:** แสดงผลได้สมบูรณ์แบบในทุกอุปกรณ์ (มือถือ แท็บเล็ต คอมพิวเตอร์)
- **Portfolio & Gallery:** ระบบแสดงผลงานที่ผ่านมา พร้อมจัดหมวดหมู่สวยงาม
- **Smart Contact:** ปุ่มติดต่อแบบลูกโป่ง (Speed Dial) เด้งไปคุยผ่าน LINE, Facebook, IG ได้ทันที

### 🔒 สำหรับแอดมิน (Admin Dashboard)
- **จัดการข้อมูลง่าย:** ล็อกอินเข้าหลังบ้านเพื่อแก้ไขข้อมูล "เกี่ยวกับเรา", "บริการ", และ "รูปภาพผลงาน" ได้อิสระ
- **Cloud Image Upload:** อัปโหลดรูปจากหลังบ้าน รูปจะถูกส่งไปเก็บที่ Cloudinary อัตโนมัติ (ประหยัดพื้นที่และปลอดภัย)
- **จัดการโซเชียลมีเดีย:** เปิด/ปิด การแสดงผลปุ่มติดต่อต่างๆ เช่น LINE, Facebook ได้ง่ายๆ เพียงแค่คลิกเปิด-ปิด
- **ข้อความติดต่อ:** สามารถอ่านข้อความที่มีคนกรอกฟอร์มจากหน้าเว็บได้ผ่านระบบหลังบ้าน

---

## ☁️ คู่มือการเอาขึ้นโฮสต์จริง (Railway Deployment)

โปรเจกต์นี้รองรับการนำไปเปิดใช้งานจริง (Deploy) บนแพลตฟอร์ม [Railway](https://railway.app/) ได้อย่างสมบูรณ์ใน 3 ขั้นตอน:

### 1. ฐานข้อมูล (Database)
- สร้างบริการ **MySQL** ในโปรเจกต์ Railway ของคุณ
- *ระบบหลังบ้านถูกตั้งโปรแกรมให้อ่านรหัสผ่านและเชื่อมต่อ MySQL ของ Railway อัตโนมัติ*

### 2. ติดตั้ง Backend (ระบบหลังบ้าน)
- กด Deploy จาก GitHub แล้วเลือกเป็น Service ใหม่
- **Root Directory:** กำหนดเป็น `/backend`
- **Start Command:** กำหนดเป็น `gunicorn run:app --bind 0.0.0.0:$PORT`
- **Variables (ค่าตัวแปรที่ต้องกรอกเพิ่ม):**
  - `CLOUDINARY_URL`: ลิงก์เชื่อมต่อจากบัญชี cloudinary.com (จำเป็นสำหรับการอัปโหลดรูป)
  - `SECRET_KEY`: พิมพ์ข้อความสุ่มยาวๆ เพื่อความปลอดภัย
  - `JWT_SECRET`: พิมพ์ข้อความสุ่มยาวๆ สำหรับเข้ารหัสระบบ Login แอดมิน

### 3. ติดตั้ง Frontend (หน้าบ้าน)
- กด Deploy จาก GitHub *Repo เดิม* อีกครั้ง เป็นอีกหนึ่ง Service
- **Root Directory:** กำหนดเป็น `/frontend`
- **Variables:**
  - `VITE_API_URL`: ใส่ลิงก์ URL ของ Backend ที่เพิ่ง Deploy เสร็จไป (เช่น `https://your-backend.up.railway.app`)
- *ระบบจะทำการ Build และเริ่มทำงานโดยอัตโนมัติจากคำสั่งที่เตรียมไว้ให้แล้วในไฟล์ package.json*

---

## 💻 คู่มือสำหรับนักพัฒนา (Local Setup)

หากต้องการรันโปรเจกต์นี้เพื่อแก้ไขโค้ดในคอมพิวเตอร์ของคุณ

**สเปคที่ต้องการ:** Node.js (v18+), Python (3.10+), และ MySQL Server

**รัน Backend:**
```bash
cd backend
python -m venv venv
# สำหรับ Windows: venv\Scripts\activate
# สำหรับ Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
# (อย่าลืมก็อปปี้ .env.example ไปสร้างไฟล์ .env และใส่รหัสฐานข้อมูลตัวเอง)
python run.py
```
*(Backend จะรันที่พอร์ต 5000)*

**รัน Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*(Frontend จะรันที่พอร์ต 5173)*
