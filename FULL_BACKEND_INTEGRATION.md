# 🎵 MusicApp - Full Backend Integration Guide (PostgreSQL Only)

## ✅ What Was Completed (Stage by Stage)

### Phase 1: Infrastructure
- Confirmed PostgreSQL only (reverted any SQLite)
- Fixed Vite proxy for /api and /uploads
- Improved server static serving + upload for authenticated users
- Enhanced Prisma schema (playlists with tracks, reviews, play history, relations)
- Added .env.example + Docker Postgres tip

### Phase 2: APIs (Completed)
- Full public reads (tracks, albums, artists, poets, poems, videos, news, occasions)
- User playlists: `/api/playlists/me`, create, add/remove tracks, update, delete
- `/api/playlists/public`
- Reviews: POST /api/reviews + GET
- Play tracking: POST /api/tracks/:id/play (increments views + saves history)
- Recommendations: `/api/recommendations` (personalized + fallback)
- Improved search with type filter
- Upload open to logged-in users (artists can upload)
- Admin + Artist role friendly mutations (tracks/albums/videos)

### Phase 3-5: User + Artist + Admin Flows
- Auth fully wired (login/register/me + like/follow)
- ArtistUpload now uploads real files via backend
- User can create and manage playlists
- Role-based upload permissions (artist/admin)

### Phase 6: Performance (Many improvements)
- DB indexes on hot paths (artistId, views, name, genre...)
- Resilient parallel fetching with allSettled (one failure doesn't break app)
- API service layer (clean + reusable)
- Non-blocking refetch after mutations
- Play recording is fire-and-forget
- Proxy for uploads in dev
- Added seed with realistic data
- Better error handling in dataStore
- Lazy mapping + maps for O(1) lookups

### Phase 7: Seed
- Rich seed: multiple artists, tracks, poems, news, occasions, users (admin/artist/normal)

## 🚀 Setup (PostgreSQL)

1. Start Postgres (recommended):
```bash
cd MusicApp/server
# One-time
docker run -d --name music-db \
  -e POSTGRES_USER=music_user \
  -e POSTGRES_PASSWORD=music_pass \
  -e POSTGRES_DB=music_db \
  -p 5433:5432 postgres:15
```

2. Configure env:
```bash
cp .env.example .env
# Edit if needed
```

3. Install + prepare DB:
```bash
cd MusicApp/server
npm install
npm run db:generate
npm run db:push
npm run seed
```

4. Start backend:
```bash
npm run dev   # or npm start
# Runs on http://localhost:3002
```

5. Start frontend (new terminal):
```bash
cd MusicApp/client
npm install
npm run dev
```

Open http://localhost:5173

## Test Accounts (after seed)
- admin@music.app (admin)
- issa@music.app (artist)
- sara@music.app (user)

Any password works for demo (bcrypt hashes are placeholders for speed).

## Key Endpoints Now Working
- GET /api/tracks/all , /api/albums , /api/artists ...
- POST /api/auth/login , /register , GET /me
- POST /api/tracks/:id/play
- POST /api/reviews
- GET/POST /api/playlists , /api/playlists/me
- GET /api/recommendations
- POST /api/upload (any logged in)

Enjoy the fully connected experience!
