# MongoDB Atlas + Vercel Deployment Guide

This guide will help you deploy your mental health app with MongoDB Atlas and Vercel.

## Prerequisites

- Node.js installed
- Git repository set up
- MongoDB Atlas account
- Vercel account

---

## Part 1: MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project (e.g., "Mental Health App")

### 2. Create a Cluster
1. Click **"Build a Database"**
2. Choose **FREE M0 Cluster** (512MB storage)
3. Select cloud provider and region (choose closest to your users)
4. Name your cluster (e.g., "Cluster0")
5. Click **"Create Cluster"** (takes 3-5 minutes)

### 3. Configure Database Access
1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **Password** authentication method
4. Create credentials:
   - Username: `your_username`
   - Password: Generate a secure password (save it!)
5. Set privileges: **"Read and write to any database"**
6. Click **"Add User"**

### 4. Configure Network Access
1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is required for Vercel serverless functions
4. Click **"Confirm"**

### 5. Get Connection String
1. Go to **Database** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select:
   - Driver: **Node.js**
   - Version: **4.1 or later**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace:
   - `<username>` with your database username
   - `<password>` with your database password
   - Add database name: `/mental_health_app?` before the query parameters

**Final format:**
```
mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/mental_health_app?retryWrites=true&w=majority
```

---

## Part 2: Local Setup

### 1. Update Backend .env File
1. Navigate to `backend/` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your MongoDB Atlas connection string:
   ```env
   PORT=3001
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/mental_health_app?retryWrites=true&w=majority
   NODE_ENV=development
   ```

### 2. Test Local Connection
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Check console for: `"Connected to MongoDB"`
4. Test health endpoint: http://localhost:3001/health

---

## Part 3: Deploy Backend to Vercel

### Method A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```
   - Follow the authentication prompts

3. **Deploy from backend directory:**
   ```bash
   cd backend
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? → **Y**
   - Which scope? → Select your account
   - Link to existing project? → **N** (first time)
   - Project name? → **got-some-brains-backend**
   - Directory? → **./backend**
   - Override settings? → **N**

5. **Add environment variables:**
   ```bash
   vercel env add MONGODB_URI
   ```
   - Paste your MongoDB Atlas connection string
   - Select all environments (Production, Preview, Development)
   
   ```bash
   vercel env add NODE_ENV
   ```
   - Enter: `production`
   - Select Production only

6. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

7. **Save your deployment URL** (e.g., `https://got-some-brains-backend.vercel.app`)

### Method B: Using Vercel Dashboard

1. **Push code to Git:**
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"Add New"** → **"Project"**
   - Import your Git repository
   - Configure:
     - **Framework Preset:** Other
     - **Root Directory:** `backend`
     - **Build Command:** (leave empty)
     - **Output Directory:** (leave empty)
     - **Install Command:** `npm install`

3. **Add Environment Variables:**
   - Go to **Settings** → **Environment Variables**
   - Add:
     | Name | Value | Environments |
     |------|-------|--------------|
     | `MONGODB_URI` | Your Atlas connection string | Production, Preview, Development |
     | `NODE_ENV` | `production` | Production |
     | `PORT` | `3001` | All |

4. **Deploy:**
   - Click **"Deploy"**
   - Wait for deployment to complete
   - Copy your deployment URL

---

## Part 4: Deploy Frontend to Vercel

### 1. Update Frontend Environment Variables

1. Create `.env` in root directory:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env`:
   ```env
   VITE_API_URL=https://your-backend.vercel.app
   ```
   Replace with your actual backend Vercel URL

### 2. Update Service Files (if needed)

The following files should use `import.meta.env.VITE_API_URL`:
- `src/services/backendService.ts`
- `src/services/chatService.ts`
- `src/services/adminService.ts`

Example:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

### 3. Deploy Frontend

**Using Vercel CLI:**
```bash
cd ..  # Back to root directory
vercel
```

**Using Vercel Dashboard:**
1. Import repository again
2. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variable:
   - `VITE_API_URL` = Your backend URL
4. Deploy

---

## Part 5: Verify Deployment

### 1. Test Backend Endpoints
```bash
# Health check
curl https://your-backend.vercel.app/health

# Model status
curl https://your-backend.vercel.app/model/status
```

### 2. Test Frontend
1. Visit your frontend URL
2. Try the assessment flow
3. Check browser console for errors
4. Verify data is saved to MongoDB Atlas

### 3. Monitor MongoDB Atlas
1. Go to MongoDB Atlas dashboard
2. Click **"Browse Collections"**
3. Verify data appears in:
   - `userassessments` collection
   - `chatrooms` collection
   - `chatmessages` collection

---

## Part 6: Important Notes

### Socket.IO Considerations
⚠️ **Important:** Vercel serverless functions don't support WebSocket connections (Socket.IO) in the same way as traditional servers.

**Options:**
1. **Use Vercel for REST API only** and deploy Socket.IO separately:
   - Deploy chat server to Railway, Render, or Heroku
   - Keep REST endpoints on Vercel

2. **Use Vercel's real-time features:**
   - Migrate to Vercel's Edge Functions with streaming
   - Or use a managed service like Pusher/Ably for real-time features

### CORS Configuration
Update `server.js` CORS settings for production:
```javascript
const io = socketIo(server, {
  cors: {
    origin: ["https://your-frontend.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});
```

### Environment Variables Checklist

**Backend (.env):**
- ✅ `MONGODB_URI` - MongoDB Atlas connection string
- ✅ `NODE_ENV` - Set to `production`
- ✅ `PORT` - Port number (3001)

**Frontend (.env):**
- ✅ `VITE_API_URL` - Backend Vercel URL

---

## Troubleshooting

### MongoDB Connection Issues
- Verify IP whitelist includes 0.0.0.0/0
- Check username/password are correct
- Ensure database name is in connection string
- Check MongoDB Atlas cluster is running

### Vercel Deployment Issues
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `vercel.json` is in backend directory
- Check Node.js version compatibility

### CORS Errors
- Update CORS origin in `server.js`
- Add your frontend URL to allowed origins
- Clear browser cache and try again

---

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas metrics
3. Review browser console errors
4. Check network tab for failed requests

Good luck with your deployment! 🚀
