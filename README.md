# Exercise & Hormones — Learning Hub

หน้าแรกแบบ minimal พร้อมการ์ตูนภาษาไทยและบทเรียนวิดีโอ WebGL สองภาษา ใช้ HTML, CSS และ JavaScript แบบ static ไม่มีขั้นตอน build

## เปิดใช้งานบนเครื่อง

แตก ZIP แล้วเปิด `index.html` ที่อยู่ชั้นนอกสุด เลือก **อ่านการ์ตูน** หรือ **ดูวิดีโอ** ได้ทันที ต้องเก็บโครงสร้างโฟลเดอร์และไฟล์ทั้งหมดไว้ด้วยกัน

- ตัวอ่านเรียง `cartoon-1.png` ถึง `cartoon-9.png` ตามเลขท้ายชื่อไฟล์ต้นฉบับ มีภาพย่อ เลือกภาพ ปุ่มก่อนหน้า/ถัดไป ขยายภาพ และเต็มจอ (เมื่อเบราว์เซอร์รองรับ)
- เลื่อนอ่านต่อเนื่องได้ หรือใช้ปุ่มลูกศรซ้าย/ขวาเพื่อเปลี่ยนภาพ ใช้ + / − เพื่อขยาย/ย่อ
- บนมือถือ ขยายแล้วเลื่อนภาพซ้าย/ขวาเพื่ออ่านข้อความ แตะ **พอดีจอ** เพื่อกลับขนาดเริ่มต้น
- วิดีโอเริ่มที่ภาษาไทย กด **เล่นวิดีโอ** เพื่อเริ่มภาพและเสียง สลับภาษาได้ที่ลิงก์ English
- ดาวน์โหลด MP4 พร้อมเสียงได้จากหน้าวิดีโอ เหมาะกับการนำไปเล่นในโปรแกรมเล่นวิดีโอโดยตรง

## Deploy บน GitHub Pages

1. สร้าง repository บน GitHub และใช้ branch ชื่อ `main`
2. นำ **เนื้อหาภายใน ZIP ทั้งหมด** ไปไว้ที่ root ของ repository: ต้องเห็น `index.html`, `assets/`, `reader/`, `video/` และ `.github/` อยู่ชั้นเดียวกัน อย่านำ ZIP ทั้งก้อนไปอัปโหลด และอย่าอัปโหลดแค่ไฟล์ HTML
3. เข้า **Settings → Pages → Build and deployment → Source → GitHub Actions**
4. Push ไฟล์ขึ้น `main` แล้วเปิด **Actions → Publish learning hub to GitHub Pages** รอให้สำเร็จ หากเพิ่งเปิด Pages หลัง push ให้เลือก **Run workflow**
5. เปิด URL ที่แสดงใน Settings → Pages เช่น `https://USERNAME.github.io/REPOSITORY/`

มี workflow พร้อมใช้งานใน `.github/workflows/pages.yml` โดยเผยแพร่จาก root ของ repository ไม่ต้องติดตั้ง npm หรือกำหนด API key

แนะนำใช้ Git push เพื่ออัปโหลดชุดนี้ เพราะมีไฟล์ MP4 ขนาดใหญ่ และ Git จะนำโฟลเดอร์ `.github` ไปด้วย หากมี repository อยู่แล้ว ให้คัดลอกไฟล์ชุดนี้ลงในโฟลเดอร์ repository ก่อน commit และ push

หากอัปโหลดผ่านหน้าเว็บ GitHub ให้ตรวจว่ามีโฟลเดอร์ซ่อน `.github` ด้วย อีกวิธีคือเลือก Source เป็น **Deploy from a branch**, branch `main`, folder `/(root)` แล้ว Save; ไฟล์ `.nojekyll` รองรับการเผยแพร่ static โดยตรง

## โครงสร้าง

```text
index.html                 หน้าเลือกอ่านหรือดู
hub.css                    รูปแบบหน้าแรกและส่วนร่วม
assets/comic/cartoon-*.png  ภาพต้นฉบับ 9 ภาพ
assets/comic-manifest.json  ลำดับ ขนาด และ SHA-256 ของภาพ
reader/index.html          ตัวอ่านการ์ตูน
reader/pages.js            รายชื่อภาพ เรียงตามเลขท้ายชื่อไฟล์
video/index.html           วิดีโอภาษาอังกฤษ
video/th/index.html        วิดีโอภาษาไทย
video/Neuroendocrine_Responses.mp4
video/th/Neuroendocrine_Responses_TH.mp4
.github/workflows/pages.yml
```

ลิงก์ใช้ relative paths จึงรองรับทั้งเว็บไซต์ root และ GitHub Pages ที่มีชื่อ repository เป็น subpath ภาพและเสียงใช้ไฟล์ในชุดนี้ ไม่มีบริการเสียงออนไลน์ขณะเปิดดู

ภาพการ์ตูนถูกคัดลอกโดยไม่แก้ไขเนื้อหาหรือเลขหน้าที่พิมพ์อยู่ในภาพ ลำดับตัวอ่านยึด **ชื่อไฟล์** ตามที่ผู้ใช้ระบุ เลขในภาพจึงอาจต่างจากลำดับในตัวอ่าน

วิดีโอใช้ฉบับ v4.1 ที่แก้ playback และ Audio unavailable แล้ว ต้องคลิกเล่นเพื่อให้เบราว์เซอร์อนุญาตเสียง หากเครื่องไม่รองรับ WebGL สามารถใช้ไฟล์ MP4 แทนได้

ชุดนี้เป็นโค้ดพร้อม deploy การเผยแพร่จริงต้องทำใน repository ของคุณตามขั้นตอนด้านบน
