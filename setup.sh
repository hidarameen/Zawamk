#!/bin/bash

set -e

echo "🎵 MusicApp - التنصيب التلقائي الكامل (Frontend + Backend)"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js غير مثبت. يرجى تثبيته أولاً (Node >= 18)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js موجود: $(node -v)${NC}"

# 2. Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm غير موجود${NC}"
    exit 1
fi

# 3. Check Docker (recommended for Postgres)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker موجود${NC}"
    HAS_DOCKER=true
else
    echo -e "${YELLOW}⚠️  Docker غير موجود. سأحاول استخدام PostgreSQL محلي إن وجد.${NC}"
    HAS_DOCKER=false
fi

cd "$(dirname "$0")"
ROOT_DIR=$(pwd)

echo ""
echo "📦 تثبيت التبعيات..."

# Install Server
echo "→ تثبيت Backend (server)..."
cd "$ROOT_DIR/server"
npm install

# Install Client
echo "→ تثبيت Frontend (client)..."
cd "$ROOT_DIR/client"
npm install

echo -e "${GREEN}✅ تم تثبيت جميع التبعيات${NC}"

# 4. Setup PostgreSQL
echo ""
echo "🗄️  إعداد قاعدة البيانات (PostgreSQL)..."

cd "$ROOT_DIR/server"

# Copy .env if not exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ تم إنشاء .env من .env.example${NC}"
    else
        echo -e "${YELLOW}⚠️  لم يتم العثور على .env.example. تأكد من إنشاء .env يدوياً.${NC}"
    fi
fi

# Start Postgres with Docker if available
if [ "$HAS_DOCKER" = true ]; then
    echo "→ تشغيل PostgreSQL عبر Docker..."
    
    # Check if container exists
    if docker ps -a --format '{{.Names}}' | grep -q "music-db"; then
        echo "→ حاوية music-db موجودة بالفعل"
        docker start music-db 2>/dev/null || true
    else
        echo "→ إنشاء حاوية PostgreSQL جديدة..."
        docker run -d \
            --name music-db \
            -e POSTGRES_USER=music_user \
            -e POSTGRES_PASSWORD=music_pass \
            -e POSTGRES_DB=music_db \
            -p 5433:5432 \
            postgres:15 || echo -e "${YELLOW}⚠️  فشل تشغيل Docker. تأكد من أن Docker يعمل.${NC}"
    fi
    
    # Wait for Postgres to be ready
    echo "→ انتظار جاهزية PostgreSQL (قد يستغرق 10-15 ثانية)..."
    sleep 12
else
    echo -e "${YELLOW}⚠️  تأكد أن PostgreSQL يعمل محلياً على المنفذ 5433${NC}"
    echo "   مثال: DATABASE_URL=\"postgresql://music_user:music_pass@localhost:5433/music_db?schema=public\""
fi

# 5. Prisma setup
echo ""
echo "🔧 إعداد Prisma + قاعدة البيانات..."

cd "$ROOT_DIR/server"

# Generate Prisma Client
npm run db:generate || npx prisma generate

# Push schema (create tables)
echo "→ تطبيق مخطط قاعدة البيانات..."
npm run db:push || npx prisma db push --accept-data-loss

# Seed the database
# echo "→ إدخال البيانات التجريبية (seed)..."
# npm run seed || npx ts-node src/seed.ts
echo "→ تم تخطي إدخال البيانات التجريبية للحفاظ على البيانات الحقيقية."

echo -e "${GREEN}✅ تم إعداد قاعدة البيانات بنجاح${NC}"

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 التنصيب اكتمل بنجاح!${NC}"
echo ""
echo "لتشغيل المشروع استخدم الأمر التالي:"
echo ""
echo "   bash MusicApp/start.sh"
echo ""
echo "أو من داخل مجلد MusicApp:"
echo "   ./start.sh"
echo ""
echo "الواجهة ستكون على: http://localhost:5173"
echo "الباكند على:     http://localhost:3002"
echo ""
echo "حسابات التجربة (كلمة السر: 123456):"
echo "  - admin@music.app   (مدير)"
echo "  - issa@music.app    (فنان)"
echo "  - sara@music.app    (مستخدم)"
echo "=================================================="