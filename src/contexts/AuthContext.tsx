import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, ADMIN_EMAILS } from '@/lib/firebase';

// User profile stored in Firestore
export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    avatar: string;
    mobile: string;
    college: string;
    branch: string;
    section: string;
    rollNumber: string;
    role: 'user' | 'admin';
    createdAt: Date;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if current user is admin
    const isAdmin = userProfile?.role === 'admin' || (user?.email ? ADMIN_EMAILS.includes(user.email) : false);

    // Create or get user profile from Firestore
    const getOrCreateUserProfile = async (firebaseUser: User): Promise<UserProfile> => {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        }

        // Create new user profile
        const isAdminUser = firebaseUser.email ? ADMIN_EMAILS.includes(firebaseUser.email) : false;
        const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            avatar: firebaseUser.photoURL || '',
            mobile: '',
            college: '',
            branch: '',
            section: '',
            rollNumber: '',
            role: isAdminUser ? 'admin' : 'user',
            createdAt: new Date(),
        };

        await setDoc(userRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
        });

        return newProfile;
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const profile = await getOrCreateUserProfile(firebaseUser);
                    setUserProfile(profile);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        userProfile,
        loading,
        isAdmin,
        signInWithGoogle,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
