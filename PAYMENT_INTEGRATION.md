# Payment Gateway Integration Guide

## Overview
This guide explains how to set up and use the payment gateway system with contest registration and access codes.

## Features Implemented

### 1. **Payment Service (`src/lib/paymentService.ts`)**
- Generate unique 6-digit access codes for each contest registration
- Load and integrate Razorpay payment gateway
- Verify payment signatures (backend validation recommended)
- Store registrations with expiry (30 days)
- Retrieve and validate contest access

### 2. **Components**

#### `ContestAccessCode.tsx`
- Displays the generated 6-digit access code after successful payment
- Shows contest details and registration information
- Copy-to-clipboard functionality
- Important instructions and warnings

#### `ContestAccessVerifier.tsx`
- Allows users to enter their 6-digit access code
- Validates the code before allowing contest entry
- Number-only input with auto-formatting
- Clear error messages

### 3. **Updated Pages**

#### `Payment.tsx`
- Integrated payment processing
- Generates unique access codes upon successful payment
- Shows access code to user after payment
- Links to practice and dashboard

#### `RoundDetails.tsx`
- Check if user is already registered
- Display registration status and access code
- Allow entering contest if registered
- Show payment and registration options if not registered

## Setup Instructions

### Step 1: Configure Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Create an account and verify your business
3. Get your **Key ID** and **Key Secret**
4. You'll provide these when users register

### Step 2: Environment Variables (Optional)
Create a `.env` file with your Razorpay keys:
```
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxx
VITE_RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxx
```

### Step 3: Firestore Setup
Add contest registrations collection (optional, currently using localStorage):
```
registrations/
  {roundId}_{userId}/
    - accessCode: string
    - paymentId: string
    - registeredAt: timestamp
    - expiresAt: timestamp
```

## How It Works

### User Flow:

1. **Browse Contests**
   - User views available contests on Dashboard
   - Clicks "View Details" on a contest

2. **See Contest Details** (RoundDetails.tsx)
   - View typing text, rules, and entry fee
   - If not registered, see "Register - Pay ₹X" button

3. **Payment** (Payment.tsx)
   - Click "Register - Pay ₹X"
   - Process payment through Razorpay
   - Upon success, receive unique 6-digit access code
   - Display access code with copy functionality

4. **Store Access Code**
   - Code stored in localStorage with expiry
   - Key format: `contest_registration_{roundId}_{userId}`

5. **Enter Contest** (RoundDetails.tsx)
   - Already registered users see their access code
   - Click "Enter Contest" button
   - ContestAccessVerifier prompts for code
   - Code validated against stored value
   - User redirected to TypingTest if valid

## API Integration (Backend)

### For Production, Implement These Endpoints:

```javascript
// POST /api/payment/create-order
// Create Razorpay order
{
  amount: number,        // in INR
  roundId: string,
  userId: string,
  userName: string
}

Response:
{
  orderId: string,
  amount: number,
  currency: string
}

// POST /api/payment/verify
// Verify payment signature
{
  orderId: string,
  paymentId: string,
  signature: string
}

Response:
{
  success: boolean,
  accessCode: string,
  message: string
}

// POST /api/contest/verify-access
// Verify access code
{
  roundId: string,
  userId: string,
  accessCode: string
}

Response:
{
  valid: boolean,
  message: string
}
```

## Database Schema (Optional)

### Firestore Collections:

```
users/{userId}
  - uid: string
  - email: string
  - name: string
  - role: 'user' | 'admin'
  - registrations: [accessCode, roundId, expiresAt]

rounds/{roundId}
  - name: string
  - entryFee: number
  - registrationDeadline: timestamp
  - typingDate: string
  - typingTimeStart: string
  - typingTimeEnd: string
  - status: 'upcoming' | 'registration_open' | 'active' | 'closed'

registrations/{registrationId}
  - roundId: string
  - userId: string
  - paymentId: string
  - accessCode: string
  - registeredAt: timestamp
  - expiresAt: timestamp
```

## Configuration for Admin

When registering for contests, users can now:
1. Pay entry fee via Razorpay
2. Receive unique 6-digit access code
3. Use code to enter contest during active window
4. Code is valid for 30 days from registration

## Access Code Rules

- **Length**: 6 digits
- **Format**: Random numeric (100000-999999)
- **Validity**: 30 days from registration
- **Scope**: Unique per user, per contest
- **Storage**: localStorage (can be migrated to backend)

## Testing

### Test Razorpay Payments:
Use these test credentials (replace with your real keys after testing):

**Test Card Details:**
- Card: 4111111111111111
- Expiry: Any future date
- CVV: Any 3 digits

## Security Notes

⚠️ **Important**:
1. **Never expose** `KEY_SECRET` in client code
2. Always verify payments on the **backend**
3. Implement proper error handling
4. Add rate limiting to prevent abuse
5. Use HTTPS in production
6. Store access codes securely (consider encrypted localStorage or database)

## Troubleshooting

### "Razorpay not loaded"
- Check if Razorpay script loaded correctly
- Verify internet connection

### "Invalid access code"
- Ensure code hasn't expired (30 days)
- Check if code matches exactly (case-sensitive)
- Verify user is logged in

### "Already registered"
- User can't register twice for same contest
- Payment status must be 'completed'

## Future Enhancements

1. Backend payment verification
2. Email notifications with access code
3. QR code generation for access code
4. Resend code functionality
5. Admin dashboard for managing registrations
6. Analytics on payment and registration metrics
7. Support for multiple payment gateways (Stripe, PayU, etc.)
8. Refund management system

## Support

For issues or questions:
- Check browser console for error messages
- Verify Razorpay credentials
- Ensure Firestore is properly configured
- Check network tab for failed API calls
