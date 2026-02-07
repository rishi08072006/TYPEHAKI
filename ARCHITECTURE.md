# Payment Gateway - Technical Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE (React)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Dashboard  │───▶│ RoundDetails │───▶│   Payment    │          │
│  └──────────────┘    └──────┬───────┘    └──────┬───────┘          │
│                             │                    │                  │
│                     ┌───────▼────────┐   ┌───────▼──────────┐      │
│                     │  Access Verifier│   │ Access Code      │      │
│                     │   (if registered)   │ Display          │      │
│                     └───────┬────────┘   └───────┬──────────┘      │
│                             │                    │                  │
│  ┌──────────────┐    ┌──────▼────────┐    ┌─────▼──────────┐      │
│  │ Typing Test  │◀───│Contest Mode    │    │ Success Status │      │
│  └──────────────┘    └────────────────┘    └────────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Uses
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Payment Service (paymentService.ts)              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Access Code Generation & Management                         │  │
│  │  - generateAccessCode() → 6-digit unique code               │  │
│  │  - generateContestAccessCode() → Saves to localStorage      │  │
│  │  - verifyContestAccess() → Validates code + expiry          │  │
│  │  - getContestRegistration() → Retrieves stored data         │  │
│  │  - getUserContestRegistrations() → Lists all registrations  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Razorpay Integration                                        │  │
│  │  - loadRazorpayScript() → Loads Razorpay JS library        │  │
│  │  - initiatePayment() → Opens payment dialog                │  │
│  │  - verifyPaymentSignature() → Validates payment           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Stores/Retrieves
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Storage Layer                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────┐    ┌──────────────────────────────────┐  │
│  │  Local Storage       │    │  Firestore (Recommended)         │  │
│  │  ─────────────────   │    │  ─────────────────────────────   │  │
│  │  contest_registration   │    │  /registrations/{id}             │  │
│  │  _{roundId}_{userId} │    │  - roundId, userId, accessCode  │  │
│  │                      │    │  - paymentId, paymentStatus     │  │
│  │  Data:               │    │  - registeredAt, expiresAt      │  │
│  │  - accessCode        │    │  - validityDays: 30             │  │
│  │  - roundId           │    │                                  │  │
│  │  - userId            │    │  /users/{uid}                    │  │
│  │  - expiresAt: +30d   │    │  - registrations: [...]          │  │
│  │  - registeredAt      │    │                                  │  │
│  │  - paymentId         │    │  /rounds/{roundId}               │  │
│  │                      │    │  - participantCount              │  │
│  └──────────────────────┘    │  - status, entryFee, prize       │  │
│                              └──────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  External Services                                           │  │
│  │  ─────────────────────────────────────────────────────────  │  │
│  │  • Razorpay API - Payment Processing                        │  │
│  │  • Firebase Auth - User Authentication                      │  │
│  │  • Firebase Firestore - Data Persistence                    │  │
│  │  • Email Service - Notifications (optional)                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Registration & Payment Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Browse contests
     ▼
┌──────────────────┐
│  Dashboard View  │
│  (Display Rounds)│
└────┬─────────────┘
     │
     │ 2. Click "View Details"
     ▼
┌──────────────────────────┐
│  RoundDetails Page       │
│  ┌────────────────────┐  │
│  │ Check registration │  │
│  │ (getContestReg...)│  │
│  └────────────────────┘  │
└────┬─────────────────────┘
     │
     ├─ Already Registered?
     │  │ YES
     │  └──▶ Show Access Code + "Enter Contest" Button
     │
     │  NO
     │  └──▶ 3. Click "Register - Pay ₹X"
     │       ▼
     │   ┌──────────────────────┐
     │   │  Payment.tsx         │
     │   │  ┌────────────────┐  │
     │   │  │ Load Razorpay  │  │
     │   │  │   Script       │  │
     │   │  └────────────────┘  │
     │   │        │              │
     │   │        │ 4. initiate  │
     │   │        │   Payment()  │
     │   │        ▼              │
     │   │  ┌────────────────┐  │
     │   │  │ Razorpay       │  │
     │   │  │ Checkout       │  │
     │   │  │ Dialog         │  │
     │   │  └────────────────┘  │
     │   │        │              │
     │   │        │ 5. User      │
     │   │        │    Completes │
     │   │        │    Payment   │
     │   │        ▼              │
     │   │  ┌────────────────┐  │
     │   │  │ Generate Code  │  │
     │   │  │ (generateC...) │  │
     │   │  └────────────────┘  │
     │   │        │              │
     │   │        │ 6. Store     │
     │   │        │    localStorage
     │   │        ▼              │
     │   │  ┌────────────────┐  │
     │   │  │ Show           │  │
     │   │  │ Access Code    │  │
     │   │  └────────────────┘  │
     │   └──────────────────────┘
     │
     │
     └──▶ 7. Return to RoundDetails
          │
          ▼
     ┌──────────────────────┐
     │ RoundDetails         │
     │ (Check registration  │
     │  again)              │
     │ Access Code Shown    │
     └──────────────────────┘
          │
          │ 8. Click "Enter Contest"
          ▼
     ┌──────────────────────────┐
     │ Access Verifier          │
     │ ┌──────────────────────┐ │
     │ │ Enter 6-digit code   │ │
     │ │ (verify Code)        │ │
     │ └──────────────────────┘ │
     └──────────────────────────┘
          │
          │ 9. Code Valid?
          │
          ├─ YES
          │  └──▶ Redirect to TypingTest
          │       └──▶ Start Contest
          │
          └─ NO
             └──▶ Show Error Message
                  └──▶ Ask to enter again
```

---

## Component Hierarchy

```
App
├── AuthProvider
│   ├── Dashboard
│   │   └── RoundCard
│   │       └── Link to RoundDetails
│   │
│   ├── RoundDetails
│   │   ├── if (registered)
│   │   │   ├── Show AccessCode Display
│   │   │   ├── ContestAccessVerifier
│   │   │   │   └── Input 6-digit code
│   │   │   └── "Enter Contest" Button
│   │   │
│   │   └── else (not registered)
│   │       ├── Show Entry Fee Card
│   │       └── "Register - Pay" Button
│   │
│   ├── Payment
│   │   ├── PaymentStatus: "pending"
│   │   │   └── Show order details
│   │   │
│   │   ├── PaymentStatus: "processing"
│   │   │   └── Loading spinner
│   │   │
│   │   ├── PaymentStatus: "success"
│   │   │   └── ContestAccessCode
│   │   │       └── Show 6-digit code
│   │   │
│   │   └── PaymentStatus: "failed"
│   │       └── Retry button
│   │
│   ├── TypingTest
│   │   ├── if (contestMode)
│   │   │   ├── Verify access code
│   │   │   └── Show contest interface
│   │   └── else
│   │       └── Practice mode
│   │
│   └── PaymentConfig (Admin only)
│       ├── Razorpay Key ID input
│       ├── Razorpay Key Secret input
│       ├── Test mode toggle
│       └── Save button

```

---

## State Management Flow

```
Global State (Auth Context)
│
├── user: Firebase User
│   ├── uid
│   ├── email
│   └── ...
│
└── userProfile: UserProfile
    ├── uid
    ├── name
    ├── role (user/admin)
    └── ...

Local Storage
│
└── contest_registration_{roundId}_{userId}
    ├── accessCode: "123456"
    ├── roundId: "round-1"
    ├── userId: "user-123"
    ├── paymentId: "pay_xxx"
    ├── registeredAt: "2026-02-07T10:30:00Z"
    └── expiresAt: "2026-03-09T10:30:00Z" (30 days)

Component State (RoundDetails.tsx)
│
├── registeredAccessCode: string | null
│   └── Retrieved from localStorage on mount
│
└── showAccessVerifier: boolean
    └── Toggle visibility of access code input

Component State (Payment.tsx)
│
├── status: "pending" | "processing" | "success" | "failed"
│   └── Controls which view to show
│
└── accessCode: string | null
    └── Generated after successful payment
```

---

## Sequence Diagram: Complete Payment Flow

```
User                RoundDetails      Payment      PaymentService    Razorpay      Storage
 │                      │                │              │               │             │
 │ Click "Register"     │                │              │               │             │
 ├─────────────────────▶│                │              │               │             │
 │                      │ handleRegisterNow()            │               │             │
 │                      ├──────────────────────────────▶│               │             │
 │                      │                                │               │             │
 │                      │            initiatePayment()   │               │             │
 │                      │                ├──────────────▶│               │             │
 │                      │                │                │ loadScript   │             │
 │                      │                │                ├────────────▶│             │
 │                      │                │                │◀────────────┤             │
 │                      │                │                │ Loaded      │             │
 │                      │                │                │               │             │
 │                      │                │                │ Open Dialog   │             │
 │                      │                │◀───────────────┤◀─────────────┤             │
 │◀─────────────────────┤◀───────────────┤                │               │             │
 │ Razorpay Dialog      │                │                │               │             │
 │ Visible              │                │                │               │             │
 │                      │                │                │               │             │
 │ Enter Card Details   │                │                │               │             │
 │ Click Pay            │                │                │               │             │
 ├─────────────────────────────────────────────────────────▶             │             │
 │                      │                │                │ Process      │             │
 │                      │                │                │ Payment      │             │
 │                      │                │                │───────────────▶           │
 │                      │                │                │              │ Success    │
 │                      │                │                │◀───────────────           │
 │◀───────────────────────────────────────────────────────┤              │             │
 │ Payment Success      │                │                │              │             │
 │ Callback             │                │                │              │             │
 │                      │                │                │              │             │
 │                      │            onSuccess()          │              │             │
 │                      │                ├──────────────▶│              │             │
 │                      │                │ Generate Code │              │             │
 │                      │                │ "123456"      │              │             │
 │                      │                │◀──────────────┤              │             │
 │                      │                │                │              │             │
 │                      │                │ Store Code    │              │             │
 │                      │                │────────────────────────────────▶           │
 │                      │                │                │              │ Stored     │
 │                      │                │◀───────────────────────────────           │
 │                      │                │                │              │             │
 │                      │ status = "success"              │              │             │
 │                      │ accessCode = "123456"           │              │             │
 │◀─────────────────────┤ Show ContestAccessCode          │              │             │
 │                      │                │                │              │             │
 │ Display Access Code  │                │                │              │             │
 │ "123456"             │                │                │              │             │
 │ Save it!             │                │                │              │             │
 │                      │                │                │              │             │
```

---

## Error Handling Flow

```
┌─────────────────────────────────────┐
│        Error Scenarios              │
└─────────────────────────────────────┘
          │           │           │
          ▼           ▼           ▼
    
┌──────────────┐ ┌────────────────┐ ┌──────────────┐
│ Razorpay     │ │ Invalid Code   │ │ Expired Code │
│ Not Loaded   │ │                │ │              │
└──────┬───────┘ └────────┬────────┘ └───────┬──────┘
       │                  │                   │
       ▼                  ▼                   ▼
   
┌──────────────┐ ┌────────────────┐ ┌──────────────┐
│ Show Toast   │ │ Show Alert     │ │ Show Alert   │
│ "Razorpay    │ │ "Invalid code" │ │ "Code        │
│  not loaded" │ │ Ask to retry   │ │ Expired"     │
└──────────────┘ └────────────────┘ └──────────────┘
       │                  │                   │
       │                  │                   │
       └──────────┬───────┴───────────────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ User Retry       │
         │ Or Help Support  │
         └──────────────────┘
```

---

## Database Schema (Firestore)

```
registrations/
├── {registrationId}
│   ├── roundId (string)
│   ├── userId (string)
│   ├── userName (string)
│   ├── paymentId (string)
│   ├── accessCode (string)
│   ├── paymentStatus (string: "pending" | "completed" | "failed")
│   ├── registeredAt (timestamp)
│   ├── expiresAt (timestamp)
│   └── notes (object) - optional
│       ├── userEmail (string)
│       ├── userCollege (string)
│       └── ...

rounds/
├── {roundId}
│   ├── name (string)
│   ├── entryFee (number)
│   ├── prizePool (number)
│   ├── status (string: "upcoming" | "registration_open" | "active" | "closed")
│   ├── registrationDeadline (timestamp)
│   ├── typingDate (string)
│   ├── typingTimeStart (string)
│   ├── typingTimeEnd (string)
│   ├── typingText (string)
│   ├── duration (number - seconds)
│   ├── participantCount (number)
│   ├── createdAt (timestamp)
│   └── createdBy (string - userId)

users/
├── {userId}
│   ├── uid (string)
│   ├── email (string)
│   ├── name (string)
│   ├── avatar (string)
│   ├── role (string: "user" | "admin")
│   ├── registrations (array)
│   │   └── {accessCode, roundId, expiresAt}
│   ├── createdAt (timestamp)
│   └── ...
```

---

## Environment Variables Required

```
# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx  (frontend)
RAZORPAY_KEY_SECRET=xxxxxxx           (backend only)
RAZORPAY_WEBHOOK_SECRET=xxxxxxx       (backend only)

# Firebase
FIREBASE_API_KEY=xxxxxxx
FIREBASE_AUTH_DOMAIN=xxxxxxx.firebaseapp.com
FIREBASE_PROJECT_ID=xxxxxxx
FIREBASE_STORAGE_BUCKET=xxxxxxx
FIREBASE_MESSAGING_SENDER_ID=xxxxxxx
FIREBASE_APP_ID=xxxxxxx

# Backend
NODE_ENV=development|production
PORT=5000

# Email (optional)
EMAIL_SERVICE_NAME=gmail
EMAIL_USER=xxx@gmail.com
EMAIL_PASSWORD=app-password
```

---

## Security Layers

```
┌──────────────────────────────────────────────────────┐
│        Layer 1: Frontend Validation                  │
│  - Input validation (6 digits for access code)      │
│  - User authentication required                      │
│  - Rate limiting (localStorage + time checks)        │
└──────────────────────────────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────────┐
│    Layer 2: Payment Gateway (Razorpay)              │
│  - PCI-DSS compliant                                │
│  - Encrypted communication                          │
│  - Signature verification                           │
│  - Webhook security                                 │
└──────────────────────────────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────────┐
│      Layer 3: Backend Verification                   │
│  - Payment signature validation                      │
│  - Firestore security rules                         │
│  - Rate limiting + DDoS protection                   │
│  - Logging & monitoring                             │
└──────────────────────────────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────────┐
│       Layer 4: Database Encryption                   │
│  - Firestore encryption at rest                     │
│  - Access control with Firestore rules              │
│  - Regular backups                                  │
└──────────────────────────────────────────────────────┘
```

---

This architecture provides:
✅ Scalable payment processing
✅ Secure access control
✅ User-friendly registration
✅ Admin management capabilities
✅ Multi-layer security
