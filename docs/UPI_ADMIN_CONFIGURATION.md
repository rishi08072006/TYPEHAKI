# UPI Payment Configuration Guide for Admins

## Quick Setup

### 1. Get Your UPI ID
You need a business UPI ID to receive payments. Options:

#### Option A: Razorpay Linked Account (Recommended)
```
Setup Time: 2-3 hours
Steps:
1. Login to Razorpay Dashboard
2. Go to Settings → Account Details
3. Add Bank Account Details
4. Complete KYC verification
5. Razorpay generates your UPI ID (e.g., yourhandle@razorpay)
```

#### Option B: ICICI Pockets for Business
```
Setup Time: 1-2 hours
Requirements:
- GST Registration (for business)
- Bank Account in India
- Pan Card

Steps:
1. Download ICICI Pockets app
2. Complete KYC
3. Enable Business Mode
4. Get your UPI ID
```

#### Option C: HDFC BizUPI
```
Setup Time: Same day
Steps:
1. Open HDFC Business account
2. Enable BizUPI
3. Get UPI ID instantly
```

### 2. Update Environment Variables

Edit `.env.local`:

```
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_HERE
VITE_RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE
VITE_UPI_ID=yourhandle@upi
```

### 3. Update UPI Component

Edit `src/components/UPIPayment.tsx`:

```typescript
const UPIPayment: React.FC<UPIPaymentProps> = ({
    upiId = 'your_upi_id@upi',    // ← Change this
    amount,
    recipientName = 'Your Business Name'  // ← Change this
}) => {
```

### 4. Update Payment Page

Edit `src/pages/Payment.tsx`:

```typescript
<UPIPayment 
    upiId="your_upi_id@upi"        // ← Update this
    amount={round.entryFee}
    recipientName="TypeHaki Arena"  // ← Or your business name
/>
```

## Razorpay Integration

### Checking Live Key Status

```
Razorpay Dashboard → Settings → API Keys
```

Look for:
- ✅ Key ID starts with `rzp_live_` (production)
- ✅ Key Secret is generated and secure
- ✅ Test Mode toggle is OFF

### Enabling UPI in Razorpay

```
Razorpay Dashboard → Settings → Payment Methods
```

Check:
- ✅ UPI Method is enabled (default: ON)
- ✅ UPI Intent method is enabled (for app payments)
- ✅ UPI Collect method is enabled (for direct transfers)
```

## Testing Payments (Before Production)

### Step 1: Keep Test Credentials

During testing, keep using test credentials:

```
VITE_RAZORPAY_KEY_ID=rzp_test_SDHnkrwN9OLntR
VITE_RAZORPAY_KEY_SECRET=cGnz7TzuMaNj2lr0D6BPie0I
VITE_UPI_ID=testmerchant@razorpay
```

### Step 2: Test Payment Flow

1. **Direct UPI Payment**
   - Click "Open in UPI App"
   - Select any test UPI ID from Razorpay docs
   - Confirm payment
   - Should show "Payment Successful"

2. **Razorpay Checkout**
   - Click "Pay ₹X"
   - Select UPI from modal
   - Enter test UPI ID
   - Complete transaction
   - Should generate access code

### Step 3: Monitor Transactions

```
Razorpay Dashboard → Payments
- See all test transactions
- View payment method used
- Check settlement status
```

## Production Migration Checklist

- [ ] Get live Razorpay API keys
- [ ] Verify bank account linked to Razorpay
- [ ] Create business UPI ID
- [ ] Update .env.local with live keys
- [ ] Update UPI component with business UPI ID
- [ ] Test with ₹1 payment
- [ ] Verify access code generation
- [ ] Check settlement in bank account
- [ ] Monitor for 24 hours
- [ ] Enable for all users

## Managing Payments

### View All Transactions

```
Razorpay Dashboard → Payments

Columns visible:
- Order ID
- Amount
- Status (captured/failed)
- Method (UPI, Card, etc.)
- User Email
- Timestamp
```

### Refunds

```
Process:
1. Razorpay Dashboard → Payments
2. Click on transaction
3. Click "Refund"
4. Enter refund amount
5. Confirm

Timeline:
- UPI: 2-4 hours (varies by bank)
- Cards: 5-7 business days
- Instant Settlement: ₹5000-₹100,000 per transaction
```

### Settlement Account

```
Razorpay → Settings → Settlements

Check:
- Settlement Status
- Settlement Amount
- Next Settlement Date
- Bank Account Details
```

## Pricing & Costs

### Razorpay UPI Transaction Fees

```
Domestic UPI: 0% (No charges)
International: 2% + GST (if enabled)

Example: ₹100 entry fee
Cost to customer: ₹100
Received in account: ₹100
Razorpay fee: ₹0
```

### Razorpay Dashboard Charges

```
Basic Plan: ₹0
Payments: Only fees on transactions
Annual Maintenance: ₹0
```

## Security Best Practices

### API Key Security

```
✓ Never commit .env.local to git
✓ Rotate keys every 6 months
✓ Use different keys for test and production
✓ Only store in environment variables
✓ Never share keys in logs or error messages
```

### UPI ID Security

```
✓ Business UPI ID (not personal)
✓ Enable 2FA on UPI app
✓ Monitor all transactions
✓ Set spending limits in UPI app
✓ Use separate bank account for business
```

### Access Code Security

```
✓ 6-digit codes are one-time use
✓ 30-day expiry from generation
✓ Stored in encrypted localStorage
✓ Verified before contest access
```

## Troubleshooting

### Issue: UPI Link Not Working

**Solution:**
1. Check UPI ID format (should be handle@bank)
2. Verify UPI app is installed on device
3. Check internet connection
4. Try Razorpay Checkout as fallback

### Issue: Payments Not Settling

**Solution:**
1. Check bank account linked to Razorpay
2. Verify KYC is complete
3. Check settlement status dashboard
4. Contact Razorpay support if stuck 24+ hours

### Issue: High Failed Transactions

**Solution:**
1. Check if UPI ID is correct
2. Verify amount is not too high (limit: ₹1,00,000)
3. Check user's bank/UPI account balance
4. Monitor Razorpay dashboard for patterns

### Issue: Access Codes Not Generating

**Solution:**
1. Check Firebase Firestore connection
2. Verify paymentService.ts is loaded
3. Check browser console for errors
4. Try clearing localStorage and retrying

## Monitoring & Analytics

### Key Metrics to Track

```
1. Total Transactions
   - Daily: Number of payments
   - Success Rate: (Successful / Total) %
   - Average Amount: Total / Count

2. Payment Methods Used
   - UPI: __% (Should be 60-70%)
   - Cards: __% (Should be 20-30%)
   - Wallets: __% (Should be 5-10%)

3. Revenue
   - Daily Revenue
   - Monthly Revenue
   - Settlement Status
   - Fees (Usually: 0% for UPI)

4. User Engagement
   - New registrations
   - Returning users
   - Avg. time to complete payment
```

### Setting Up Alerts

```
Razorpay → Settings → Webhooks

Events to track:
- payment.authorized
- payment.failed
- payment.captured
- refund.created
- settlement.completed

Action: Send webhook to your backend
```

## Future Enhancements

### 1. Subscription Payments
```
Setup recurring UPI payments for:
- Monthly passes
- Annual memberships
- Tournament packages
```

### 2. Payment Analytics
```
Track:
- Most popular payment method
- Peak payment times
- Geographic payment data
- User payment behavior
```

### 3. Dynamic Pricing
```
Adjust prices based on:
- User tier
- Round difficulty
- Early bird discounts
- Group registrations
```

### 4. Webhook Integration
```
Implement server-side verification:
- Payment webhook validation
- Automatic access code generation
- Email confirmations
- Fraud detection
```

## Support Resources

- **Razorpay Dashboard**: https://dashboard.razorpay.com
- **Razorpay Support**: support@razorpay.com
- **Settlement Queries**: settlements@razorpay.com
- **Technical Issues**: https://razorpay.com/docs
- **Live Chat Support**: 24/7 available on dashboard

## FAQs

**Q: Can I accept international UPI payments?**
A: No, UPI is India-only. Use Cards/Wallets for international.

**Q: What's the transaction limit for UPI?**
A: ₹1,00,000 per transaction. For higher, use cards.

**Q: How long does settlement take?**
A: Standard: T+1 day. Instant Settlement: Available up to ₹5000-₹100,000

**Q: Can users dispute UPI payments?**
A: Rarely, as UPI is immediate and non-reversible by design.

**Q: Do I need a separate bank account for payments?**
A: Business account recommended for accounting purposes.

**Q: What if a user completes payment but doesn't get the access code?**
A: Check Firebase connection and manual generate code from admin panel.
