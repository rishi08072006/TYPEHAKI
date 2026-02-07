# UPI Payment - Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Step 1: Start the Dev Server
```bash
npm run dev
# or
bun dev
```
Visit: http://localhost:8080

### Step 2: Login
1. Click "Auth" or "Dashboard"
2. Sign up with email/password (or use test account)
3. Complete profile setup

### Step 3: Navigate to Payment Test
1. Go to **Dashboard**
2. Find a contest card
3. Click **"Register - Pay ₹X"**

### Step 4: See Both Payment Options

You'll see:

**Option A: Direct UPI Payment**
```
┌─────────────────────────────────┐
│ 💳 Pay with UPI                 │
├─────────────────────────────────┤
│ • Copy UPI ID                   │
│ • Supported Apps: Google Pay... │
│ • Benefits: Instant, No fees    │
└─────────────────────────────────┘
```

**Option B: Razorpay Checkout**
```
┌─────────────────────────────────┐
│ 💰 Complete Payment             │
├─────────────────────────────────┤
│ • Amount: ₹49                   │
│ • Powered by Razorpay           │
│ • [Pay ₹49] Button              │
└─────────────────────────────────┘
```

### Step 5: Test Payment

#### Test UPI Payment
1. Click **"Open in UPI App"**
   - On mobile: Opens your UPI app
   - On desktop: Shows UPI ID to copy
2. Choose any UPI app
3. Complete payment in your app
4. Return to see access code

#### Test Razorpay Checkout
1. Click **"Pay ₹49"**
2. Razorpay modal opens
3. See payment options:
   - 💳 UPI
   - 💳 Cards
   - 💳 Wallets
   - 💳 Net Banking
4. Click any option and complete
5. Get 6-digit access code

### Step 6: Get Access Code

After successful payment, you'll see:
```
✅ Payment Successful!

Your Access Code: 483726

Keep this code safe. You'll need it to enter the contest.
```

### Step 7: Copy & Use Code

1. Click **"Copy Code"** button
2. Open contest
3. Paste code to verify entry

## 🧪 Test Scenarios

### Scenario 1: Quick UPI Test
**Time**: 30 seconds
```
1. Dashboard → Contest Card
2. Click "Register"
3. See UPI option
4. Copy UPI ID
5. Done (no actual payment needed)
```

### Scenario 2: Full Razorpay Test
**Time**: 2-3 minutes
```
1. Dashboard → Contest Card
2. Click "Register"
3. Click "Pay ₹49"
4. See payment modal
5. Complete with test details
6. See access code
```

### Scenario 3: Mobile UPI Test
**Time**: 1 minute
```
1. Open on phone
2. Dashboard → Contest
3. Click "Register"
4. Click "Open in UPI App"
5. Phone opens UPI app
6. Back to payment page
```

## 📱 Supported UPI Apps (for Testing)

**On Mobile (Android/iOS):**
- ✅ Google Pay
- ✅ PhonePe
- ✅ Amazon Pay
- ✅ WhatsApp Pay
- ✅ BHIM
- ✅ Paytm
- ✅ Bank apps (iMobile, etc.)

**On Desktop:**
- ℹ️ Just see/copy UPI ID
- ℹ️ Use Razorpay for full test

## 🎯 What to Test

### UPI Component
- [ ] Copy button works
- [ ] UPI deep link opens app (mobile)
- [ ] UI is responsive
- [ ] Dark mode looks good
- [ ] Supported apps list visible

### Payment Flow
- [ ] Payment page loads
- [ ] Both options visible
- [ ] UPI option works
- [ ] Razorpay button works
- [ ] Modal opens for Razorpay

### Access Code
- [ ] Code generates after payment
- [ ] Code displays on screen
- [ ] Copy functionality works
- [ ] Code is 6 digits
- [ ] Code shows in browser console

## 🔧 Troubleshooting

### UPI App Not Opening
```
✗ Problem: "Open in UPI App" doesn't work
✓ Solution: 
  - On desktop, copy the ID manually
  - On mobile, ensure UPI app is installed
  - Try Razorpay checkout instead
```

### Payment Modal Not Opening
```
✗ Problem: Clicking "Pay ₹49" does nothing
✓ Solution:
  - Check browser console (F12)
  - Verify Razorpay keys in .env.local
  - Refresh page
  - Try incognito mode
```

### Access Code Not Showing
```
✗ Problem: Payment completes but no code
✓ Solution:
  - Check Firebase connection
  - Verify paymentService.ts loaded
  - Check localStorage in DevTools
  - Look at browser console for errors
```

### UPI ID Not Copied
```
✗ Problem: Copy button doesn't work
✓ Solution:
  - Check browser console
  - Allow clipboard permissions
  - Try manual selection
  - Use keyboard Ctrl+C
```

## 📊 Expected Results

### Successful Flow
```
✅ Payment page opens
✅ Two payment options visible
✅ One option selected
✅ Payment processed
✅ Access code generated (6 digits)
✅ Code displays on screen
✅ Code copyable to clipboard
✅ Can enter contest with code
```

### Code Should Look Like
```
Access Code: 483726
Access Code: 927154
Access Code: 615823
```

## 🔐 Test Data

**Current Configuration:**
```
Environment: Test Mode
Razorpay Key: rzp_test_SDHnkrwN9OLntR
UPI ID: typehaki@upi
Amount: ₹49 per contest
```

## 📝 Checklist

Print this and check off as you test:

```
□ Dev server starts (npm run dev)
□ Can access http://localhost:8080
□ Can login/signup
□ Can navigate to Dashboard
□ Can find contest cards
□ Can click "Register - Pay ₹X"
□ Payment page loads
□ UPI section visible
□ UPI ID copyable
□ Razorpay button visible
□ Can test UPI flow
□ Can test Razorpay flow
□ Access code generates
□ Can copy access code
□ Code is 6 digits
□ Everything works on mobile
```

## 💡 Pro Tips

1. **For Quick Testing**: Just test UPI ID copy (no payment)
2. **For Full Test**: Use Razorpay with any test data
3. **For Mobile**: Test "Open in UPI App" with real phone
4. **For Debugging**: Check browser console (F12 → Console tab)
5. **For Monitoring**: Check localStorage (F12 → Application → localStorage)

## 🎓 Learn More

### Quick Links
- [Full UPI Guide](./UPI_INTEGRATION_GUIDE.md)
- [Admin Setup](./UPI_ADMIN_CONFIGURATION.md)
- [Payment Summary](./UPI_PAYMENT_SUMMARY.md)
- [Razorpay Docs](https://razorpay.com/docs)

### Key Concepts
1. **UPI**: Fast payment method for India
2. **Deep Link**: Direct app opening link
3. **Access Code**: Contest entry verification
4. **Razorpay**: Payment gateway

## 🚨 If Something Breaks

1. **Check console**: Open F12, click Console tab
2. **Note the error**: Screenshot/copy error message
3. **Check .env.local**: Ensure keys are correct
4. **Restart dev server**: Kill and re-run `npm run dev`
5. **Clear cache**: Ctrl+Shift+Delete → Clear browsing data
6. **Try incognito**: Eliminates extension issues

## ✅ You're Ready!

Now visit **http://localhost:8080** and test the UPI payment system!

If you have questions:
- Check the documentation files
- Review the code comments
- Check browser console for errors
- Contact Razorpay support for payment issues

---

**Happy Testing! 🎉**
