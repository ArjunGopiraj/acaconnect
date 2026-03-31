# ACACONNECT - Dashboards and Pages Summary

## Overview
This document provides a comprehensive overview of all dashboards and pages in the ACACONNECT system.

---

## DASHBOARDS (Role-Based)

### 1. **AdminDashboard.jsx**
- **Role**: Administrator
- **Features**:
  - System statistics (users, events, registrations)
  - User management (view all users)
  - Event management (view all events)
  - Event Type Management (create/manage event types)
  - Full system oversight

### 2. **EventTeamDashboard.jsx**
- **Role**: Event Team
- **Features**:
  - Create new events with comprehensive form
  - Event type selection with auto-fill requirements
  - Prize pool configuration (50-30-20 distribution)
  - Duration, venue, participant count
  - Requirements specification (volunteers, rooms, refreshments, etc.)
  - View my created events
  - Submit events for approval
  - Track event status

### 3. **TreasurerDashboard.jsx**
- **Role**: Treasurer
- **Features**:
  - Review pending budget approvals
  - Approve/reject events with budget allocation
  - Set prize pool, registration fee, total budget
  - View approved events
  - Payment verification (online registrations)
  - Onsite payment confirmation
  - Verification history
  - View expenses submitted by logistics
  - Income Manager (analytics)
  - Expense Manager (analytics)
  - Budget Variance Alerts
  - Export reports (CSV/PDF)

### 4. **GeneralSecretaryDashboard.jsx / GenSecDashboard.jsx**
- **Role**: General Secretary
- **Features**:
  - Review events approved by treasurer
  - Edit event details before final approval
  - Approve/reject with comments
  - Send to Chairperson for final approval
  - Monitor all workflows

### 5. **ChairpersonDashboard.jsx**
- **Role**: Chairperson
- **Features**:
  - Final approval of events
  - Auto-publish upon approval
  - View all approved events
  - System-wide oversight

### 6. **LogisticsDashboard.jsx**
- **Role**: Logistics Team
- **Features**:
  - View assigned events
  - Add expense breakdown (refreshments, stationery, technical equipment)
  - Upload bill attachments
  - Submit expenses for treasurer review
  - Track expense status

### 7. **HRDashboard.jsx**
- **Role**: HR Team
- **Features**:
  - View assigned events
  - Allocate volunteers with details (name, role, contact, department)
  - Allocate judges with expertise
  - Mark volunteer allocation as complete

### 8. **HospitalityDashboard.jsx**
- **Role**: Hospitality Team
- **Features**:
  - View assigned events
  - Allocate rooms (room number, name)
  - Allocate computer labs
  - Provide complete venue details
  - Mark venue allocation as complete

### 9. **TechopsDashboard.jsx**
- **Role**: Techops Team
- **Features**:
  - View published events
  - Mark attendance (present/absent)
  - Onsite registration for participants
  - Multi-event registration support
  - Automatic certificate generation on attendance

### 10. **StudentDashboard.jsx**
- **Role**: Student (Basic)
- **Features**:
  - View available events
  - My registrations
  - My certificates
  - AI Chatbot integration
  - Coming soon features

---

## PAGES (Public & Participant)

### 1. **LandingPage.jsx**
- Public landing page
- Hero section with NIRAL branding
- Features showcase
- How it works
- Roles overview
- Call to action

### 2. **ParticipantHomePage.jsx**
- **Main participant interface**
- **Features**:
  - Hero section with NIRAL 2026 branding
  - Browse all published events
  - Event registration with payment
  - My Registrations view
  - My Certificates view
  - AI-powered event suggestions (KNN, CF, Hybrid)
  - Interest-based event finder
  - Payment status tracking
  - Certificate download
  - AI Chatbot assistant
  - Notification system with unread count
  - About NIRAL section
  - Contact information
  - Event details with venue, volunteers, judges

### 3. **EventsPage.jsx**
- Browse all published events
- Event cards with details
- Registration functionality

### 4. **AboutPage.jsx**
- About NIRAL symposium
- History and legacy
- Vision and mission

### 5. **ContactPage.jsx**
- Contact information
- Coordinators details
- Department information

### 6. **HomePage.jsx**
- Common home page for logged-in users
- Welcome banner
- Featured events
- Quick actions

---

## SPECIALIZED PAGES

### 1. **MockPaymentPage.jsx**
- Mock payment interface for testing
- Simulates payment gateway
- Payment ID generation

### 2. **RazorpayPaymentPage.jsx**
- Real Razorpay payment integration
- Payment screenshot upload
- Payment verification flow

### 3. **PaymentSuccessPage.jsx**
- Payment confirmation page
- Registration success message
- Next steps information

### 4. **MyRegistrations.jsx**
- View all user registrations
- Payment status
- Event details

### 5. **TreasurerPaymentVerification.jsx**
- Dedicated payment verification interface
- Screenshot review
- Approve/reject payments

---

## EVENT-SPECIFIC PAGES

### 1. **AdminEventsPage.jsx**
- Admin view of all events
- Complete event management

### 2. **EventTeamEventsPage.jsx**
- Event team's event list
- Create and manage events

### 3. **TreasurerEventsPage.jsx**
- Treasurer's event view
- Budget approval interface

### 4. **GeneralSecretaryEventsPage.jsx**
- Gen Sec's event view
- Edit and approve events

### 5. **ChairpersonEventsPage.jsx**
- Chairperson's event view
- Final approval interface

### 6. **LogisticsEventsPage.jsx**
- Logistics team's event view
- Expense management

### 7. **HREventsPage.jsx**
- HR team's event view
- Volunteer allocation

### 8. **HospitalityEventsPage.jsx**
- Hospitality team's event view
- Venue allocation

### 9. **TechopsEventsPage.jsx**
- Techops team's event view
- Attendance marking

---

## LEGACY/UTILITY PAGES

### 1. **CreateEvent.jsx**
- Legacy event creation form
- May be replaced by EventTeamDashboard

### 2. **EventList.jsx**
- Legacy event listing
- May be replaced by EventsPage

### 3. **Attendance.jsx**
- Legacy attendance marking
- May be replaced by TechopsDashboard

### 4. **Certificate.jsx**
- Legacy certificate generation
- Now automated in backend

---

## WORKFLOW SUMMARY

### Event Creation & Approval Flow:
1. **Event Team** creates event → Status: CREATED
2. **Event Team** submits for approval → Status: PENDING_TREASURER
3. **Treasurer** reviews & approves → Status: TREASURER_APPROVED → PENDING_GEN_SEC
4. **General Secretary** edits & approves → Status: GEN_SEC_APPROVED → PENDING_CHAIRPERSON
5. **Chairperson** final approval → Status: CHAIRPERSON_APPROVED → PUBLISHED

### Event Execution Flow:
1. **Published Event** → Visible to participants
2. **Logistics** adds expenses
3. **HR** allocates volunteers/judges
4. **Hospitality** allocates venue
5. **Participants** register & pay
6. **Treasurer** verifies payments
7. **Techops** marks attendance
8. **System** auto-generates certificates

---

## KEY FEATURES ACROSS DASHBOARDS

### Common Features:
- ✅ Role-based access control
- ✅ Logout functionality
- ✅ Responsive design
- ✅ Modern UI with gradients
- ✅ Status badges
- ✅ Real-time data updates

### Advanced Features:
- ✅ AI/ML event recommendations (KNN, CF, Hybrid)
- ✅ AI Chatbot assistant
- ✅ Payment gateway integration
- ✅ Automatic certificate generation
- ✅ Notification system
- ✅ Financial analytics
- ✅ Budget variance tracking
- ✅ Export functionality (CSV/PDF)
- ✅ Onsite registration
- ✅ Multi-event registration

---

## TECHNOLOGY STACK

### Frontend:
- React.js
- React Router
- Axios
- Context API (AuthContext)

### Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication

### ML Services:
- Python Flask
- Scikit-learn
- KNN, Collaborative Filtering, Hybrid models

### Payment:
- Razorpay integration
- Mock payment for testing

---

## USER ROLES & ACCESS

1. **ADMIN** - Full system access
2. **CHAIRPERSON** - Final approvals, announcements
3. **GENERAL_SECRETARY** - Edit & approve events
4. **TREASURER** - Budget & payment management
5. **EVENT_TEAM** - Create & manage events
6. **LOGISTICS** - Expense management
7. **HR** - Volunteer allocation
8. **HOSPITALITY** - Venue allocation
9. **TECHOPS** - Attendance & onsite registration
10. **STUDENT** - Basic participant access
11. **PARTICIPANT** - Full participant features

---

## STATUS

✅ **All dashboards and pages are functional**
✅ **Complete workflow implemented**
✅ **Modern UI/UX applied**
✅ **Role-based access working**
✅ **Payment system integrated**
✅ **ML recommendations active**
✅ **Certificate generation automated**

---

## NOTES

- ParticipantHomePage is the main interface for participants
- StudentDashboard is a simpler version for basic student access
- Multiple "EventsPage" variants exist for different roles
- Some legacy pages may need cleanup
- All dashboards follow consistent design patterns
- Trophy emoji replaced with certificate emoji in certificate displays
