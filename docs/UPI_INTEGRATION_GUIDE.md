# UPI Payment Integration Guide

## Overview
This document explains the UPI (Unified Payments Interface) payment integration in TypeHaki Arena. UPI is the primary payment method for Indian users and is fully supported through Razorpay.

## Features Implemented

### 1. **UPI Component** (`src/components/UPIPayment.tsx`)
A dedicated React component for displaying UPI payment options with:
- Direct UPI link (opens in user's preferred UPI app)
- Manual UPI ID entry with copy button
- Support for all major UPI apps (Google Pay, PhonePe, Amazon Pay, WhatsApp Pay, BHIM, Paytm, etc.)
- Benefits showcase (instant confirmation, no fees, secure)
- Visual QR code icon for better UX

### 2. **Razorpay Native UPI Support**
Razorpay automatically provides UPI as the primary payment option in their checkout modal. Features include:
- **UPI VPA** (Virtual Payment Address)
- **Instant Payment** - Money transferred within seconds
- **No Extra Charges** - No gateway fees for UPI
- **Auto-detection** - Automatically prioritized for Indian users
- **Multiple Payment Flows**:
  - Intent-based (App to App)
  - Collect-based (Direct UPI)
  - QR Code

### 3. **Payment Methods Available**
When user clicks "Pay", Razorpay checkout offers:
- ✅ UPI (Primary for India)
- ✅ Credit Cards
- ✅ Debit Cards
- ✅ Net Banking
- ✅ Wallets (Google Pay, Amazon Pay)
- ✅ BNPL (Buy Now Pay Later)

## How It Works

### User Flow

```
1. User navigates to Contest Details
   ↓
2. Clicks "Register - Pay ₹X"
   ↓
3. Taken to Payment page
   ↓
4. Sees Two Options:
   a) Direct UPI Payment (opens UPI app immediately)
   b) Razorpay Checkout (multiple payment methods)
   ↓
5. Completes payment
   ↓
6. Receives 6-digit Access Code
   ↓
7. Enters code to access contest
```

### Direct UPI Payment Flow

```
User Clicks "Open in UPI App"
   ↓
UPI Deep Link Triggered: upi://pay?pa=typehaki@upi&pn=TypeHaki%20Arena&am=49&tn=Contest%20Registration
   ↓
Device Opens User's Default UPI App (Google Pay, PhonePe, etc.)
   ↓
User Confirms Payment Details
   ↓
User Enters PIN
   ↓
Payment Confirmation Sent
```

### Razorpay Checkout Flow

```
User Clicks "Pay ₹X"
   ↓
Razorpay Modal Opens
   ↓
User Sees Payment Methods (UPI first)
   ↓
User Selects Payment Method
   ↓
Completes Transaction
   ↓
Access Code Generated (via paymentService.ts)
```

## Implementation Details

### UPI Payment Component Props

```typescript
interface UPIPaymentProps {
    upiId?: string;              // Default: 'typehaki@upi'
    amount: number;              // Amount in INR
    recipientName?: string;      // Default: 'TypeHaki Arena'
}
```

### UPI Deep Link Format

```
upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&tn=<TRANSACTION_NOTE>
```

**Parameters:**
- `pa` - Payee VPA (UPI ID)
- `pn` - Payee Name (URL encoded)
- `am` - Amount in decimal (no currency symbol)
- `tn` - Transaction Note (URL encoded)

### Integration in Payment.tsx

```typescript
// Import the UPI component
import { UPIPayment } from "@/components/UPIPayment";

// Use in render
<UPIPayment 
    upiId="typehaki@upi" 
    amount={round.entryFee}
    recipientName="TypeHaki Arena"
/>
```

## Supported UPI Apps

1. **Google Pay** - Recommended, largest user base
2. **PhonePe** - Popular in India
3. **Amazon Pay** - Integrated with Amazon accounts
4. **WhatsApp Pay** - Growing user base
5. **BHIM** - Government's UPI app
6. **Paytm** - Wallet + UPI
7. **iMobile** - ICICI Bank's app
8. **Other Banks' UPI Apps** - Yes Bank, HDFC, AXIS, etc.

## Security Features

- ✅ **256-bit Encryption** - All UPI transactions encrypted
- ✅ **PIN Protection** - User's UPI PIN protects transactions
- ✅ **RBI Regulated** - NPCI (National Payments Corporation of India) oversight
- ✅ **Instant Verification** - Real-time transaction confirmation
- ✅ **No Payment Reversals** - UPI is immediate and non-reversible
- ✅ **Bank-Grade Security** - Settled through NPCI infrastructure

## Configuration

### Environment Variables (.env.local)

```
VITE_RAZORPAY_KEY_ID=rzp_test_SDHnkrwN9OLntR
VITE_RAZORPAY_KEY_SECRET=cGnz7TzuMaNj2lr0D6BPie0I
VITE_UPI_ID=typehaki@upi
```

### Razorpay Configuration (paymentService.ts)

```typescript
// Razorpay automatically prioritizes UPI
// No additional UPI configuration needed
// Just ensure Razorpay API key is valid
```

## Testing

### Test Mode (Current)
Using Razorpay test credentials:
- **Key ID**: rzp_test_SDHnkrwN9OLntR
- **Secret**: cGnz7TzuMaNj2lr0D6BPie0I

### Test UPI Transactions
Visit [Razorpay Docs - Test Credentials](https://razorpay.com/docs/payment-gateway/test-credentials/) for:
- Test UPI IDs
- Dummy payment flows
- Success/failure scenarios

### Production Migration
When ready for production:
1. Get Live API Keys from Razorpay Dashboard
2. Update .env.local with production keys
3. Remove test mode configurations
4. Test with small real transactions first

## Analytics & Monitoring

The payment service tracks:
- Payment method selected
- Payment success/failure
- Access code generation
- User engagement metrics

Monitor via:
- Firebase Analytics (future integration)
- Razorpay Dashboard
- Application logs

## Benefits of UPI for TypeHaki Arena

| Feature | Benefit |
|---------|---------|
| **No Transaction Fees** | Lower entry cost for users |
| **Instant Settlement** | Quick access code generation |
| **High Success Rate** | 99.9% success rate for UPI |
| **User Friendly** | Single tap payment |
| **Mobile First** | Works on all Android/iOS with UPI |
| **Reduced Cart Abandonment** | Faster checkout process |
| **Better Analytics** | Real-time payment tracking |

## API Integration

### Razorpay Orders API
```typescript
const orderData = {
    amount: 4900, // in paise (₹49.00)
    currency: 'INR',
    receipt: 'round_registration_12345',
    notes: {
        roundId: 'round-1',
        userId: 'user-123',
        userName: 'John Doe'
    }
};
```

### Payment Verification
```typescript
verifyPaymentSignature(orderId, paymentId, signature, secret)
```

## Troubleshooting

### UPI Link Not Opening
- **Cause**: No UPI app installed
- **Solution**: Show "Razorpay Checkout" option as fallback
- **Code**: Already implemented with OR divider

### Payment Confirmation Delay
- **Cause**: Network latency or bank processing
- **Solution**: Show "Processing..." state to user
- **Timeout**: 30 seconds default

### Access Code Not Received
- **Cause**: Payment verification failed
- **Solution**: Retry payment or contact support
- **Check**: localStorage for failed transactions

## Future Enhancements

1. **QR Code Generation** - Dynamic QR codes for payment
2. **UPI Deep Linking** - Better app routing
3. **Payment Intent** - Google Pay integration
4. **Webhook Notifications** - Real-time updates
5. **Recurring Payments** - Subscription support
6. **International UPI** - Cross-border payments (future)

## Support & Documentation

- **Razorpay Docs**: https://razorpay.com/docs
- **UPI Specs**: https://www.npci.org.in/upi
- **Payment Issues**: Check Firebase Console
- **Test Results**: Razorpay Dashboard → Payments

## References

- [Razorpay Payment Gateway](https://razorpay.com)
- [UPI Specification](https://www.npci.org.in/upi)
- [NPCI - National Payments Corporation](https://www.npci.org.in)
- [RBI Payment Systems](https://www.rbi.org.in)
