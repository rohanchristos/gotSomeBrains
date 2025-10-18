# Quick Deployment Checklist

## 🚀 MongoDB Atlas + Vercel - Quick Steps

### 1️⃣ MongoDB Atlas (5 minutes)
```
✅ Create account at mongodb.com/cloud/atlas
✅ Create FREE M0 cluster
✅ Database Access → Add user (save credentials!)
✅ Network Access → Allow 0.0.0.0/0
✅ Get connection string → Replace <username> & <password>
✅ Add database name: /mental_health_app?
```

**Connection String Format:**
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/mental_health_app?retryWrites=true&w=majority
```

---

### 2️⃣ Update Local Backend (2 minutes)
```bash
cd backend
cp .env.example .env
# Edit .env - paste your MongoDB Atlas connection string
npm install
npm start
# Check: "Connected to MongoDB" ✅
```

---

### 3️⃣ Deploy Backend to Vercel (3 minutes)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd backend
vercel

# Add environment variables
vercel env add MONGODB_URI
# Paste your MongoDB connection string
# Select: Production, Preview, Development

vercel env add NODE_ENV
# Enter: production
# Select: Production

# Redeploy
vercel --prod

# Save your URL: https://your-backend.vercel.app
```

---

### 4️⃣ Deploy Frontend to Vercel (2 minutes)
```bash
cd ..  # Back to root
cp .env.example .env
# Edit .env - add backend URL:
# VITE_API_URL=https://your-backend.vercel.app

vercel
# Follow prompts
# Framework: Vite
# Build: npm run build
# Output: dist

# Add environment variable in Vercel dashboard:
# VITE_API_URL = https://your-backend.vercel.app
```

---

### 5️⃣ Test Everything (1 minute)
```bash
# Test backend
curl https://your-backend.vercel.app/health

# Visit frontend URL
# Try assessment → Check MongoDB Atlas collections
```

---

## 📋 Environment Variables Needed

### Backend (Vercel)
| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://...` |
| `NODE_ENV` | `production` |

### Frontend (Vercel)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.vercel.app` |

---

## ⚠️ Important Notes

1. **Socket.IO Warning**: Vercel serverless doesn't fully support WebSockets
   - Consider deploying chat server separately (Railway/Render)
   - Or use Pusher/Ably for real-time features

2. **CORS**: Update allowed origins in `server.js`:
   ```javascript
   origin: ["https://your-frontend.vercel.app"]
   ```

3. **MongoDB IP Whitelist**: Must include `0.0.0.0/0` for Vercel

---

## 🔗 Quick Links

- MongoDB Atlas: https://cloud.mongodb.com
- Vercel Dashboard: https://vercel.com/dashboard
- Full Guide: See `DEPLOYMENT_GUIDE.md`

---

**Total Time: ~15 minutes** ⏱️
