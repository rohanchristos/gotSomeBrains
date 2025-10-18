# Deployment Guide - Mental Health Assessment Platform

## 🚀 Quick Start Production Deployment

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB for testing)
- Git installed
- Domain name (optional but recommended)

---

## 📦 Backend Deployment

### Option 1: Deploy to Render (Recommended)

1. **Create Render Account**: https://render.com

2. **Create New Web Service**:
   - Connect your GitHub repository
   - Select the `backend` directory
   - Configure:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: Node

3. **Set Environment Variables** in Render Dashboard:
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mental_health_app
   CORS_ORIGIN=https://your-frontend-domain.com
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Deploy**: Render will automatically deploy on push to main branch

### Option 2: Deploy to Railway

1. **Create Railway Account**: https://railway.app

2. **New Project** → **Deploy from GitHub**

3. **Configure**:
   - Root directory: `backend`
   - Start command: `npm start`

4. **Add Environment Variables** (same as above)

5. **Deploy**: Automatic on git push

### Option 3: Deploy to Vercel (Serverless)

**Note**: TensorFlow.js may have cold start issues on serverless

1. Install Vercel CLI: `npm i -g vercel`

2. In backend directory: `vercel`

3. Configure `vercel.json` (already included)

4. Set environment variables: `vercel env add`

---

## 🌐 Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**: `npm i -g vercel`

2. **In project root**:
   ```bash
   npm run build
   vercel
   ```

3. **Set Environment Variable**:
   ```bash
   vercel env add VITE_API_URL
   # Enter: https://your-backend-domain.com
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy to Netlify

1. **Create Netlify Account**: https://netlify.com

2. **Connect Repository**:
   - New site from Git
   - Select your repository

3. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Environment Variables**:
   - Add `VITE_API_URL` with your backend URL

5. **Deploy**: Automatic on git push

### Option 3: Manual Static Hosting

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload `dist` folder** to any static host:
   - AWS S3 + CloudFront
   - GitHub Pages
   - Firebase Hosting
   - Cloudflare Pages

---

## 🗄️ MongoDB Setup

### MongoDB Atlas (Production)

1. **Create Account**: https://www.mongodb.com/cloud/atlas

2. **Create Cluster**:
   - Choose free tier (M0) for testing
   - Select region closest to your users
   - Create cluster

3. **Database Access**:
   - Create database user
   - Save username and password

4. **Network Access**:
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs for better security

5. **Get Connection String**:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

6. **Update Backend .env**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mental_health_app?retryWrites=true&w=majority
   ```

---

## 🔐 Security Configuration

### 1. Environment Variables

**Backend (.env)**:
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=https://your-frontend.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env)**:
```env
VITE_API_URL=https://your-backend.com
```

### 2. CORS Configuration

Update `CORS_ORIGIN` in backend .env to match your frontend domain:
```
CORS_ORIGIN=https://your-frontend.vercel.app,https://your-custom-domain.com
```

### 3. Rate Limiting

Adjust based on expected traffic:
- Development: 100 requests per 15 minutes
- Production: 50-100 requests per 15 minutes
- High traffic: Consider Redis-based rate limiting

---

## 📊 Monitoring Setup

### 1. Error Tracking (Sentry)

**Backend**:
```bash
npm install @sentry/node
```

Add to `server.production.js`:
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Frontend**:
```bash
npm install @sentry/react
```

### 2. Uptime Monitoring

- **UptimeRobot**: https://uptimerobot.com (Free)
- **Pingdom**: https://pingdom.com
- Monitor `/health` endpoint

### 3. Performance Monitoring

- **New Relic**: https://newrelic.com
- **DataDog**: https://datadoghq.com

---

## 🧪 Pre-Deployment Checklist

### Backend
- [ ] All environment variables set
- [ ] MongoDB connection tested
- [ ] Security middleware installed
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Health endpoint returns 200
- [ ] CORS configured for production domain
- [ ] Logs configured (not just console.log)

### Frontend
- [ ] API URL environment variable set
- [ ] Build completes without errors
- [ ] All assessments tested
- [ ] Chat functionality tested
- [ ] Admin dashboard tested
- [ ] Mobile responsive checked
- [ ] Browser compatibility tested

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string tested
- [ ] Backup strategy configured

### Security
- [ ] No sensitive data in code
- [ ] All secrets in environment variables
- [ ] HTTPS enabled (automatic with most hosts)
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] CORS properly configured

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Deploy to Render
        run: curl ${{ secrets.RENDER_DEPLOY_HOOK }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**:
```bash
# Check connection string format
# Verify IP whitelist in MongoDB Atlas
# Test with: node -e "require('mongoose').connect('your-uri').then(() => console.log('OK'))"
```

**TensorFlow.js Errors**:
```bash
# Rebuild dependencies
cd backend
rm -rf node_modules
npm install
```

**Port Already in Use**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Frontend Issues

**API Connection Failed**:
- Check VITE_API_URL is set correctly
- Verify CORS is configured on backend
- Check browser console for errors

**Build Fails**:
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## 📈 Scaling Considerations

### When to Scale

- **Backend**: > 1000 requests/minute
- **Database**: > 10GB data or > 100 concurrent connections
- **Frontend**: > 10,000 daily active users

### Scaling Options

1. **Backend**:
   - Horizontal scaling (multiple instances)
   - Load balancer (AWS ALB, Nginx)
   - Redis for session management
   - Separate ML service

2. **Database**:
   - MongoDB Atlas M10+ tier
   - Read replicas
   - Sharding for large datasets

3. **Frontend**:
   - CDN (Cloudflare, CloudFront)
   - Image optimization
   - Code splitting
   - Service workers

---

## 📞 Support

For deployment issues:
1. Check logs in your hosting platform
2. Verify all environment variables
3. Test health endpoint: `curl https://your-backend.com/health`
4. Check MongoDB connection in Atlas dashboard

---

## 🎉 Post-Deployment

After successful deployment:

1. **Test all features**:
   - Complete each assessment type
   - Test chat functionality
   - Verify admin dashboard
   - Check database storage

2. **Monitor**:
   - Set up uptime monitoring
   - Configure error alerts
   - Monitor database usage

3. **Optimize**:
   - Enable caching
   - Optimize images
   - Monitor performance metrics

4. **Document**:
   - Save all credentials securely
   - Document custom configurations
   - Create runbook for common issues

---

**Deployment Date**: ___________
**Backend URL**: ___________
**Frontend URL**: ___________
**MongoDB Cluster**: ___________
