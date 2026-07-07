# Production Deployment for music.hidar.eu.cc

## 502 Bad Gateway from Cloudflare - Common Fix

This error means Cloudflare cannot reach your origin server (nginx or the app).

### 1. On your VPS / server (SSH)

```bash
# Go to project
cd /path/to/MusicApp   # or wherever you extracted MusicApp-ready.zip

# === Backend ===
cd server

# Create .env for PRODUCTION (edit this!)
cat > .env << 'EOT'
DATABASE_URL="postgresql://your_prod_user:your_prod_pass@your_prod_db_host:5432/music_db?schema=public"
PORT=3002
DOMAIN=music.hidar.eu.cc
JWT_SECRET=super-long-random-secret-change-this
EOT

# Install deps (including dev for ts-node, or compile later)
npm install

# Generate prisma & push schema (run only once or when schema changes)
npm run db:generate
npm run db:push

# Optional: seed data
npm run seed

# Start the backend (use pm2 for production)
npm install -g pm2   # if not installed
pm2 start "npm run prod" --name music-backend
pm2 save
pm2 startup

# Test locally on server
curl http://127.0.0.1:3002/api/health
# Should return {"status":"ok", ...}

# === Frontend ===
cd ../client
npm install
npm run build   # creates dist/

# The backend now has SPA fallback: if client/dist exists, it will serve the React app + handle client routes.

# === Nginx ===
cd ..
bash patch_music_nginx.sh

# Test nginx
sudo nginx -t
sudo systemctl reload nginx

# === Cloudflare ===
# - DNS: A record to your server IP, Proxy = ON (orange cloud)
# - SSL/TLS: Flexible or Full (depending on your certs)
# - If using Full, make sure origin has valid cert or use Cloudflare Origin Cert

# Check logs
pm2 logs music-backend
sudo tail -f /var/log/nginx/error.log
```

### 2. Verify

- On server: `curl -I http://127.0.0.1:3002/api/health`
- From outside: `curl -I https://music.hidar.eu.cc/api/health`
- Browser: open https://music.hidar.eu.cc  (should load the React UI)

### 3. If still 502

- Backend not running? `pm2 list`
- Wrong proxy port in nginx? Check /etc/nginx/sites-enabled/music.conf
- Firewall: `sudo ufw allow 3002` (if direct) or only 80/443
- Postgres not reachable from backend? Check DATABASE_URL
- ts-node errors? `pm2 logs` for details. Consider building TS to JS for prod.

### Production Tips

- Use a real managed Postgres (not local docker).
- Set strong JWT_SECRET.
- For better perf: compile server with `tsc` and run node dist/index.js (add build script).
- Monitor with pm2 monit or uptime.
- The health endpoint is at /api/health

If you share the output of `pm2 logs music-backend` and `sudo nginx -t`, I can help debug further.
