# 🚀 دليل نشر Professional Academy — منصة مستر حبيب الرحمن

## الطريقة 1: Vercel (أسرع وأسهل — مجاني للبداية)

### الخطوات:
```bash
# 1. ارفع المشروع على GitHub
git init
git add .
git commit -m "Professional Academy - Full Platform"
git remote add origin https://github.com/YOUR_USERNAME/pro-academy.git
git push -u origin main

# 2. افتح https://vercel.com واربطه بحسابك على GitHub

# 3. اختر المشروع واضغط Deploy

# 4. أضف متغيرات البيئة (Environment Variables):
#    DATABASE_URL = postgresql://user:password@host:5432/dbname

# 5. اربط الدومين المخصص:
#    proacademy.habibelrahman.com
```

### قاعدة البيانات المقترحة:
- **Neon** (مجاني حتى 0.5GB): https://neon.tech
- **Supabase** (مجاني حتى 500MB): https://supabase.com
- **Railway** (5$ شهرياً): https://railway.app

---

## الطريقة 2: VPS (خادم خاص — تحكم كامل)

### المتطلبات:
- Ubuntu 22.04+ VPS (DigitalOcean / Hostinger / Contabo)
- 2GB RAM minimum
- Node.js 20+
- PostgreSQL 15+
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt)

### الخطوات:
```bash
# 1. تثبيت Node.js و PostgreSQL
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs postgresql postgresql-contrib nginx

# 2. إعداد قاعدة البيانات
sudo -u postgres psql -c "CREATE USER habib WITH PASSWORD 'YOUR_SECURE_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE pro_academy OWNER habib;"

# 3. رفع المشروع للسيرفر
scp -r ./* user@YOUR_SERVER_IP:/var/www/pro-academy/

# 4. تثبيت المتطلبات وبناء المشروع
cd /var/www/pro-academy
npm install
echo "DATABASE_URL=postgresql://habib:YOUR_SECURE_PASSWORD@localhost:5432/pro_academy" > .env
npm run build

# 5. تشغيل بـ PM2
npm install -g pm2
pm2 start npm --name "pro-academy" -- start
pm2 startup
pm2 save

# 6. إعداد Nginx
sudo nano /etc/nginx/sites-available/pro-academy
```

```nginx
server {
    listen 80;
    server_name proacademy.habibelrahman.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
```

```bash
# 7. تفعيل الموقع وشهادة SSL
sudo ln -s /etc/nginx/sites-available/pro-academy /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d proacademy.habibelrahman.com
```

---

## الطريقة 3: Docker (حاويات — للمحترفين)

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: "3.9"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://habib:password@db:5432/pro_academy
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: habib
      POSTGRES_PASSWORD: password
      POSTGRES_DB: pro_academy
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

```bash
docker-compose up -d --build
```

---

## إعداد الدومين المخصص

### شراء الدومين:
- Namecheap: https://namecheap.com
- GoDaddy: https://godaddy.com
- Cloudflare Registrar: https://dash.cloudflare.com

### ربط DNS:
```
Type: A
Name: @
Value: YOUR_SERVER_IP

Type: CNAME
Name: www
Value: proacademy.habibelrahman.com
```

---

## ✅ قائمة التحقق قبل الإطلاق

- [ ] DATABASE_URL مضبوط في .env أو Environment Variables
- [ ] الدومين مربوط وشهادة SSL مفعلة (HTTPS)
- [ ] رقم فودافون كاش صحيح: 01006468384
- [ ] تسجيل دخول الأدمن يعمل (habib.admin@proacademy.com)
- [ ] رفع PDF يعمل (مجلد storage/ له صلاحيات كتابة)
- [ ] صفحة الموبايل تظهر زر "تثبيت التطبيق"
- [ ] صفحة Offline تظهر عند قطع الإنترنت
- [ ] Service Worker مسجل (DevTools → Application → SW)
- [ ] Google Search Console مربوط بـ sitemap.xml

---

## 📱 كيف يثبّت الطالب التطبيق؟

### أندرويد (Chrome):
1. يفتح الرابط في Chrome
2. يظهر بانر "تثبيت التطبيق مجاناً" تلقائياً
3. يضغط "تثبيت" → أيقونة تظهر على الشاشة الرئيسية

### آيفون (Safari):
1. يفتح الرابط في Safari
2. يضغط زر المشاركة ⬆️ أسفل الشاشة
3. يختار "إضافة إلى الشاشة الرئيسية" ➕
4. يضغط "إضافة"

المنصة تشتغل كتطبيق حقيقي بملء الشاشة بدون شريط عناوين المتصفح!
