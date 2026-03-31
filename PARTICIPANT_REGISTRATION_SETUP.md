# Participant Registration System Setup

## Overview
Complete participant registration system with email OTP verification for NIRAL 2026.

## Features
- Participant signup with detailed information (name, email, mobile, college, department, year)
- Email OTP verification (6-digit code, 10-minute expiry)
- Secure password hashing with bcrypt
- JWT token-based authentication
- Separate login for participants
- Resend OTP functionality

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install nodemailer
```

### 2. Environment Variables
Add to `.env` file:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

**Gmail App Password Setup:**
1. Go to Google Account Settings
2. Security → 2-Step Verification (enable it)
3. App Passwords → Generate new app password
4. Copy the 16-character password to EMAIL_PASSWORD

### 3. Files Created
- `backend/src/models/Participant.js` - Participant schema
- `backend/src/controllers/participantAuth.controller.js` - Auth logic with OTP
- `backend/src/routes/participantAuth.routes.js` - API routes
- Updated `backend/src/server.js` - Mounted routes at `/participant-auth`

### 4. API Endpoints
- POST `/participant-auth/signup` - Send OTP to email
- POST `/participant-auth/verify-otp` - Verify OTP and complete registration
- POST `/participant-auth/resend-otp` - Resend OTP
- POST `/participant-auth/login` - Login with email/password

## Frontend Setup

### Files Created
- `frontend/src/auth/ParticipantSignup.jsx` - 2-step signup (form + OTP)
- `frontend/src/auth/ParticipantLogin.jsx` - Participant login page
- Updated `frontend/src/App.jsx` - Added routes
- Updated `frontend/src/pages/HomePage.jsx` - Added Sign Up/Login buttons

### Routes
- `/participant-signup` - Registration page
- `/participant-login` - Login page
- `/participant-home` - Protected participant home page

## Database Schema

### Participant Collection
```javascript
{
  name: String (required),
  email: String (unique, required),
  password_hash: String (required),
  mobile: String (required),
  college: String (required),
  department: String (required),
  year: String (required),
  isVerified: Boolean (default: false),
  otp: String (temporary),
  otpExpiry: Date (temporary),
  createdAt: Date,
  updatedAt: Date
}
```

## User Flow

### Registration Flow
1. User fills signup form with all details
2. Backend generates 6-digit OTP and sends to email
3. User enters OTP on verification page
4. Backend verifies OTP and marks account as verified
5. JWT token generated and user logged in
6. Redirect to participant home page

### Login Flow
1. User enters email and password
2. Backend checks if email is verified
3. Password validated with bcrypt
4. JWT token generated
5. Redirect to participant home page

## Security Features
- Password hashing with bcrypt (10 salt rounds)
- OTP expires after 10 minutes
- Email verification required before login
- JWT token with 7-day expiry
- Unique email constraint

## Testing

### Test Signup
1. Go to http://localhost:3000/participant-signup
2. Fill all fields (use real email for OTP)
3. Click "Sign Up"
4. Check email for OTP
5. Enter OTP and verify
6. Should redirect to login page

### Test Login
1. Go to http://localhost:3000/participant-login
2. Enter registered email and password
3. Click "Login"
4. Should redirect to /participant-home

## Styling
- Matches existing login page design
- Split layout with logo on left
- Form on right with gradient styling
- Responsive and accessible

## Notes
- OTP is sent via Gmail SMTP
- Requires Gmail app-specific password (not regular password)
- OTP is 6 digits and expires in 10 minutes
- Unverified accounts can re-register (OTP resent)
- Verified accounts cannot re-register with same email
