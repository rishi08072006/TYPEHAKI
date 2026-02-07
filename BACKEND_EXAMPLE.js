// Example backend implementation for payment verification
// This is a Node.js + Express example showing how to verify payments

/*
INSTALLATION:
npm install razorpay crypto
*/

// ============================================================================
// BACKEND API ENDPOINTS (Node.js + Express)
// ============================================================================

const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// Initialize Razorpay with your credentials
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ============================================================================
// 1. CREATE PAYMENT ORDER
// ============================================================================
// POST /api/payment/create-order
app.post('/api/payment/create-order', async (req, res) => {
    try {
        const { amount, roundId, userId, userName } = req.body;

        // Validate input
        if (!amount || amount < 1) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Create order in Razorpay
        const orderOptions = {
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: `receipt_${roundId}_${userId}_${Date.now()}`,
            notes: {
                roundId,
                userId,
                userName,
                timestamp: new Date().toISOString(),
            },
        };

        const order = await razorpay.orders.create(orderOptions);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            error: 'Failed to create order',
            message: error.message,
        });
    }
});

// ============================================================================
// 2. VERIFY PAYMENT & GENERATE ACCESS CODE
// ============================================================================
// POST /api/payment/verify
app.post('/api/payment/verify', async (req, res) => {
    try {
        const { orderId, paymentId, signature, roundId, userId, userName } =
            req.body;

        // Verify signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        const shasum = crypto
            .createHmac('sha256', secret)
            .update(orderId + '|' + paymentId)
            .digest('hex');

        if (shasum !== signature) {
            return res.status(400).json({
                success: false,
                error: 'Invalid signature. Payment verification failed.',
            });
        }

        // Signature is valid! Payment is successful.
        // Generate unique access code
        const accessCode = generateAccessCode();

        // Store registration in Firestore
        const registrationRef = admin
            .firestore()
            .collection('registrations')
            .doc();

        await registrationRef.set({
            roundId,
            userId,
            userName,
            paymentId,
            accessCode,
            orderId,
            paymentStatus: 'completed',
            registeredAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        // Optional: Send email with access code
        // await sendAccessCodeEmail(userName, email, accessCode, roundId);

        res.json({
            success: true,
            accessCode,
            message: 'Payment verified successfully',
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            error: 'Payment verification failed',
            message: error.message,
        });
    }
});

// ============================================================================
// 3. VERIFY ACCESS CODE FOR CONTEST ENTRY
// ============================================================================
// POST /api/contest/verify-access
app.post('/api/contest/verify-access', async (req, res) => {
    try {
        const { roundId, userId, accessCode } = req.body;

        // Query Firestore for registration
        const registrationsRef = admin.firestore().collection('registrations');
        const query = registrationsRef
            .where('roundId', '==', roundId)
            .where('userId', '==', userId)
            .where('accessCode', '==', accessCode);

        const snapshot = await query.get();

        if (snapshot.empty) {
            return res.status(401).json({
                valid: false,
                message: 'Invalid access code',
            });
        }

        const registration = snapshot.docs[0].data();

        // Check expiry
        if (new Date() > new Date(registration.expiresAt)) {
            return res.status(401).json({
                valid: false,
                message: 'Access code has expired',
            });
        }

        // Check payment status
        if (registration.paymentStatus !== 'completed') {
            return res.status(401).json({
                valid: false,
                message: 'Payment not completed',
            });
        }

        res.json({
            valid: true,
            message: 'Access granted',
            registration: {
                roundId: registration.roundId,
                registeredAt: registration.registeredAt,
            },
        });
    } catch (error) {
        console.error('Access verification error:', error);
        res.status(500).json({
            error: 'Verification failed',
            message: error.message,
        });
    }
});

// ============================================================================
// 4. WEBHOOK FOR PAYMENT UPDATES
// ============================================================================
// POST /api/payment/webhook
app.post('/api/payment/webhook', async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify webhook signature
        const shasum = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (shasum !== req.headers['x-razorpay-signature']) {
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'payment.authorized') {
            // Handle authorized payment
            console.log('Payment authorized:', payload);
        } else if (event === 'payment.failed') {
            // Handle failed payment
            console.log('Payment failed:', payload);

            // Update registration status
            const orderId = payload.order.entity.id;
            const registrationsRef = admin.firestore().collection('registrations');
            const query = registrationsRef.where('orderId', '==', orderId);
            const snapshot = await query.get();

            if (!snapshot.empty) {
                await snapshot.docs[0].ref.update({
                    paymentStatus: 'failed',
                });
            }
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Generate unique 6-digit access code
function generateAccessCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email with access code (using SendGrid or Nodemailer)
async function sendAccessCodeEmail(userName, email, accessCode, roundId) {
    // TODO: Implement email sending
    // Example with Nodemailer:
    /*
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: 'noreply@typehaki.com',
        to: email,
        subject: 'Your TypeHaki Contest Access Code',
        html: `
            <h2>Registration Confirmed!</h2>
            <p>Hello ${userName},</p>
            <p>Your registration for the contest is confirmed.</p>
            <p><strong>Your Access Code:</strong> <span style="font-size: 24px; font-weight: bold;">${accessCode}</span></p>
            <p>Use this code to enter the contest on the scheduled date.</p>
            <p>Valid for 30 days from registration.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
    */
}

// ============================================================================
// ENVIRONMENT VARIABLES (.env file)
// ============================================================================
/*
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxx

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
*/

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

// ============================================================================
// START SERVER
// ============================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ============================================================================
// FRONTEND INTEGRATION EXAMPLE
// ============================================================================

/*
// In your React component:

async function handlePayment() {
    try {
        // Step 1: Create order
        const orderResponse = await fetch('/api/payment/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: round.entryFee,
                roundId: round.id,
                userId: user.uid,
                userName: userProfile.name,
            }),
        });

        const orderData = await orderResponse.json();
        if (!orderResponse.ok) throw new Error(orderData.error);

        // Step 2: Open Razorpay checkout
        const options = {
            key: process.env.VITE_RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: orderData.currency,
            order_id: orderData.orderId,
            handler: async (response) => {
                // Step 3: Verify payment on backend
                const verifyResponse = await fetch('/api/payment/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderData.orderId,
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        roundId: round.id,
                        userId: user.uid,
                        userName: userProfile.name,
                    }),
                });

                const result = await verifyResponse.json();
                if (result.success) {
                    // Show access code
                    setAccessCode(result.accessCode);
                    setStatus('success');
                } else {
                    throw new Error(result.error);
                }
            },
            prefill: {
                name: userProfile.name,
                email: user.email,
            },
            theme: { color: '#3b82f6' },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    } catch (error) {
        console.error('Payment error:', error);
        setStatus('failed');
    }
}
*/

module.exports = app;
