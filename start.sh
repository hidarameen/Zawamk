#!/bin/bash

set -e

echo "🚀 تشغيل MusicApp (Frontend + Backend) بأمر واحد"
echo "=================================================="

cd "$(dirname "$0")"
ROOT_DIR=$(pwd)

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo -e "${CYAN}🛑 إيقاف الخدمات...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    # Also try to kill by port if needed
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}تم الإيقاف.${NC}"
}

trap cleanup EXIT INT TERM

# Make sure Postgres is running (if using Docker)
if command -v docker &> /dev/null; then
    if docker ps --format '{{.Names}}' | grep -q "music-db"; then
        echo "✅ PostgreSQL (Docker) يعمل"
    else
        echo "→ محاولة تشغيل PostgreSQL..."
        docker start music-db 2>/dev/null || true
        sleep 5
    fi
fi

# Start Backend
echo -e "${CYAN}→ تشغيل الباكند (Server) على المنفذ 3002...${NC}"
cd "$ROOT_DIR/server"

# Use npm run dev if available, otherwise start
if grep -q '"dev"' package.json; then
    npm run dev &
else
    npm start &
fi
BACKEND_PID=$!

# Wait for backend to be ready (health check)
echo -e "${CYAN}→ انتظار جاهزية الباكند...${NC}"
BACKEND_READY=false
if command -v curl &> /dev/null; then
  for i in {1..15}; do
    if curl -s --max-time 2 http://localhost:3002/api/health 2>/dev/null | grep -q '"status":"ok"'; then
      echo -e "${GREEN}✅ الباكند جاهز!${NC}"
      BACKEND_READY=true
      break
    fi
    echo "   ... الانتظار ($i/15)"
    sleep 2
  done
else
  echo -e "${YELLOW}⚠️  curl غير موجود، سأنتظر 8 ثوانٍ فقط${NC}"
  sleep 8
  BACKEND_READY=true
fi

if [ "$BACKEND_READY" = false ]; then
  echo -e "${YELLOW}⚠️  الباكند لم يستجب بعد. تأكد من PostgreSQL و DATABASE_URL في .env${NC}"
  echo "   يمكنك تشغيل الواجهة لوحدها، لكن البيانات لن تظهر."
fi

# Start Frontend
echo -e "${CYAN}→ تشغيل الواجهة (Client) على المنفذ 5173...${NC}"
cd "$ROOT_DIR/client"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=================================================="
echo -e "${GREEN}✅ تم تشغيل المشروع بنجاح!${NC}"
echo ""
echo "🌐 الواجهة الأمامية:  http://localhost:5173"
echo "🔧 الباكند:           http://localhost:3002"
echo "🗄️  API Health:       http://localhost:3002/api/health"
echo ""
echo "اضغط Ctrl+C لإيقاف الخدمتين معاً."
echo "=================================================="

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID