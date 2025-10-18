# Mental Health Assessment Platform - Production Guide

## 🎯 Overview

A comprehensive mental health assessment platform with:
- **4 Assessment Types**: PHQ-9, GAD-7, PSS-10, Custom ML
- **TensorFlow.js ML Model**: Neural network for risk assessment
- **Real-time Chat**: Socket.IO doctor-patient communication
- **Admin Dashboard**: Analytics and patient data management
- **MongoDB Storage**: Secure data persistence

---

## 🚀 Quick Production Setup

### 1. Install Dependencies

**Backend**:
```bash
cd backend
npm install
```

**Frontend**:
```bash
npm install
```

### 2. Configure Environment Variables

**Backend** - Create `backend/.env`:
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mental_health_app
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend** - Create `.env.production`:
```env
VITE_API_URL=https://your-backend-domain.com
```

### 3. Start Production Server

**Backend**:
```bash
cd backend
npm start
# Or with PM2: pm2 start ecosystem.config.js
```

**Frontend** (build and serve):
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
gotSomeBrains/
├── backend/
│   ├── middleware/
│   │   └── validation.js          # Input validation
│   ├── ml/
│   │   └── customMLModel.js       # TensorFlow.js model
│   ├── models/
│   │   ├── UserAssessment.js      # Assessment schema
│   │   ├── ChatMessage.js         # Chat schema
│   │   └── ChatRoom.js            # Room schema
│   ├── server.js                  # Development server
│   ├── server.production.js       # Production server (SECURE)
│   ├── package.json
│   └── .env.example
├── src/
│   ├── components/
│   │   ├── assessments/           # Assessment components
│   │   ├── chat/                  # Chat components
│   │   ├── AdminDashboard.tsx     # Admin panel
│   │   └── MentalHealthAssessment.tsx
│   ├── services/
│   │   └── backendService.ts      # API client
│   └── types/
│       └── assessment.ts          # TypeScript types
├── PRODUCTION_CHECKLIST.md        # Pre-deployment checklist
├── DEPLOYMENT_GUIDE.md            # Detailed deployment guide
├── ecosystem.config.js            # PM2 configuration
└── package.json
```

---

## 🔒 Security Features (Production Server)

### ✅ Implemented

1. **Input Validation**: Express-validator on all endpoints
2. **Rate Limiting**: Prevents API abuse
3. **CORS Protection**: Configurable allowed origins
4. **NoSQL Injection Prevention**: Mongo-sanitize
5. **Security Headers**: Helmet.js
6. **Request Size Limits**: 10MB max
7. **Error Handling**: Graceful error responses
8. **Environment Variables**: No hardcoded secrets

### 🔐 Additional Recommendations

- [ ] Add JWT authentication for admin endpoints
- [ ] Implement HTTPS (handled by hosting platform)
- [ ] Add API key authentication
- [ ] Enable audit logging
- [ ] Set up WAF (Web Application Firewall)
- [ ] Regular security audits

---

## 📊 API Endpoints

### Public Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/customML` | Submit assessment | 50/15min |
| GET | `/assessment/:userId` | Get assessment results | 100/15min |
| GET | `/health` | Health check | None |
| GET | `/model/status` | ML model status | 100/15min |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/room` | Create chat room |
| GET | `/chat/room/:roomId` | Get room details |
| GET | `/chat/messages/:roomId` | Get messages |
| GET | `/chat/waiting-rooms` | List waiting rooms |
| POST | `/chat/accept/:roomId` | Doctor accepts room |

### Admin Endpoints (Rate Limited)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/admin/assessments` | List all assessments | 30/15min |
| GET | `/admin/stats` | Get statistics | 30/15min |

### Socket.IO Events

**Client → Server**:
- `join_room`: Join chat room
- `send_message`: Send message
- `typing`: Typing indicator
- `end_chat`: End session

**Server → Client**:
- `user_joined`: User joined notification
- `new_message`: New message received
- `user_typing`: Typing indicator
- `user_left`: User left notification
- `doctor_joined`: Doctor joined
- `chat_ended`: Session ended
- `error`: Error notification

---

## 🗄️ Database Schema

### UserAssessment
```javascript
{
  userId: String (unique),
  assessmentType: String (enum),
  responses: [Number],
  userContext: {
    age_group: String,
    institution_type: String,
    gender: String,
    previous_mental_health_treatment: Boolean
  },
  mlScore: Number,
  riskLevel: String (enum),
  recommendations: [String],
  timestamp: Date
}
```

### ChatRoom
```javascript
{
  roomId: String (unique),
  patientId: String,
  patientName: String,
  doctorId: String,
  doctorName: String,
  status: String (enum: waiting, active, completed),
  priority: String (enum: low, medium, high),
  assessmentData: Object,
  createdAt: Date,
  lastActivity: Date
}
```

### ChatMessage
```javascript
{
  roomId: String,
  senderId: String,
  senderName: String,
  senderType: String (patient/doctor),
  message: String,
  timestamp: Date
}
```

---

## 🧪 Testing

### Manual Testing Checklist

**Assessments**:
- [ ] PHQ-9 completes and saves to database
- [ ] GAD-7 completes and saves to database
- [ ] PSS-10 completes and saves to database
- [ ] Custom ML completes and saves to database
- [ ] ML model returns risk levels correctly
- [ ] Error handling works when backend is down

**Chat**:
- [ ] Patient can create chat room
- [ ] Doctor can see waiting rooms
- [ ] Doctor can accept room
- [ ] Messages send and receive in real-time
- [ ] Typing indicators work
- [ ] Chat history loads correctly

**Admin**:
- [ ] Dashboard loads all assessments
- [ ] Statistics display correctly
- [ ] Pagination works
- [ ] Data exports correctly

### Load Testing

```bash
# Install k6
npm install -g k6

# Create test script: load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  let res = http.get('https://your-backend.com/health');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}

# Run test
k6 run load-test.js
```

---

## 📈 Monitoring

### Health Check

```bash
curl https://your-backend.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-10-18T...",
  "uptime": 12345,
  "environment": "production",
  "ml_model_ready": true,
  "database": "connected",
  "memory": {
    "used": 150,
    "total": 512
  }
}
```

### Key Metrics to Monitor

1. **Response Time**: < 500ms for API calls
2. **Error Rate**: < 1%
3. **Database Connections**: Monitor active connections
4. **Memory Usage**: Alert if > 80%
5. **CPU Usage**: Alert if > 80%
6. **Request Rate**: Track requests per minute

### Logging

Production server logs include:
- Request method, path, status, duration
- Error messages with timestamps
- Database connection status
- ML model initialization status

---

## 🔄 Deployment Workflow

### Development → Production

1. **Test locally**:
   ```bash
   cd backend
   npm run dev:production
   ```

2. **Run security audit**:
   ```bash
   npm audit
   npm audit fix
   ```

3. **Build frontend**:
   ```bash
   npm run build
   ```

4. **Test production build**:
   ```bash
   npm run preview
   ```

5. **Deploy backend** (see DEPLOYMENT_GUIDE.md)

6. **Deploy frontend** (see DEPLOYMENT_GUIDE.md)

7. **Verify deployment**:
   - Test health endpoint
   - Complete one assessment
   - Check database for saved data
   - Test chat functionality

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution**:
```bash
# Check connection string
# Verify IP whitelist in MongoDB Atlas
# Test connection:
node -e "require('mongoose').connect('YOUR_URI').then(() => console.log('✅ Connected'))"
```

### Issue: CORS Error

**Solution**:
- Verify `CORS_ORIGIN` in backend .env matches frontend URL
- Check for trailing slashes
- Ensure protocol (http/https) matches

### Issue: Rate Limit Exceeded

**Solution**:
- Adjust `RATE_LIMIT_MAX_REQUESTS` in .env
- Implement user-based rate limiting
- Add Redis for distributed rate limiting

### Issue: TensorFlow.js Model Not Loading

**Solution**:
```bash
cd backend
rm -rf node_modules
npm install
npm rebuild @tensorflow/tfjs
```

### Issue: High Memory Usage

**Solution**:
- Restart server: `pm2 restart all`
- Increase memory limit in PM2 config
- Optimize TensorFlow.js model
- Implement caching

---

## 📞 Production Support

### Emergency Contacts
- **Backend Issues**: Check server logs
- **Database Issues**: MongoDB Atlas dashboard
- **Frontend Issues**: Check browser console

### Useful Commands

```bash
# Check backend status
pm2 status

# View logs
pm2 logs mental-health-backend

# Restart server
pm2 restart mental-health-backend

# Monitor resources
pm2 monit

# Check MongoDB connection
mongosh "YOUR_MONGODB_URI"

# Test API endpoint
curl -X POST https://your-backend.com/health
```

---

## 🎯 Performance Optimization

### Backend
- ✅ Rate limiting implemented
- ✅ Request size limits set
- ✅ Database connection pooling
- ✅ Error handling optimized
- ⏳ TODO: Add Redis caching
- ⏳ TODO: Implement response compression

### Frontend
- ✅ Code splitting (Vite default)
- ✅ Lazy loading components
- ⏳ TODO: Image optimization
- ⏳ TODO: Service worker for PWA
- ⏳ TODO: CDN for static assets

### Database
- ✅ Indexes on userId, roomId
- ✅ Connection retry logic
- ⏳ TODO: Query optimization
- ⏳ TODO: Read replicas for scaling

---

## 📝 Changelog

### v1.0.0 (Production Ready)
- ✅ Security middleware added
- ✅ Input validation implemented
- ✅ Rate limiting configured
- ✅ Environment variables secured
- ✅ Error handling improved
- ✅ Production server created
- ✅ Deployment guides added

---

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Team Here]

---

**Last Updated**: October 18, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
