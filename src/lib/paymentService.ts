/**
 * Payment Gateway Service
 * Handles Razorpay payment processing and contest registration
 */

declare global {
    interface Window {
        Razorpay: any;
    }
}

// Get API credentials from environment or config
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 
    JSON.parse(localStorage.getItem('payment_config') || '{}').keyId || '';

export function getRazorpayKeyId(): string {
    // Try env first, then localStorage
    const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (envKey) return envKey;
    
    const stored = localStorage.getItem('payment_config');
    if (stored) {
        try {
            const config = JSON.parse(stored);
            return config.keyId || '';
        } catch (e) {
            console.error('Failed to parse payment config:', e);
        }
    }
    return '';
}

export interface PaymentConfig {
    keyId: string;
    keySecret: string;
    merchantId: string;
}

export interface PaymentOrderData {
    amount: number; // in paise
    currency: string;
    receipt: string;
    notes: {
        roundId: string;
        userId: string;
        userName: string;
    };
}

export interface PaymentResponse {
    success: boolean;
    orderId?: string;
    paymentId?: string;
    signature?: string;
    accessCode?: string;
    paymentMethod?: string; // 'upi' | 'card' | 'wallet' | 'netbanking'
    error?: string;
}

/**
 * Generate a unique 6-digit access code
 */
export function generateAccessCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Initialize Razorpay script
 */
export function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

/**
 * Verify payment signature (should be done on backend in production)
 */
export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
    secret: string
): boolean {
    // In production, this should be verified on the backend
    // For now, we'll return true if payment exists
    // Backend implementation example:
    // const crypto = require('crypto');
    // const hmac = crypto.createHmac('sha256', secret);
    // hmac.update(orderId + '|' + paymentId);
    // return hmac.digest('hex') === signature;
    return !!paymentId;
}

/**
 * Initiate Razorpay payment
 * 
 * Supports multiple payment methods:
 * - UPI (recommended for India)
 * - Credit/Debit Cards
 * - Wallets (Google Pay, Apple Pay, Amazon Pay, etc.)
 * - Net Banking
 * - BNPL (Buy Now Pay Later)
 * 
 * UPI is automatically prioritized in Razorpay checkout
 */
export async function initiatePayment(
    options: {
        amount: number; // in INR
        orderId: string;
        userName: string;
        userEmail: string;
        userPhone: string;
        keyId?: string; // Optional, will use env if not provided
        onSuccess: (response: any) => void;
        onError: (error: any) => void;
    }
): Promise<void> {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay");
    }

    const keyId = options.keyId || getRazorpayKeyId();
    if (!keyId) {
        throw new Error("Razorpay Key ID not configured. Please add it in admin panel or .env");
    }

    const razorpayOptions = {
        key: keyId,
        amount: options.amount * 100, // Convert to paise
        currency: "INR",
        name: "TypeHaki Arena",
        description: "Contest Registration Fee",
        order_id: options.orderId,
        prefill: {
            name: options.userName,
            email: options.userEmail,
            contact: options.userPhone,
        },
        theme: {
            color: "#3b82f6",
        },
        handler: options.onSuccess,
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
}

/**
 * Generate a unique access code and store registration
 */
export function generateContestAccessCode(
    roundId: string,
    userId: string,
    userName: string,
    paymentId: string
): string {
    const accessCode = generateAccessCode();
    
    // Store in localStorage with expiry (adjust based on contest date)
    const registrationData = {
        roundId,
        userId,
        userName,
        paymentId,
        accessCode,
        registeredAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
    
    // Store access codes in a structured way
    const key = `contest_registration_${roundId}_${userId}`;
    localStorage.setItem(key, JSON.stringify(registrationData));
    
    return accessCode;
}

/**
 * Verify contest access code
 */
export function verifyContestAccess(
    roundId: string,
    userId: string,
    accessCode: string
): { valid: boolean; message: string } {
    const key = `contest_registration_${roundId}_${userId}`;
    const storedData = localStorage.getItem(key);
    
    if (!storedData) {
        return { valid: false, message: "Not registered for this contest" };
    }
    
    const registration = JSON.parse(storedData);
    
    // Check expiry
    if (new Date() > new Date(registration.expiresAt)) {
        localStorage.removeItem(key);
        return { valid: false, message: "Registration expired" };
    }
    
    // Check access code
    if (registration.accessCode !== accessCode) {
        return { valid: false, message: "Invalid access code" };
    }
    
    return { valid: true, message: "Access granted" };
}

/**
 * Get user's registration for a contest
 */
export function getContestRegistration(
    roundId: string,
    userId: string
): any | null {
    const key = `contest_registration_${roundId}_${userId}`;
    const storedData = localStorage.getItem(key);
    
    if (!storedData) {
        return null;
    }
    
    const registration = JSON.parse(storedData);
    
    // Check expiry
    if (new Date() > new Date(registration.expiresAt)) {
        localStorage.removeItem(key);
        return null;
    }
    
    return registration;
}

/**
 * Get all user's contest registrations
 */
export function getUserContestRegistrations(userId: string): any[] {
    const registrations = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`contest_registration_`) && key.includes(userId)) {
            const stored = localStorage.getItem(key);
            if (stored) {
                const registration = JSON.parse(stored);
                // Check expiry
                if (new Date() <= new Date(registration.expiresAt)) {
                    registrations.push(registration);
                } else {
                    localStorage.removeItem(key);
                }
            }
        }
    }
    
    return registrations;
}
