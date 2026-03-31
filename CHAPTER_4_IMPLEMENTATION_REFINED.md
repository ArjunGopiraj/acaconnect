CHAPTER 4
IMPLEMENTATION OF THE SYSTEM

This chapter presents the comprehensive implementation details of the College Event Management System. The system is realized as a modular, workflow-driven platform integrating secure authentication, structured approval governance, automated requirement distribution, financial aggregation, intelligent event recommendation, conversational AI support, participant management, and automated certificate generation. The implementation combines backend services developed using Node.js and Express, database management through MongoDB with Mongoose, and specialized Python microservices for machine learning and chatbot intelligence.

Each module is implemented using formal algorithms and structured service layers to ensure scalability, maintainability, and compliance with institutional governance standards. The following sections describe the implementation of each module in detail.

4.1 AUTHENTICATION AND AUTHORIZATION MODULE

The authentication module establishes secure access control using JSON Web Tokens (JWT) combined with bcrypt-based password hashing. This ensures stateless authentication and cryptographic protection of user credentials.

User passwords are hashed using salted bcrypt hashing before being stored in the database. During login, the hashed password is compared securely using bcrypt's comparison function. Upon successful authentication, a signed JWT token containing user identity and role information is generated and returned to the client.

**Algorithm 4.1 JWT Authentication Process**

```
Input: Email, Password
Output: JWT Token or Authentication Error

1: function AUTHENTICATE(email, password)
2:    user ← findUserByEmail(email)
3:    if user = null then
4:        return AuthenticationError("Invalid credentials")
5:    end if
6:    isValid ← bcrypt.compare(password, user.hashedPassword)
7:    if ¬isValid then
8:        return AuthenticationError("Invalid credentials")
9:    end if
10:   payload ← {id: user.id, email: user.email, role: user.role}
11:   token ← jwt.sign(payload, JWT_SECRET, {expiresIn: "24h"})
12:   return {success: true, token: token, user: payload}
13: end function
```

JWT validation middleware verifies the token for each protected request. Unauthorized or expired tokens are rejected, ensuring secure resource access.

```javascript
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

4.1.1 Role-Based Access Control (RBAC)

Authorization is enforced through middleware-based Role-Based Access Control (RBAC). Each user is assigned a predefined role, which determines accessible modules and permitted operations.

**Implemented roles include:**
- Administrator: Full system access and user management
- Chairperson: Final approval authority and system oversight
- General Secretary: Administrative approval and policy enforcement
- Treasurer: Financial approval and budget management
- Event Team: Event creation and management
- Human Resources: Human resource allocation and volunteer management
- Logistics: Resource procurement and expense tracking
- Hospitality: Venue allocation and facility management
- Technical Operations: Technical support and attendance management
- Student Participant: Event registration and participation

Role validation ensures:
- Only authorized roles can approve events
- Financial actions are restricted to Treasurer
- Attendance marking is limited to Technical Operations
- Certificate generation is restricted to verified participants

Audit logs record sensitive operations to ensure traceability and accountability.

4.2 EVENT MANAGEMENT MODULE

The Event Management Module handles structured event creation, validation, and storage using MongoDB schemas.

Each event contains:
- Basic information (title, type, description)
- Schedule (date, time, duration)
- Expected participant count
- Resource requirements (volunteers, venue, refreshments, technical support)
- Financial details (registration fee, prize pool)
- Media assets (cover photo upload)

File uploads are handled using multer middleware with file size and type validation. Events are initially saved in DRAFT state before entering the approval workflow.

```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/events/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
```

4.3 FINITE STATE MACHINE (FSM) WORKFLOW IMPLEMENTATION

The approval lifecycle is implemented using a Finite State Machine (FSM) pattern. This ensures structured and controlled transitions between event states.

**Event States:**
DRAFT → SUBMITTED → UNDER_REVIEW → TREASURER_APPROVED → GENSEC_APPROVED → CHAIRPERSON_APPROVED → PUBLISHED → REJECTED → CANCELLED

**Algorithm 4.2 FSM State Transition Validation**

```
Input: Current State, Target State, User Role
Output: Boolean (Valid/Invalid Transition)

1: function CANTRANSITION(currentState, targetState, userRole)
2:    validTransitions ← EventStateMachine.transitions[currentState]
3:    if targetState ∉ validTransitions then
4:        return false
5:    end if
6:    transitionKey ← currentState + " → " + targetState
7:    allowedRoles ← EventStateMachine.rolePermissions[transitionKey]
8:    return userRole ∈ allowedRoles
9: end function
```

The FSM implementation prevents unauthorized state changes and ensures sequential approval enforcement.

```javascript
const EventStateMachine = {
  states: {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    TREASURER_APPROVED: 'Approved by Treasurer',
    GENSEC_APPROVED: 'Approved by Gen Sec',
    CHAIRPERSON_APPROVED: 'Approved by Chairperson',
    PUBLISHED: 'Published',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled'
  },

  transitions: {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
    UNDER_REVIEW: ['TREASURER_APPROVED', 'REJECTED'],
    TREASURER_APPROVED: ['GENSEC_APPROVED', 'REJECTED'],
    GENSEC_APPROVED: ['CHAIRPERSON_APPROVED', 'REJECTED'],
    CHAIRPERSON_APPROVED: ['PUBLISHED', 'REJECTED'],
    PUBLISHED: ['CANCELLED'],
    REJECTED: ['SUBMITTED'],
    CANCELLED: []
  }
};
```

4.4 REQUIREMENT DISTRIBUTION USING PREDICATE-BASED ROUTING

After event approval, operational requirements are distributed using a Predicate-Based Routing Algorithm. Logical predicates evaluate event attributes to assign responsibilities automatically.

**Algorithm 4.3 Predicate-Based Requirement Distribution**

```
Input: Event Object
Output: Team-wise Requirement Assignments

1: function DISTRIBUTEREQUIREMENTS(event, rules)
2:    distribution ← {}
3:    for each rule in rules do
4:        matches ← evaluatePredicate(rule.predicate, event)
5:        if matches then
6:            distribution[rule.team] ← {
7:                priority: calculatePriority(rule.priority, event),
8:                requirements: extractRequirements(rule.requirements, event),
9:                event_id: event._id,
10:               event_title: event.title
11:           }
12:       end if
13:   end for
14:   return distribution
15: end function
```

**Predicate Rules:**
- If volunteers_needed > 0 → Assign to HR
- If refreshments_needed OR stationery_needed → Assign to Logistics
- If rooms_needed > 0 → Assign to Hospitality
- If technical_needed → Assign to Technical Operations

Predicates are implemented as modular logical functions, enabling extensibility and structured coordination.

```javascript
const predicates = {
  needsVolunteers: (event) => event?.requirements?.volunteers_needed > 0,
  needsVenue: (event) => event?.requirements?.rooms_needed > 0,
  needsRefreshments: (event) => event?.requirements?.refreshments_needed === true,
  needsStationery: (event) => event?.requirements?.stationary_needed === true,
  needsTechnical: (event) => event?.requirements?.technical_needed === true
};
```

This automated routing mechanism reduces manual communication and ensures efficient operational planning.

4.5 FINANCIAL MANAGEMENT MODULE

The financial module aggregates distributed costs and performs variance analysis.

4.5.1 MapReduce-Based Budget Aggregation

The MapReduce pattern is implemented for consolidating requirement expenses.

**Algorithm 4.4 MapReduce Aggregation**

```
Input: List of Requirement Costs
Output: Aggregated Budget Total

1: function AGGREGATEBUDGET(requirements)
2:    // MAP Phase
3:    mapped ← []
4:    for each requirement in requirements do
5:        cost ← Number(requirement.estimated_cost || 0)
6:        mapped.append(cost)
7:    end for
8:    
9:    // REDUCE Phase
10:   total ← 0
11:   for each cost in mapped do
12:       total ← total + cost
13:   end for
14:   return total
15: end function
```

This approach provides linear time complexity O(n) and ensures efficient cost consolidation.

```javascript
exports.aggregateBudget = async (eventId) => {
  const requirements = await EventRequirement.findAll({
    where: { event_id: eventId }
  });

  // MAP Phase: Extract and normalize costs
  const mapped = requirements.map(r => Number(r.estimated_cost || 0));

  // REDUCE Phase: Sum all costs
  const total = mapped.reduce((sum, cost) => sum + cost, 0);

  return total;
};
```

4.5.2 Budget Variance Analysis

The system calculates:
- Absolute budget variance
- Percentage deviation
- Budget status classification

This supports financial accountability and cost monitoring.

4.6 REGISTRATION AND PAYMENT PROCESSING

The Registration Module handles participant enrollment and integrates Razorpay for secure payment processing.

**Algorithm 4.5 Event Registration Process**

```
Input: Event ID, Participant ID
Output: Registration Record with Payment Status

1: function REGISTERFOREVENT(eventId, participantId)
2:    event ← Event.findById(eventId)
3:    if event.status ≠ "PUBLISHED" then
4:        return Error("Event not open for registration")
5:    end if
6:    
7:    existingReg ← Registration.findOne({
8:        event_id: eventId,
9:        participant_id: participantId,
10:       payment_status: "COMPLETED"
11:   })
12:   if existingReg exists then
13:       return Error("Already registered")
14:   end if
15:   
16:   registration ← Registration.create({
17:       event_id: eventId,
18:       participant_id: participantId,
19:       registration_fee: event.registration_fee,
20:       payment_status: event.registration_fee > 0 ? "PENDING" : "COMPLETED"
21:   })
22:   return registration
23: end function
```

Payment verification uses HMAC-SHA256 signature validation to ensure transaction authenticity:

```javascript
const body = razorpay_order_id + '|' + razorpay_payment_id;
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(body.toString())
  .digest('hex');

if (expectedSignature !== razorpay_signature) {
  return res.status(400).json({ message: 'Invalid payment signature' });
}
```

Webhook verification ensures transaction authenticity and data integrity.

4.7 MACHINE LEARNING RECOMMENDATION SYSTEM

The recommendation engine implements a hybrid model combining:
- K-Nearest Neighbors (KNN)
- Collaborative Filtering (CF)

4.7.1 KNN-Based Recommendation

Feature vectors are created from user interests and event tags. Cosine similarity is computed to determine nearest events.

**Algorithm 4.6 Hybrid KNN Recommendation**

```
Input: User Interests, Available Events, k (number of recommendations)
Output: Ranked List of Recommended Events

1: function RECOMMENDEVENTS(userInterests, events, k)
2:    userVector ← createStudentVector(userInterests)
3:    userScaled ← scaler.transform([userVector])
4:    
5:    // Learn patterns from training dataset
6:    distances, indices ← knnModel.kneighbors(userScaled, n_neighbors=50)
7:    similarVectors ← X_scaled[indices[0]]
8:    learnedPattern ← mean(similarVectors)
9:    
10:   eventScores ← []
11:   for each event in events do
12:       eventVector ← createStudentVector(event.tags)
13:       eventScaled ← scaler.transform([eventVector])
14:       
15:       patternSimilarity ← cosineSimilarity(learnedPattern, eventScaled)
16:       userSimilarity ← cosineSimilarity(userVector, eventVector)
17:       
18:       hybridScore ← 0.7 × userSimilarity + 0.3 × patternSimilarity
19:       eventScores.append({event_id: event.id, similarity: hybridScore})
20:   end for
21:   
22:   sortedEvents ← sort(eventScores, by=similarity, descending=true)
23:   return sortedEvents[0:k]
24: end function
```

4.7.2 Collaborative Filtering

User-based and item-based filtering are implemented using interaction matrices and cosine similarity.

**Final Recommendation Score:**
Hybrid Score = 0.7 × User Similarity + 0.3 × Pattern Similarity

This improves recommendation accuracy and personalization.

```python
def user_based_cf(user_vector, top_k=5):
    user_similarities = cosine_similarity([user_vector], interaction_matrix)[0]
    similar_users = np.argsort(user_similarities)[::-1][:10]
    
    recommendations = np.zeros(len(df))
    for user_idx in similar_users:
        if user_similarities[user_idx] > 0.1:
            recommendations += interaction_matrix[user_idx] * user_similarities[user_idx]
    
    top_events = np.argsort(recommendations)[::-1][:top_k]
    return recommendations
```

4.8 AI CHATBOT IMPLEMENTATION (RAG PIPELINE)

The chatbot is implemented using a Retrieval-Augmented Generation (RAG) architecture.

**Algorithm 4.7 RAG Query Processing**

```
Input: User Query, Knowledge Base
Output: Context-Aware Response

1: function PROCESSQUERY(query)
2:    intent, confidence ← detectIntent(query)
3:    if intent = "direct_query" then
4:        return handleDirectQuery(query, intent)
5:    end if
6:    
7:    contexts ← retrieveContext(query, top_k=5)
8:    formattedContext ← formatContext(contexts)
9:    
10:   prompt ← createPrompt(query, formattedContext)
11:   response ← ollamaGenerate(prompt, systemPrompt)
12:   
13:   return {
14:       query: query,
15:       response: response,
16:       contexts_used: length(contexts)
17:   }
18: end function
```

The RAG pipeline uses ChromaDB for vector storage and sentence transformers for embedding generation. Intent detection uses semantic similarity to classify user queries and provide direct responses for common questions.

```python
def detect_intent(query, threshold=0.6):
    query_embedding = embedding_model.encode([query])
    
    best_intent = None
    best_score = 0
    
    for intent, template_embeddings in INTENT_EMBEDDINGS.items():
        similarities = cosine_similarity(query_embedding, template_embeddings)[0]
        max_similarity = np.max(similarities)
        
        if max_similarity > best_score and max_similarity > threshold:
            best_score = max_similarity
            best_intent = intent
    
    return best_intent, best_score
```

This ensures context-aware and institution-specific assistance.

4.9 CERTIFICATE GENERATION USING MAIL MERGE

Certificate generation is implemented using a Template-Based Text Substitution (Mail Merge) algorithm.

**Algorithm 4.8 Certificate Generation**

```
Input: Participant ID, Event ID, Attendance Verification
Output: Generated PDF Certificate

1: function GENERATECERTIFICATE(participantId, eventId)
2:    attendance ← Attendance.findOne({
3:        participant_id: participantId,
4:        event_id: eventId,
5:        attendance_status: "PRESENT"
6:    })
7:    if attendance = null then
8:        return Error("Attendance required for certificate")
9:    end if
10:   
11:   participant ← Participant.findById(participantId)
12:   event ← Event.findById(eventId)
13:   
14:   templateBytes ← readFile("certificate-template.pdf")
15:   pdfDoc ← PDFDocument.load(templateBytes)
16:   form ← pdfDoc.getForm()
17:   
18:   form.getTextField('participant_name').setText(participant.name)
19:   form.getTextField('college_name').setText(participant.college)
20:   form.getTextField('event_name').setText(event.title)
21:   form.getTextField('event_date').setText(formatDate(event.date))
22:   
23:   form.flatten()
24:   finalPdfBytes ← pdfDoc.save()
25:   
26:   filename ← generateUniqueFilename(participantId, eventId)
27:   certificatePath ← savePDF(finalPdfBytes, filename)
28:   
29:   Certificate.create({
30:       participant_id: participantId,
31:       event_id: eventId,
32:       certificate_path: certificatePath,
33:       generated_at: currentTimestamp()
34:   })
35:   
36:   return certificatePath
37: end function
```

The pdf-lib library is used for PDF manipulation. Certificates are generated only for verified participants with confirmed attendance.

```javascript
const generateCertificate = async (participantId, eventId) => {
  const templatePath = path.join(__dirname, '../../certificate-template.pdf');
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  
  const form = pdfDoc.getForm();
  
  // Fill form fields with participant and event data
  const participantField = form.getTextField('participant_name');
  participantField.setText(participant.name);
  
  const eventField = form.getTextField('event_name');
  eventField.setText(event.title);
  
  // Flatten form to convert fields to static text
  form.flatten();
  
  const finalPdfBytes = await pdfDoc.save();
  return certificatePath;
};
```

4.10 NOTIFICATION SYSTEM IMPLEMENTATION

The notification system is event-driven and triggered by:
- Workflow transitions
- Registration confirmation
- Payment verification
- Certificate availability

Email notifications are implemented using nodemailer with SMTP configuration. Notifications are logged for traceability.

```javascript
static async triggerEventHandlers(event, fromState, toState) {
  const NotificationService = require('./notification.service');
  
  const notificationHandlers = {
    'SUBMITTED → UNDER_REVIEW': () => NotificationService.notifyRole(
      'TREASURER', 
      `New event "${event.title}" submitted for budget review`
    ),
    'TREASURER_APPROVED': () => NotificationService.notifyRole(
      'GENERAL_SECRETARY', 
      `Event "${event.title}" approved by Treasurer - awaiting your review`
    ),
    'CHAIRPERSON_APPROVED → PUBLISHED': () => {
      NotificationService.notifyRole('EVENT_TEAM', `Event "${event.title}" published!`);
      NotificationService.notifyRole('STUDENT', `New event available: "${event.title}"`);
    }
  };

  const handlerKey = `${fromState} → ${toState}`;
  if (notificationHandlers[handlerKey]) {
    await notificationHandlers[handlerKey]();
  }
}
```

4.11 FRONTEND AND API INTEGRATION

The frontend is implemented using React.js with:
- Role-based routing
- Context API for state management
- Axios for API communication
- Responsive layout design

The backend follows RESTful API architecture with modular route separation. Python microservices communicate with the backend via HTTP endpoints.

```javascript
function EventsRouter() {
  const { user } = useContext(AuthContext);
  
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case "ADMIN":
      return <AdminEventsPage />;
    case "EVENT_TEAM":
      return <EventTeamEventsPage />;
    case "TREASURER":
      return <TreasurerEventsPage />;
    case "STUDENT":
    case "PARTICIPANT":
      return <ParticipantHomePage />;
    default:
      return <Navigate to="/login" />;
  }
}
```

4.12 SUMMARY

This chapter presented the complete implementation of the College Event Management System. The system integrates multiple formal algorithms and architectural patterns, including:

- JWT Authentication with bcrypt password hashing
- Role-Based Access Control with middleware validation
- Finite State Machine for Workflow Governance
- Predicate-Based Routing for Requirement Distribution
- MapReduce for Financial Aggregation
- Hybrid KNN and Collaborative Filtering for Recommendations
- Retrieval-Augmented Generation for Chatbot Intelligence
- Mail Merge for Certificate Generation
- Event-driven Notification System

The modular and service-oriented implementation ensures scalability, automation, security, and institutional compliance across the entire event lifecycle. The system successfully transforms traditional manual event management processes into an intelligent, automated, and efficient digital platform.