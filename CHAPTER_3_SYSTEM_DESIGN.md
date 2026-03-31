CHAPTER 3
SYSTEM DESIGN

This chapter presents the detailed system design of the implemented AcaConnect College Event Management System. The system is architected as a modular, workflow-driven platform that integrates event governance, requirement coordination, financial intelligence, participant management, and intelligent automation within a unified and structured architecture. Each module is designed with clearly defined responsibilities and interacts with other modules through controlled interfaces to ensure scalability, maintainability, and institutional compliance.

The design emphasizes algorithm-driven automation, structured approval workflows, secure role-based access control, and data-driven decision-making. The system manages the complete event lifecycle, starting from event proposal and approval to execution, attendance validation, financial consolidation, and certificate issuance.

3.1 SYSTEM ARCHITECTURE OVERVIEW

The system follows a layered modular architecture composed of interconnected functional modules. The core backend logic coordinates workflow orchestration, requirement distribution, financial aggregation, recommendation intelligence, and document generation. The architecture ensures separation of concerns while maintaining controlled data flow between modules.

The major architectural components include:

• Authentication and Role Management
• Event Management and Workflow Orchestration  
• Approval and Governance
• Requirement Distribution using Predicate-Based Routing
• Financial Management with MapReduce Aggregation
• Registration and Participant Handling
• Event Recommendation using Hybrid ML Models
• AI Chatbot with RAG Pipeline
• Notification Management
• Certificate Generation using Template-Based Substitution

Each module is designed to operate independently while contributing to the overall governance and automation objectives of the system.

3.2 AUTHENTICATION AND ROLE-BASED ACCESS CONTROL

Authentication is implemented using JWT (JSON Web Token) based mechanisms to ensure protected access to system resources. Upon successful credential validation through bcrypt password hashing, a JWT token is issued with user role information, enabling stateless session handling.

Role-Based Access Control (RBAC) governs authorization across the system through middleware validation. Each user is assigned a predefined role that determines accessible functionalities and permitted operations. Implemented roles include:

• ADMIN - Full system access
• CHAIRPERSON - Final event approval authority
• GENERAL_SECRETARY - Secondary approval level
• TREASURER - Budget and financial approval
• EVENT_TEAM - Event creation and management
• HR - Human resource allocation
• LOGISTICS - Resource procurement and expense management
• HOSPITALITY - Venue and facility allocation
• TECHOPS - Technical support and attendance management
• STUDENT - Event participation and registration

This structured access model ensures:
• Controlled approval authority through FSM validation
• Secure financial handling with expense tracking
• Restricted certificate issuance based on attendance
• Accountability in workflow transitions with audit trails

3.3 EVENT MANAGEMENT AND WORKFLOW ORCHESTRATION

3.3.1 Event Management Module

The Event Management Module enables structured creation and storage of event proposals using MongoDB schema validation. Each event contains comprehensive metadata including:

• Event title, type, and description
• Schedule (date, time, duration_hours)
• Venue requirements and expected participants
• Resource requirements (volunteers, refreshments, stationery, technical equipment)
• Financial estimates (registration_fee, prize_pool, total_budget)
• Prize distribution structure
• Cover photo and tags for categorization

Events are initially saved in DRAFT state and later submitted for approval through the workflow engine.

3.3.2 Workflow Orchestration Using Finite State Machine (FSM)

The event lifecycle is controlled using a Finite State Machine (FSM) model implemented in fsm.service.js. Each event transitions through predefined states in a strictly validated sequence:

DRAFT → SUBMITTED → UNDER_REVIEW → TREASURER_APPROVED → GENSEC_APPROVED → CHAIRPERSON_APPROVED → PUBLISHED → CANCELLED

The FSM implementation ensures:
• Prevention of unauthorized transitions through middleware validation
• Sequential approval enforcement with role-based permissions
• Traceable state changes with statusHistory logging
• Formal governance compliance with automated notifications

The FSMService class provides methods for:
• canTransition(currentState, targetState, userRole) - Validates transitions
• getValidTransitions(currentState, userRole) - Returns allowed next states
• transitionEvent(eventId, targetState, userRole, comment) - Executes state changes

This structured approach eliminates informal approval practices and ensures transparency.

3.4 APPROVAL AND GOVERNANCE MODULE

The Approval and Governance Module coordinates institutional decision-making through controller-based approval handlers. Each approval stage corresponds to a designated authority with defined validation criteria implemented in approval.controller.js.

The module provides:
• Sequential approval processing with FSM validation
• Rejection handling with feedback comments stored in event schema
• Audit logging of decisions through statusHistory
• Automatic workflow state updates with notification triggers

Role-specific approval methods:
• treasurerApprove() - Budget validation and financial approval
• genSecApprove() - Administrative and policy compliance review  
• chairpersonApprove() - Final institutional approval and publishing

Only after successful completion of all approval stages does an event become PUBLISHED and available for operational execution.

3.5 REQUIREMENT DISTRIBUTION MODULE

After event approval, operational requirements are distributed to respective teams using a Predicate-Based Routing Algorithm implemented in requirementDistributor.service.js.

Each requirement contains structured attributes evaluated through predicate functions:
• Requirement type and category
• Priority level based on event characteristics
• Event identifier and metadata

The routing engine evaluates logical predicates defined in predicate.middleware.js:

```javascript
// HR Distribution Rules
needsVolunteers: (event) => event?.requirements?.volunteers_needed > 0

// Logistics Distribution Rules  
needsRefreshments: (event) => event?.requirements?.refreshments_needed === true
needsStationery: (event) => event?.requirements?.stationary_needed === true
needsTechnical: (event) => event?.requirements?.technical_needed === true

// Hospitality Distribution Rules
needsVenue: (event) => event?.requirements?.rooms_needed > 0
```

The algorithm evaluates these conditions and automatically routes requirements to appropriate teams:
• If needsVolunteers(event) → Route to HR
• If needsRefreshments(event) OR needsStationery(event) → Route to LOGISTICS  
• If needsVenue(event) → Route to HOSPITALITY

Advantages of Predicate-Based Routing:
• Content-aware distribution based on event characteristics
• Elimination of manual forwarding through automated evaluation
• Extensible rule definition with combinator functions (and, or, not)
• Auditable routing decisions with priority scoring

This ensures scalable and structured coordination across operational units.

3.6 FINANCIAL MANAGEMENT MODULE

3.6.1 Budget Aggregation Using MapReduce Algorithm

The Financial Management Module consolidates distributed requirement costs using a MapReduce Algorithm implemented in budgetAggregation.service.js.

The process consists of:

Map Phase:
```javascript
const mapped = requirements.map(r => Number(r.estimated_cost || 0));
```
• Categorization of expenses by requirement type
• Normalization of cost entries to numeric values

Reduce Phase:
```javascript
const total = mapped.reduce((sum, cost) => sum + cost, 0);
```
• Aggregation of costs across all requirements
• Elimination of duplicate entries
• Generation of consolidated financial summary

This approach enables structured cost consolidation across multiple operational teams with O(n) complexity.

3.6.2 Budget Variance Analysis

The budgetVariance.service.js implements variance analysis comparing:
• Predicted vs actual expenses
• Budget allocation vs utilization
• Historical cost patterns for similar events

3.6.3 Expense Tracking and Reporting

The Expense Management component tracks approved expenditures through:
• Bill attachment uploads with file validation
• Expense breakdown by category (refreshments, stationery, technical, certificates)
• Post-event financial reconciliation
• Automated expense submission workflows for logistics team

3.7 REGISTRATION AND PARTICIPANT MANAGEMENT

3.7.1 Event Recommendation Module

The Event Recommendation Module enhances engagement through a hybrid recommendation system implemented in ml-service combining:

Collaborative Filtering (CF):
• User-based CF using cosine similarity for user preference matching
• Item-based CF using tag overlap scoring
• Matrix factorization using TruncatedSVD for latent factor analysis

K-Nearest Neighbors (KNN):
• Feature-based similarity calculation using event attributes
• Distance metrics for event clustering and recommendation

The hybrid model in cf_model.py provides:
```python
def user_based_cf(user_vector, top_k=5):
    user_similarities = cosine_similarity([user_vector], interaction_matrix)[0]
    similar_users = np.argsort(user_similarities)[::-1][:10]
    # Aggregate recommendations from similar users
```

This improves recommendation relevance and adapts dynamically to user behavior patterns.

3.7.2 Registration Module

Participants register for published events through structured forms with:
• Input validation and sanitization
• Payment integration with Razorpay for fee collection
• Registration confirmation with automated notifications
• Capacity management with participant limits

3.7.3 Attendance Management

Attendance validation through techops.controller.js ensures that only verified participants are eligible for certification:
• QR code or manual attendance marking
• PRESENT/ABSENT status tracking
• Integration with certificate generation eligibility
• Bulk attendance operations for large events

3.8 CERTIFICATE GENERATION MODULE

The Certificate Generation Module employs the Template-Based Text Substitution Algorithm (Mail Merge) implemented in certificate.controller.js to generate personalized certificates.

The process includes:
• Retrieval of verified participant records with attendance validation
• Loading of PDF template using pdf-lib library
• Form field substitution using participant and event data
• PDF rendering and secure storage

```javascript
const form = pdfDoc.getForm();
const participantField = form.getTextField('participant_name');
participantField.setText(participant.name);
const eventField = form.getTextField('event_name');
eventField.setText(event.title);
form.flatten(); // Convert form fields to static text
```

The algorithm follows deterministic document generation principles:
Final Certificate = Template + Verified Participant Data + Event Metadata

Benefits of Template-Based Approach:
• Industry-standard document automation using fillable PDF forms
• Scalability for bulk generation with consistent formatting
• Deterministic output with audit trail
• Secure storage with unique filename generation

Certificate authenticity is maintained through database tracking and file integrity validation.

3.9 AI CHATBOT MODULE

The AI Chatbot Module uses Natural Language Processing (NLP) and Retrieval-Augmented Generation (RAG) implemented in chatbot-service to provide context-aware responses.

The RAG pipeline in rag_pipeline.py:
• Detects user intent through sentence transformers
• Retrieves relevant structured event data from ChromaDB vector database
• Augments query context with NIRAL-specific knowledge base
• Generates accurate responses using Ollama LLM integration

```python
def retrieve_context(self, query, top_k=5):
    results = self.collection.query(
        query_texts=[query],
        n_results=top_k
    )
    return contexts
```

The chatbot handles:
• Event information queries
• Registration assistance
• NIRAL 2026 details and schedules
• Contact information and FAQs

This module reduces manual communication overhead and enhances accessibility.

3.10 NOTIFICATION MODULE

The Notification Module provides automated communication across all workflow stages through notification.service.js. Notifications are triggered by system events such as:

• Event state transitions (approval, rejection, publishing)
• Registration confirmations and payment receipts
• Attendance marking and certificate availability
• Requirement acknowledgments and allocations

Delivery channels include:
• Email notifications using nodemailer with SMTP configuration
• In-application alerts through real-time updates
• Role-based notification targeting

This ensures real-time coordination among stakeholders with audit trails.

3.11 DATA STORAGE AND SECURITY

All system data is stored in MongoDB collections with structured schemas supporting:
• Event records with comprehensive metadata
• User profiles with role-based permissions
• Registration and attendance tracking
• Financial records and expense documentation
• Certificate generation logs

Security mechanisms include:
• JWT token-based authentication with expiration
• bcrypt password hashing with salt rounds
• Role-based authorization middleware
• Input validation and sanitization
• File upload restrictions and virus scanning
• Audit logging for all critical operations

These measures ensure confidentiality, integrity, and institutional compliance.

3.12 SUMMARY

This chapter detailed the complete system design and architectural structure of the implemented AcaConnect College Event Management System. By integrating formal algorithms such as Finite State Machine for workflow orchestration, Predicate-Based Routing for requirement distribution, MapReduce for financial aggregation, Hybrid ML models for event recommendation, RAG pipeline for intelligent chatbot assistance, and Template-Based Substitution for certificate generation, the system transforms traditional event coordination into a structured, automated, and scalable governance framework.

The modular architecture ensures transparency, operational efficiency, and intelligent decision support across the entire event lifecycle while maintaining institutional compliance and security standards.