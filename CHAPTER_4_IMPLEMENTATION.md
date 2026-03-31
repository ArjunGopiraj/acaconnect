CHAPTER 4
IMPLEMENTATION OF THE SYSTEM

This chapter details the various modules and submodules that constitute the implementation of the proposed AcaConnect College Event Management System. Each section describes the methodologies, algorithms, and technologies employed in realizing the functionalities of the system, from initial authentication and event creation to final certificate generation and intelligent recommendations.

4.1 AUTHENTICATION AND AUTHORIZATION MODULE

The authentication system forms the foundation of secure access control within AcaConnect. This module implements JWT-based stateless authentication combined with role-based authorization to ensure proper access control across all system functionalities.

4.1.1 JWT Token-Based Authentication

The authentication process utilizes JSON Web Tokens (JWT) for secure, stateless session management. Upon successful credential validation, the system generates a signed JWT containing user information and role data.

Algorithm 4.1 JWT Authentication Process
Input: User credentials (email, password)
Output: JWT token or authentication error
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

The implementation uses bcryptjs for password hashing with salt rounds and jsonwebtoken library for token generation and verification. The middleware validates tokens on protected routes:

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

4.1.2 Role-Based Access Control (RBAC)

The system implements a comprehensive RBAC mechanism with predefined roles and permissions. Each role has specific access rights to different system functionalities:

```javascript
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied for this role' 
      });
    }
    next();
  };
};
```

Role hierarchy and permissions:
- ADMIN: Full system access and user management
- CHAIRPERSON: Final approval authority and system oversight
- GENERAL_SECRETARY: Administrative approval and policy enforcement
- TREASURER: Financial approval and budget management
- EVENT_TEAM: Event creation and management
- HR: Human resource allocation and volunteer management
- LOGISTICS: Resource procurement and expense tracking
- HOSPITALITY: Venue allocation and facility management
- TECHOPS: Technical support and attendance management
- STUDENT/PARTICIPANT: Event registration and participation

4.2 EVENT MANAGEMENT MODULE

The Event Management Module handles the complete lifecycle of event creation, validation, and storage using MongoDB with Mongoose ODM for schema validation and data integrity.

4.2.1 Event Creation and Validation

Events are created through a structured process with comprehensive validation and file upload handling using multer middleware:

Algorithm 4.2 Event Creation Process
Input: Event data, cover photo file, user credentials
Output: Created event object or validation error
1: function CREATEEVENT(eventData, file, user)
2:    validateRequiredFields(eventData)
3:    if file exists then
4:        coverPath ← uploadFile(file, 'uploads/events/')
5:    end if
6:    event ← {
7:        title: eventData.title,
8:        type: eventData.type,
9:        description: eventData.description,
10:       cover_photo: coverPath,
11:       tags: parseJSON(eventData.tags),
12:       date: eventData.date,
13:       time: eventData.time,
14:       duration_hours: Number(eventData.duration_hours),
15:       expected_participants: Number(eventData.expected_participants),
16:       requirements: parseRequirements(eventData.requirements),
17:       created_by: user.id,
18:       status: "DRAFT"
19:   }
20:   if event.prize_pool > 0 then
21:       event.prize_distribution ← calculatePrizeDistribution(event.prize_pool)
22:   end if
23:   savedEvent ← Event.create(event)
24:   return savedEvent
25: end function

The implementation includes comprehensive input validation and sanitization:

```javascript
const validateRequiredFields = (body) => {
  const required = ['title', 'type', 'description', 'date', 'time', 
                   'duration_hours', 'expected_participants'];
  for (const field of required) {
    if (!body[field]) {
      throw new Error(`${field} is required`);
    }
  }
};
```

4.2.2 File Upload Management

The system uses multer for handling file uploads with security restrictions:

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

4.3 FINITE STATE MACHINE (FSM) WORKFLOW ORCHESTRATION

The event approval workflow is implemented using a Finite State Machine pattern that ensures proper state transitions and role-based approval authority.

4.3.1 FSM State Definition and Transitions

The FSM defines valid states and transition rules:

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

4.3.2 FSM Validation Algorithm

Algorithm 4.3 FSM State Transition Validation
Input: Current state, target state, user role
Output: Boolean indicating valid transition
1: function CANTRANSITION(currentState, targetState, userRole)
2:    validTransitions ← EventStateMachine.transitions[currentState]
3:    if targetState ∉ validTransitions then
4:        return false
5:    end if
6:    transitionKey ← currentState + " → " + targetState
7:    allowedRoles ← EventStateMachine.rolePermissions[transitionKey]
8:    return userRole ∈ allowedRoles
9: end function

The FSM service provides methods for safe state transitions with audit logging:

```javascript
static async transitionEvent(eventId, targetState, userRole, comment = '') {
  const event = await Event.findById(eventId);
  if (!this.canTransition(event.status, targetState, userRole)) {
    throw new Error(`Invalid transition from ${event.status} to ${targetState}`);
  }

  const previousState = event.status;
  event.status = targetState;
  event.statusHistory.push({
    from: previousState,
    to: targetState,
    changedBy: userRole,
    comment,
    timestamp: new Date()
  });

  await event.save();
  await this.triggerEventHandlers(event, previousState, targetState);
  return event;
}
```

4.4 PREDICATE-BASED REQUIREMENT DISTRIBUTION

The requirement distribution system uses predicate logic to automatically route operational requirements to appropriate teams based on event characteristics.

4.4.1 Predicate Engine Implementation

The predicate engine evaluates logical conditions to determine requirement routing:

Algorithm 4.4 Predicate-Based Requirement Distribution
Input: Event object, distribution rules
Output: Team assignments with requirements
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

The predicate functions are implemented as JavaScript functions that evaluate event properties:

```javascript
const predicates = {
  needsVolunteers: (event) => event?.requirements?.volunteers_needed > 0,
  needsVenue: (event) => event?.requirements?.rooms_needed > 0,
  needsRefreshments: (event) => event?.requirements?.refreshments_needed === true,
  needsStationery: (event) => event?.requirements?.stationary_needed === true,
  needsTechnical: (event) => event?.requirements?.technical_needed === true,
  
  isHighPriority: (event) => {
    const daysUntil = (new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntil <= 3 || 
           event.expected_participants > 200 || 
           event.prize_pool > 50000;
  }
};
```

4.4.2 Distribution Rules Configuration

Distribution rules are configured with predicate conditions and team assignments:

```javascript
this.addRule({
  team: 'HR',
  predicate: (event) => predicates.needsVolunteers(event),
  priority: (event) => predicates.isHighPriority(event) ? 10 : 5,
  requirements: (event) => ({
    volunteers_needed: event.requirements.volunteers_needed,
    expected_participants: event.expected_participants,
    duration_hours: event.duration_hours
  })
});
```

4.5 FINANCIAL MANAGEMENT WITH MAPREDUCE AGGREGATION

The financial management module implements MapReduce algorithm for distributed cost aggregation across multiple requirement categories.

4.5.1 Budget Aggregation Algorithm

Algorithm 4.5 MapReduce Budget Aggregation
Input: List of requirements with estimated costs
Output: Aggregated total budget
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

The implementation provides O(n) complexity for cost aggregation:

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

The system implements variance analysis for comparing predicted vs actual expenses:

```javascript
const calculateVariance = (predicted, actual) => {
  const variance = actual - predicted;
  const percentageVariance = predicted > 0 ? (variance / predicted) * 100 : 0;
  
  return {
    absolute_variance: variance,
    percentage_variance: percentageVariance,
    status: Math.abs(percentageVariance) <= 10 ? 'WITHIN_BUDGET' : 'OVER_BUDGET'
  };
};
```

4.6 REGISTRATION AND PAYMENT PROCESSING

The registration module handles participant enrollment with integrated payment processing using Razorpay API for secure transactions.

4.6.1 Registration Process

Algorithm 4.6 Event Registration Process
Input: Event ID, participant ID, payment details
Output: Registration record with payment status
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

4.6.2 Razorpay Payment Integration

The system integrates with Razorpay for secure payment processing:

```javascript
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createRazorpayOrder = async (req, res) => {
  const { registrationId } = req.params;
  const registration = await Registration.findById(registrationId);
  
  const options = {
    amount: registration.registration_fee * 100, // Amount in paise
    currency: 'INR',
    receipt: `receipt_${registrationId}`,
    notes: {
      registration_id: registrationId,
      event_id: registration.event_id.toString()
    }
  };
  
  const order = await razorpay.orders.create(options);
  res.json({ success: true, order, key_id: process.env.RAZORPAY_KEY_ID });
};
```

4.6.3 Payment Verification

Payment verification uses HMAC-SHA256 signature validation:

```javascript
exports.verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }
  
  // Update registration status
  await Registration.findByIdAndUpdate(registrationId, {
    payment_status: 'VERIFICATION_PENDING',
    payment_id: razorpay_payment_id,
    payment_date: new Date()
  });
};
```

4.7 MACHINE LEARNING RECOMMENDATION SYSTEM

The recommendation system implements a hybrid approach combining K-Nearest Neighbors (KNN) and Collaborative Filtering (CF) algorithms for personalized event suggestions.

4.7.1 Hybrid KNN Implementation

The KNN model uses a pre-trained dataset to learn user preference patterns:

Algorithm 4.7 Hybrid KNN Event Recommendation
Input: User interests, available events, k (number of recommendations)
Output: Ranked list of recommended events
1: function RECOMMENDEVENTS(userInterests, events, k)
2:    userVector ← createStudentVector(userInterests)
3:    userScaled ← scaler.transform([userVector])
4:    
5:    // Learn patterns from 10 lakh dataset
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

The Python implementation uses scikit-learn for KNN and feature scaling:

```python
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity

def create_student_vector(user_domains):
    vector = np.zeros(len(feature_cols))
    for domain in user_domains:
        if domain in feature_cols:
            vector[feature_cols.index(domain)] = 1
    return vector

def recommend_events(user_vector, top_k=5):
    student_df = pd.DataFrame([user_vector], columns=feature_cols)
    student_scaled = scaler.transform(student_df)
    
    distances, indices = knn_model.kneighbors(student_scaled, n_neighbors=50)
    similar_events_vectors = X_scaled[indices[0]]
    learned_pattern = np.mean(similar_events_vectors, axis=0)
    
    return learned_pattern
```

4.7.2 Collaborative Filtering Implementation

The CF algorithm implements both user-based and item-based filtering:

```python
def user_based_cf(user_vector, top_k=5):
    user_similarities = cosine_similarity([user_vector], interaction_matrix)[0]
    similar_users = np.argsort(user_similarities)[::-1][:10]
    
    recommendations = np.zeros(len(df))
    for user_idx in similar_users:
        if user_similarities[user_idx] > 0.1:
            recommendations += interaction_matrix[user_idx] * user_similarities[user_idx]
    
    top_events = np.argsort(recommendations)[::-1][:top_k]
    return [{"event_id": int(df.iloc[idx]["event_id"]), 
             "similarity": float(recommendations[idx])} for idx in top_events]

def item_based_cf(user_interests, events_pool, top_k=5):
    event_scores = []
    for event in events_pool:
        event_tags = event.get('tags', [])
        overlap = len(set(user_interests) & set(event_tags))
        total_tags = len(set(user_interests) | set(event_tags))
        
        if total_tags > 0:
            cf_score = overlap / total_tags
            event_scores.append({
                'event_id': event.get('id'),
                'similarity': float(cf_score)
            })
    
    event_scores.sort(key=lambda x: x['similarity'], reverse=True)
    return event_scores[:top_k]
```

4.8 AI CHATBOT WITH RAG PIPELINE

The AI chatbot implements Retrieval-Augmented Generation (RAG) using sentence transformers and ChromaDB for context-aware responses.

4.8.1 RAG Pipeline Implementation

Algorithm 4.8 RAG-Based Query Processing
Input: User query, knowledge base
Output: Context-aware response
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

The RAG pipeline uses ChromaDB for vector storage and retrieval:

```python
class RAGPipeline:
    def __init__(self):
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.chroma_client = chromadb.PersistentClient(path="./vectorstore")
        self.collection = self.chroma_client.get_or_create_collection(
            name="niral_knowledge"
        )
    
    def retrieve_context(self, query, top_k=5):
        results = self.collection.query(
            query_texts=[query],
            n_results=top_k
        )
        
        contexts = []
        if results['documents'] and len(results['documents']) > 0:
            for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
                contexts.append({
                    'text': doc,
                    'metadata': metadata
                })
        
        return contexts
```

4.8.2 Intent Detection Using Semantic Similarity

The chatbot uses semantic similarity for intent classification:

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

4.9 CERTIFICATE GENERATION MODULE

The certificate generation system uses PDF-lib for template-based document creation with form field substitution.

4.9.1 Template-Based Certificate Generation

Algorithm 4.9 Certificate Generation Process
Input: Participant ID, Event ID, attendance verification
Output: Generated PDF certificate
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

The implementation uses pdf-lib for form field manipulation:

```javascript
const { PDFDocument } = require('pdf-lib');

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
  
  const dateField = form.getTextField('event_date');
  dateField.setText(new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));
  
  // Flatten form to convert fields to static text
  form.flatten();
  
  const finalPdfBytes = await pdfDoc.save();
  const filename = `certificate_${participantId}_${eventId}_${Date.now()}.pdf`;
  const certificatePath = path.join(certificatesDir, filename);
  
  fs.writeFileSync(certificatePath, finalPdfBytes);
  return certificatePath;
};
```

4.10 NOTIFICATION SYSTEM

The notification system provides automated communication across all workflow stages using nodemailer for email delivery and real-time updates.

4.10.1 Event-Driven Notification Triggers

The notification system responds to FSM state transitions and system events:

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

4.10.2 Email Notification Implementation

Email notifications use nodemailer with SMTP configuration:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendNotification = async (to, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">AcaConnect Notification</h2>
        <p>${message}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from AcaConnect Event Management System.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
```

4.11 WEB INTERFACE IMPLEMENTATION

The web interface is built using React.js with a component-based architecture, providing responsive and interactive user experiences across different roles and devices.

4.11.1 Frontend Architecture

The React application follows a modular structure with role-based routing:

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
    case "GENERAL_SECRETARY":
      return <GeneralSecretaryEventsPage />;
    case "CHAIRPERSON":
      return <ChairpersonEventsPage />;
    case "LOGISTICS":
      return <LogisticsEventsPage />;
    case "HR":
      return <HREventsPage />;
    case "HOSPITALITY":
      return <HospitalityEventsPage />;
    case "TECHOPS":
      return <TechopsEventsPage />;
    case "STUDENT":
    case "PARTICIPANT":
      return <ParticipantHomePage />;
    default:
      return <Navigate to="/login" />;
  }
}
```

4.11.2 State Management and API Integration

The frontend uses React Context for global state management and Axios for API communication:

```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwt_decode(token);
    setUser(decoded);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

4.11.3 Responsive Design Implementation

The interface implements responsive design using CSS Grid and Flexbox:

```css
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.event-card {
  background: var(--bg-glass);
  border: 1px solid var(--border-soft);
  border-radius: 18px;
  padding: 1.5rem;
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.5);
}

@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}
```

4.12 BACKEND API ARCHITECTURE

The backend follows RESTful API design principles with Express.js, providing structured endpoints for all system functionalities.

4.12.1 API Route Structure

The API is organized into modular routes with middleware chains:

```javascript
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Route mounting
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/registrations", registrationRoutes);
app.use("/certificates", certificateRoutes);
app.use("/ml", mlRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/notifications", notificationRoutes);
app.use("/logistics", logisticsRoutes);
app.use("/hospitality", hospitalityRoutes);
app.use("/hr", hrRoutes);
app.use("/techops", techopsRoutes);
app.use("/financial", financialRoutes);
```

4.12.2 Database Integration

The system uses MongoDB with Mongoose for data persistence and schema validation:

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
```

4.13 MICROSERVICES INTEGRATION

The system integrates multiple microservices for specialized functionalities:

4.13.1 ML Service Integration

The ML recommendation service runs as a separate Flask application:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/recommend-knn', methods=['POST'])
def get_knn_recommendations():
    data = request.json
    user_interests = data.get('interests', [])
    events_pool = data.get('events', [])
    k = data.get('k', 5)
    
    # Process recommendations using hybrid KNN
    recommendations = process_hybrid_knn(user_interests, events_pool, k)
    
    return jsonify({
        "success": True,
        "recommendations": recommendations,
        "method": "hybrid_knn"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
```

4.13.2 Chatbot Service Integration

The chatbot service provides RAG-based conversational AI:

```python
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_query = data.get('query', '').strip()
    
    # Detect intent and handle direct queries
    intent, confidence = detect_intent(user_query)
    if intent in ['technical_events', 'non_technical_events', 'all_events']:
        return handle_direct_query(intent)
    
    # RAG pipeline for complex queries
    rag = get_rag_pipeline()
    contexts = rag.retrieve_context(user_query, top_k=5)
    formatted_context = rag.format_context(contexts)
    
    # Generate response using Ollama
    ollama = get_ollama_client()
    response = ollama.generate(
        prompt=create_prompt(user_query, formatted_context),
        system_prompt=SYSTEM_PROMPT,
        temperature=0.7
    )
    
    return jsonify({
        "success": True,
        "query": user_query,
        "response": response,
        "contexts_used": len(contexts)
    })
```

4.14 SYSTEM DEPLOYMENT AND CONFIGURATION

The system is configured for development and production environments with proper environment variable management and service orchestration.

4.14.1 Environment Configuration

Environment variables are managed through .env files:

```bash
# Backend Configuration
MONGODB_URI=mongodb://localhost:27017/college_events
JWT_SECRET=supersecretkey123
NODE_ENV=development
PORT=5000

# Email Configuration
EMAIL_USER=niralaca2026@gmail.com
EMAIL_PASSWORD=bqel xxou zbbl ohxs

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_SI14yFNx5QlW4W
RAZORPAY_KEY_SECRET=etu8yWi0bfkvEY04gcsjDsdx
```

4.14.2 Service Startup Scripts

Batch scripts coordinate multiple service startup:

```batch
@echo off
echo Starting AcaConnect Services...

start "Backend" cmd /k "cd backend && npm run dev"
start "Frontend" cmd /k "cd frontend && npm start"
start "ML Service" cmd /k "cd ml-service && python app.py"
start "Chatbot Service" cmd /k "cd chatbot-service && python app.py"

echo All services started successfully!
pause
```

4.15 SUMMARY

This chapter detailed the comprehensive implementation of the AcaConnect College Event Management System. The system successfully integrates multiple advanced technologies including JWT authentication, FSM workflow orchestration, predicate-based routing, MapReduce financial aggregation, hybrid ML recommendations, RAG-based chatbot, and template-based certificate generation.

The modular architecture ensures scalability and maintainability while providing a seamless user experience across different roles and devices. The implementation demonstrates the practical application of theoretical concepts in building a production-ready event management platform that transforms traditional manual processes into an automated, intelligent, and efficient system.

The next chapter will evaluate the system's performance and analyze the results of various implemented algorithms and modules.