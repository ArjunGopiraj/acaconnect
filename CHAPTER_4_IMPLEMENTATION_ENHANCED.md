CHAPTER 4
IMPLEMENTATION OF THE SYSTEM

This chapter presents the comprehensive implementation of the College Event Management System. The system is realized as a modular, workflow-driven digital platform that automates and governs the complete lifecycle of institutional events. The implementation integrates secure authentication, structured approval workflows, automated requirement routing, financial consolidation, intelligent event recommendation, conversational AI assistance, participant registration management, attendance validation, automated certificate generation, and real-time notification services within a unified and scalable architecture.

The backend services are implemented using Node.js with the Express framework, enabling asynchronous request handling and modular API design. Persistent data storage is managed using MongoDB, with schema enforcement provided through Mongoose to ensure structured and validated data models. Advanced intelligent components such as the recommendation engine and chatbot service are implemented as Python-based microservices, allowing seamless integration of machine learning algorithms and natural language processing pipelines.

The system follows a service-oriented architectural pattern in which each module is logically separated into controllers, services, middleware, and data models. Formal algorithms are employed wherever structured decision-making, routing, validation, aggregation, or prediction is required. This approach ensures scalability, maintainability, transparency, and institutional compliance.

4.1 AUTHENTICATION AND AUTHORIZATION MODULE

4.1.1 Authentication Mechanism

Authentication forms the foundational security layer of the system. The implementation adopts a JSON Web Token (JWT)-based stateless authentication mechanism, eliminating the need for server-side session storage. Unlike traditional session-based approaches where session information is stored on the server, JWT embeds authentication claims directly within a signed token. This significantly improves scalability, especially in distributed or load-balanced deployment environments.

User credentials are never stored in plaintext. Instead, passwords are encrypted using bcrypt hashing with salting before being stored in the database. Salting ensures that identical passwords generate different hash outputs, thereby protecting against rainbow table attacks. Additionally, bcrypt applies a computational cost factor, making brute-force attacks computationally expensive.

During login, the system retrieves the user record using the provided email address. The entered password is compared against the stored hash using bcrypt's secure comparison function. If the credentials are valid, the system generates a JWT token containing the user identifier and role information. This token is digitally signed using a secret key and configured with an expiration period to prevent indefinite validity.

The authentication process can be formally described as follows:

**Algorithm 4.1: JWT Authentication Process**

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

For every protected request, middleware verifies the token's signature and expiration status. If the token is invalid, tampered, or expired, access is denied immediately. This ensures secure and controlled access to system resources.

**Core Implementation:**

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

4.1.2 Role-Based Access Control (RBAC)

Authorization is implemented using middleware-driven Role-Based Access Control (RBAC). Each authenticated user is assigned a predefined role during account creation. These roles determine accessible modules and permissible actions within the system.

The implemented roles include Administrator, Chairperson, General Secretary, Treasurer, Event Team, Human Resources, Logistics, Hospitality, Technical Operations, and Student Participant. Each role corresponds to a specific level of responsibility within the institutional structure.

RBAC enforcement occurs at both the route level and the business logic level. When a request is received, middleware extracts the user's role from the decoded JWT token and verifies whether the requested action is authorized. For example, financial approvals are restricted to the Treasurer role, attendance marking is limited to Technical Operations, and certificate generation is permitted only for verified participants.

**Core Implementation:**

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

All critical operations such as approval decisions, budget updates, and state transitions are recorded in audit logs. Each log entry contains the user ID, action performed, timestamp, and relevant contextual information. This ensures traceability and supports governance compliance requirements.

4.2 EVENT MANAGEMENT MODULE

The Event Management Module facilitates structured creation, editing, and storage of event proposals. Each event is modeled as a MongoDB document validated using a Mongoose schema. Schema validation ensures that event records maintain structural consistency and enforce required attributes.

An event record contains comprehensive metadata including the event title, description, category tags, scheduled date and time, expected participant count, registration fee, prize pool, and resource requirements. Resource requirements may include the number of volunteers, venue allocation, refreshments, stationery, and technical support needs.

**Algorithm 4.2: Event Creation and Validation Process**

```
Input: Event Data, Cover Photo File, User Credentials
Output: Created Event Object or Validation Error

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
```

Server-side validation ensures data integrity by enforcing required fields, data type consistency, and logical constraints such as positive participant count and non-negative financial values. In addition, client-side validation enhances user experience by preventing invalid submissions before reaching the server.

File uploads for event images are handled using multer middleware. The middleware enforces restrictions on file size and MIME type, ensuring only valid image formats are accepted. Uploaded files are stored using unique filenames to prevent collisions.

**Core Implementation:**

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

Events are initially stored in a DRAFT state. At this stage, the event team may edit or update event details. Once finalized, the event is submitted into the workflow orchestration module, where editing privileges become restricted based on workflow state.

This structured event modeling ensures consistency, prevents malformed data entries, and provides a stable foundation for downstream modules such as workflow validation and requirement distribution.

4.3 WORKFLOW ORCHESTRATION USING FINITE STATE MACHINE

4.3.1 Conceptual Foundation

The approval lifecycle is implemented using a Finite State Machine (FSM) model. In this model, each event exists in exactly one state at any given time, and transitions between states are governed by predefined rules. This ensures deterministic and structured state progression.

The event lifecycle follows a hierarchical approval structure:

DRAFT → SUBMITTED → UNDER_REVIEW → TREASURER_APPROVED → GENSEC_APPROVED → CHAIRPERSON_APPROVED → PUBLISHED → REJECTED → CANCELLED

Each transition is validated against allowed state transitions and role permissions.

**Algorithm 4.3: FSM Transition Validation**

```
Input: Current State, Target State, User Role
Output: Valid or Invalid Transition

1: function CANTRANSITION(currentState, targetState, userRole)
2:    validTransitions ← EventStateMachine.transitions[currentState]
3:    if targetState ∉ validTransitions then
4:        return false
5:    end if
6:    transitionKey ← currentState + " → " + targetState
7:    allowedRoles ← EventStateMachine.rolePermissions[transitionKey]
8:    return userRole ∈ allowedRoles
9: end function

10: function TRANSITIONEVENT(eventId, targetState, userRole, comment)
11:    event ← Event.findById(eventId)
12:    if ¬canTransition(event.status, targetState, userRole) then
13:        throw Error("Invalid transition")
14:    end if
15:    previousState ← event.status
16:    event.status ← targetState
17:    event.statusHistory.push({
18:        from: previousState,
19:        to: targetState,
20:        changedBy: userRole,
21:        comment: comment,
22:        timestamp: currentTime()
23:    })
24:    event.save()
25:    triggerNotifications(event, previousState, targetState)
26:    return event
27: end function
```

**Core Implementation:**

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
  },

  rolePermissions: {
    'DRAFT → SUBMITTED': ['EVENT_TEAM'],
    'SUBMITTED → UNDER_REVIEW': ['EVENT_TEAM', 'ADMIN'],
    'UNDER_REVIEW → TREASURER_APPROVED': ['TREASURER', 'ADMIN'],
    'TREASURER_APPROVED → GENSEC_APPROVED': ['GENERAL_SECRETARY', 'ADMIN'],
    'GENSEC_APPROVED → CHAIRPERSON_APPROVED': ['CHAIRPERSON', 'ADMIN'],
    'CHAIRPERSON_APPROVED → PUBLISHED': ['CHAIRPERSON', 'ADMIN']
  }
};
```

This FSM-based implementation prevents skipping approval stages, ensures institutional hierarchy compliance, and provides a complete trace of state transitions.

4.4 REQUIREMENT DISTRIBUTION MODULE

Once an event is approved, operational requirements must be systematically assigned to relevant departments. This module implements a Predicate-Based Routing Algorithm, inspired by content-based routing principles used in enterprise systems.

Each routing rule consists of a logical predicate evaluating event attributes and mapping them to designated departments. For example, if volunteers are required, the requirement is routed to Human Resources. If refreshments or stationery are needed, the request is routed to Logistics. Venue allocation requirements are directed to Hospitality, while technical support requirements are assigned to Technical Operations.

**Algorithm 4.4: Predicate-Based Requirement Distribution**

```
Input: Event Object, Distribution Rules
Output: Team-wise Requirement Allocation

1: function DISTRIBUTEREQUIREMENTS(event, rules)
2:    distribution ← {}
3:    for each rule in rules do
4:        matches ← evaluatePredicate(rule.predicate, event)
5:        if matches then
6:            distribution[rule.team] ← {
7:                priority: calculatePriority(rule.priority, event),
8:                requirements: extractRequirements(rule.requirements, event),
9:                event_id: event._id,
10:               event_title: event.title,
11:               event_date: event.date
12:           }
13:       end if
14:   end for
15:   return distribution
16: end function

17: function EVALUATEPREDICATE(predicate, event)
18:    return predicate(event)
19: end function

20: function CALCULATEPRIORITY(priorityFunc, event)
21:    if isHighPriority(event) then
22:        return 10
23:    else
24:        return 5
25:    end if
26: end function
```

**Core Implementation:**

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

// Distribution Rules Configuration
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

This automated routing eliminates manual communication delays, ensures structured delegation of responsibilities, and supports extensibility by allowing new routing rules to be defined without modifying core logic.

4.5 FINANCIAL MANAGEMENT MODULE

The Financial Management Module consolidates distributed cost entries and supports structured budget monitoring. Financial transparency is critical for institutional compliance and accountability.

4.5.1 MapReduce-Based Budget Aggregation

The system adopts a MapReduce aggregation pattern for budget consolidation. In the Map phase, estimated costs from individual requirement submissions are extracted and normalized. In the Reduce phase, these values are aggregated to compute the total estimated budget.

**Algorithm 4.5: MapReduce Budget Aggregation**

```
Input: List of Requirement Costs
Output: Total Budget

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

**Core Implementation:**

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

This approach provides linear time complexity O(n), ensuring efficient performance even for large-scale events involving numerous cost entries.

4.5.2 Budget Variance Analysis

After event completion, actual expenditure is compared against the estimated budget. The system computes absolute variance and percentage deviation. Based on predefined thresholds, the budget is classified as under budget, within budget, or over budget.

**Algorithm 4.6: Budget Variance Analysis**

```
Input: Predicted Budget, Actual Expenses
Output: Variance Analysis Report

1: function CALCULATEVARIANCE(predicted, actual)
2:    variance ← actual - predicted
3:    percentageVariance ← (variance / predicted) × 100
4:    if |percentageVariance| ≤ 10 then
5:        status ← "WITHIN_BUDGET"
6:    else if percentageVariance > 10 then
7:        status ← "OVER_BUDGET"
8:    else
9:        status ← "UNDER_BUDGET"
10:   end if
11:   return {
12:       absolute_variance: variance,
13:       percentage_variance: percentageVariance,
14:       status: status
15:   }
16: end function
```

This analytical capability supports financial oversight, post-event auditing, and strategic planning for future events.

4.6 REGISTRATION AND PAYMENT PROCESSING

The Registration Module manages participant enrollment. Registration is permitted only when the event state is PUBLISHED. Duplicate registrations are prevented through database-level validation checks.

**Algorithm 4.7: Event Registration Process**

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

If the event requires payment, integration with Razorpay is used to generate payment orders. Upon payment completion, the system verifies transaction authenticity using HMAC-SHA256 signature validation. This cryptographic verification ensures transaction integrity and prevents tampering.

**Core Implementation:**

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

Webhook endpoints handle asynchronous payment confirmations, ensuring secure and reliable transaction processing.

4.7 MACHINE LEARNING RECOMMENDATION MODULE

The recommendation engine enhances user engagement through a hybrid model combining K-Nearest Neighbors (KNN) and Collaborative Filtering (CF).

In the KNN component, event and user features are converted into vector representations using tag encoding and normalization. Cosine similarity is used to identify nearest neighbors, ensuring content-based similarity matching.

**Algorithm 4.8: Hybrid KNN Event Recommendation**

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

In the Collaborative Filtering component, user interaction matrices are analyzed to identify similar user behavior patterns. Similarity scores influence recommendation ranking.

**Core Implementation:**

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
```

The final recommendation score is computed as:

**Hybrid Score = 0.7 × User Similarity + 0.3 × Pattern Similarity**

This hybrid approach balances personalization and pattern-based learning, improving recommendation accuracy and handling cold-start scenarios.

4.8 AI CHATBOT IMPLEMENTATION (RAG PIPELINE)

The chatbot module is implemented using a Retrieval-Augmented Generation (RAG) architecture. Instead of generating responses purely from a language model, the system first retrieves relevant institutional data from a vector database.

**Algorithm 4.9: RAG Query Processing**

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

19: function DETECTINTENT(query, threshold=0.6)
20:    queryEmbedding ← embeddingModel.encode([query])
21:    bestIntent ← null
22:    bestScore ← 0
23:    
24:    for each intent, templateEmbeddings in INTENT_EMBEDDINGS do
25:        similarities ← cosineSimilarity(queryEmbedding, templateEmbeddings)
26:        maxSimilarity ← max(similarities)
27:        
28:        if maxSimilarity > bestScore AND maxSimilarity > threshold then
29:            bestScore ← maxSimilarity
30:            bestIntent ← intent
31:        end if
32:    end for
33:    
34:    return bestIntent, bestScore
35: end function
```

The pipeline consists of query embedding generation, similarity search within ChromaDB, context retrieval, prompt augmentation, and response generation using a local language model. This ensures context-aware and institution-specific responses while minimizing hallucinations.

**Core Implementation:**

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

The RAG pipeline improves accuracy, supports knowledge grounding, and reduces manual coordination effort.

4.9 CERTIFICATE GENERATION MODULE

Certificate generation is implemented using a Template-Based Mail Merge Algorithm. Certificates are generated only for participants with verified attendance status.

**Algorithm 4.10: Certificate Generation Process**

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

The system loads a predefined PDF template, replaces placeholder fields with participant and event details, flattens the form to prevent modification, and stores the generated certificate securely.

**Core Implementation:**

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
  
  fs.writeFileSync(certificatePath, finalPdfBytes);
  return certificatePath;
};
```

This deterministic document generation approach ensures scalability, consistency, and secure tracking of issued certificates.

4.10 NOTIFICATION SYSTEM

The Notification Module operates in an event-driven manner. Notifications are triggered during workflow transitions, registration confirmations, payment verification, and certificate availability.

**Algorithm 4.11: Event-Driven Notification System**

```
Input: Event Object, Previous State, New State
Output: Targeted Notifications

1: function TRIGGERNOTIFICATIONS(event, fromState, toState)
2:    notificationHandlers ← getNotificationHandlers()
3:    transitionKey ← fromState + " → " + toState
4:    
5:    if transitionKey exists in notificationHandlers then
6:        handler ← notificationHandlers[transitionKey]
7:        handler.execute(event)
8:    end if
9:    
10:   if toState has specific handler then
11:       specificHandler ← notificationHandlers[toState]
12:       specificHandler.execute(event)
13:   end if
14:   
15:   logNotification(event, fromState, toState)
16: end function

17: function SENDNOTIFICATION(recipients, subject, message)
18:    for each recipient in recipients do
19:        emailOptions ← createEmailOptions(recipient, subject, message)
20:        transporter.sendMail(emailOptions)
21:        logDelivery(recipient, subject, timestamp())
22:    end for
23: end function
```

Messages are delivered through email and in-application alerts. Delivery logs are maintained to ensure traceability. Role-based targeting ensures that notifications are sent only to relevant stakeholders.

**Core Implementation:**

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

4.11 FRONTEND AND SERVICE INTEGRATION

The frontend is developed using React.js with role-based routing, centralized state management using Context API, and Axios-based REST communication. The UI is responsive and structured according to user roles.

**Algorithm 4.12: Role-Based Frontend Routing**

```
Input: User Authentication Context
Output: Role-Specific Component Rendering

1: function ROUTEBASEDONROLE(user)
2:    if user = null then
3:        return NavigateToLogin()
4:    end if
5:    
6:    switch user.role do
7:        case "ADMIN":
8:            return AdminEventsPage()
9:        case "EVENT_TEAM":
10:           return EventTeamEventsPage()
11:       case "TREASURER":
12:           return TreasurerEventsPage()
13:       case "GENERAL_SECRETARY":
14:           return GeneralSecretaryEventsPage()
15:       case "CHAIRPERSON":
16:           return ChairpersonEventsPage()
17:       case "STUDENT", "PARTICIPANT":
18:           return ParticipantHomePage()
19:       default:
20:           return NavigateToLogin()
21:   end switch
22: end function
```

Backend services expose modular REST endpoints. Python-based ML and chatbot microservices communicate via HTTP APIs, ensuring seamless integration of intelligent modules with the core system.

**Core Implementation:**

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

4.12 SUMMARY

This chapter presented the detailed implementation of the College Event Management System. The system integrates secure authentication, structured workflow governance, automated routing, financial aggregation, intelligent recommendation, AI-driven assistance, and automated certification within a scalable architecture.

The use of formal algorithms such as JWT authentication, Finite State Machine validation, Predicate-Based Routing, MapReduce aggregation, Hybrid KNN-CF recommendation, Retrieval-Augmented Generation, and Mail Merge automation ensures reliability, scalability, and institutional compliance.

Key algorithmic contributions include:
- **JWT Authentication Process** for secure stateless authentication
- **FSM Transition Validation** for structured workflow governance
- **Predicate-Based Requirement Distribution** for automated task routing
- **MapReduce Budget Aggregation** for efficient financial consolidation
- **Hybrid KNN-CF Recommendation** for personalized event suggestions
- **RAG Query Processing** for context-aware chatbot responses
- **Template-Based Certificate Generation** for automated document creation
- **Event-Driven Notification System** for real-time stakeholder communication

The implementation transforms traditional manual event coordination into a structured, secure, and intelligent digital governance platform suitable for institutional deployment. The modular architecture ensures that each component can be independently maintained, scaled, and enhanced while maintaining system integrity and performance.