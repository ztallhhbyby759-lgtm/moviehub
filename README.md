# 🎬 MovieHub Pro

وب‌سایت کشف فیلم با بک‌اند Node.js + JSON DB.

## 🚀 اجرای لوکال

\`\`\`bash
npm install
npm start
# → http://localhost:3000
\`\`\`

رمز ادمین پیش‌فرض: `admin123`

## 🔧 متغیرهای محیطی

| Variable | Default | توضیح |
|---|---|---|
| `PORT` | `3000` | پورت سرور |
| `ADMIN_PASSWORD` | `admin123` | رمز ادمین (در هاست تغییر بده) |

## 🌐 هاست رایگان (پیشنهاد)

### 1. **Render.com** (بهترین گزینه رایگان)
1. کد را روی GitHub پوش کن
2. Render → New Web Service → اتصال به repo
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Environment variable: `ADMIN_PASSWORD=yourStrongPass`
6. **مهم:** در Render روی دیسک پایدار، پوشه `data/` و `uploads/` را به Disk Mount وصل کن (پلن رایگان ندارد، پلن Starter دارد)

### 2. **Railway.app**
- New Project → Deploy from GitHub
- Add Volume برای `data/` و `uploads/`

### 3. **Fly.io**
- `fly launch` → Add volume با `fly volumes create moviehub_data`

### 4. **VPS (کامل‌ترین)**
\`\`\`bash
git clone <repo>
cd moviehub
npm install
ADMIN_PASSWORD=StrongPass123 nohup npm start &
# با pm2:
pm2 start server.js --name moviehub
\`\`\`

## 📱 استفاده

### برای کاربران عادی:
- مرور، جستجو، فیلتر
- اضافه کردن به watchlist (لوکال)
- امتیازدهی ستاره‌ای
- نوشتن کامنت

### برای ادمین:
1. Profile → Admin → Login
2. رمز را وارد کن
3. دکمه `+` در هدر ظاهر می‌شود
4. فیلم اضافه کن — با **drag & drop عکس** یا URL
5. فیلم‌های خودت را ویرایش/حذف کن

## 📂 ساختار دیتا
تمام فیلم‌ها، کامنت‌ها و امتیازها در `data/db.json` ذخیره می‌شوند.
عکس‌های آپلودی در `uploads/` قرار می‌گیرند.

**پشتیبان‌گیری:** فقط این دو پوشه را کپی کن.