# 🚀 ACACONNECT - Complete Startup Guide

## System Architecture
```
Frontend (React) → Backend (Node.js) → ML Service (Flask/Python)
     ↓                    ↓                      ↓
  Port 3000          Port 5000              Port 5001
                         ↓
                    MongoDB
```

## Prerequisites
- Node.js installed
- Python 3.x installed
- MongoDB running

---

## 🔥 Quick Start (3 Terminals)

### Terminal 1: ML Service
```bash
cd ml-service
pip install -r requirements.txt
python app.py
```
✅ ML Service running on http://localhost:5001

### Terminal 2: Backend
```bash
cd backend
npm start
```
✅ Backend running on http://localhost:5000

### Terminal 3: Frontend
```bash
cd frontend
npm start
```
✅ Frontend running on http://localhost:3000

---

## 📝 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | admin123 |
| Event Team | event@test.com | event123 |
| Treasurer | treasurer@test.com | treasurer123 |
| General Secretary | gensec@test.com | gensec123 |
| Chairperson | chair@test.com | chair123 |
| Student | student@test.com | student123 |
| Participant | participant@test.com | participant123 |

---

## 🎯 Testing ML Recommendations

1. Login as **Participant** (participant@test.com / participant123)
2. Click **Events** tab
3. Click **Find Events** button
4. Select interests (e.g., Programming & Coding, Competitive Coding)
5. Click **Suggest Events**
6. See AI-powered recommendations! 🤖

---

## 🔧 Troubleshooting

### ML Service Issues
```bash
# Check if ML service is running
curl http://localhost:5001/health

# Expected response:
{"status": "healthy", "service": "ML Recommendation Service"}
```

### Backend Issues
```bash
# Check if backend is running
curl http://localhost:5000/events/published

# Should return list of published events
```

### MongoDB Issues
```bash
# Check MongoDB connection
mongosh
use college_events
db.events.countDocuments()
```

---

## 📊 System Status Check

✅ ML Service: http://localhost:5001/health
✅ Backend: http://localhost:5000/events/published
✅ Frontend: http://localhost:3000
✅ MongoDB: mongosh → use college_events

---

## 🎉 Features Working

✅ Complete event management workflow
✅ Role-based dashboards (7 roles)
✅ AI-powered event recommendations (KNN with 10 lakh events)
✅ Event creation with cover photos
✅ 4-stage approval process
✅ Budget management
✅ Notification system
✅ Tag-based event categorization
✅ Participant registration system

---

## 📞 Support

For issues, check:
1. All 3 services running (ML, Backend, Frontend)
2. MongoDB is running
3. Ports 3000, 5000, 5001 are available
4. Python dependencies installed
5. Node dependencies installed (npm install)

Happy coding! 🚀
