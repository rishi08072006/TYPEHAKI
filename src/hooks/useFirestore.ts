import { useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Round type definition
export interface Round {
    id: string;
    name: string;
    registrationDeadline: Date;
    typingDate: string;
    typingTimeStart: string;
    typingTimeEnd: string;
    entryFee: number;
    prizePool: number;
    typingText: string;
    duration: number; // in seconds
    status: 'upcoming' | 'registration_open' | 'active' | 'closed';
    type: 'tournament' | 'practice'; // 'tournament' for competitions, 'practice' for general practice
    participantCount: number;
    createdAt: Date;
    createdBy: string;
}

// Registration type definition
export interface Registration {
    id: string;
    roundId: string;
    userId: string;
    fullName: string;
    mobile: string;
    college: string;
    branch: string;
    section: string;
    rollNumber: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    createdAt: Date;
}

// Attempt type definition
export interface Attempt {
    id: string;
    roundId: string;
    userId: string;
    userName: string;
    wpm: number;
    accuracy: number;
    score: number;
    typedText: string;
    startedAt: Date;
    submittedAt: Date;
}

// Helper to convert Firestore Timestamp to Date
function toDate(timestamp: Timestamp | Date | undefined): Date {
    if (!timestamp) return new Date();
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    return timestamp;
}

// Helper to convert Firestore document to Round
function docToRound(id: string, data: DocumentData): Round {
    return {
        id,
        name: data.name || '',
        registrationDeadline: toDate(data.registrationDeadline),
        typingDate: data.typingDate || '',
        typingTimeStart: data.typingTimeStart || '',
        typingTimeEnd: data.typingTimeEnd || '',
        entryFee: data.entryFee || 0,
        prizePool: data.prizePool || 0,
        typingText: data.typingText || '',
        duration: data.duration || 60,
        status: data.status || 'upcoming',
        type: data.type || 'tournament', // default to tournament for backward compatibility
        participantCount: data.participantCount || 0,
        createdAt: toDate(data.createdAt),
        createdBy: data.createdBy || '',
    };
}

// Hook to fetch all rounds (one-time read for better performance)
export function useRounds() {
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchRounds = async () => {
            try {
                const roundsRef = collection(db, 'rounds');
                const q = query(roundsRef, orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                
                const roundsData = snapshot.docs.map(doc => docToRound(doc.id, doc.data()));
                setRounds(roundsData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching rounds:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setLoading(false);
            }
        };

        fetchRounds();
    }, []);

    return { rounds, loading, error };
}

// Hook to fetch a single round by ID
export function useRound(roundId: string) {
    const [round, setRound] = useState<Round | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!roundId) {
            setLoading(false);
            return;
        }

        const roundRef = doc(db, 'rounds', roundId);

        const unsubscribe = onSnapshot(roundRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setRound(docToRound(snapshot.id, snapshot.data()));
                } else {
                    setRound(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching round:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [roundId]);

    return { round, loading, error };
}

// Hook to fetch leaderboard for a round (one-time read)
export function useLeaderboard(roundId: string) {
    const [entries, setEntries] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!roundId) {
            setLoading(false);
            return;
        }

        const fetchLeaderboard = async () => {
            try {
                const attemptsRef = collection(db, 'attempts');
                const q = query(
                    attemptsRef,
                    where('roundId', '==', roundId),
                    orderBy('score', 'desc')
                );
                const snapshot = await getDocs(q);
                
                const attemptsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    startedAt: toDate(doc.data().startedAt),
                    submittedAt: toDate(doc.data().submittedAt),
                } as Attempt));
                setEntries(attemptsData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [roundId]);

    return { entries, loading, error };
}

// Hook to check if user has registered for a round
export function useRegistration(roundId: string) {
    const { user } = useAuth();
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!roundId || !user) {
            setLoading(false);
            return;
        }

        const registrationsRef = collection(db, 'registrations');
        const q = query(
            registrationsRef,
            where('roundId', '==', roundId),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    setRegistration({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: toDate(doc.data().createdAt),
                    } as Registration);
                } else {
                    setRegistration(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching registration:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [roundId, user]);

    return { registration, loading, error };
}

// Hook to check if user has attempted a round
export function useAttempt(roundId: string) {
    const { user } = useAuth();
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!roundId || !user) {
            setLoading(false);
            return;
        }

        const attemptsRef = collection(db, 'attempts');
        const q = query(
            attemptsRef,
            where('roundId', '==', roundId),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    setAttempt({
                        id: doc.id,
                        ...doc.data(),
                        startedAt: toDate(doc.data().startedAt),
                        submittedAt: toDate(doc.data().submittedAt),
                    } as Attempt);
                } else {
                    setAttempt(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching attempt:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [roundId, user]);

    return { attempt, loading, error };
}

// Hook to fetch user's competition history (one-time read)
export function useUserHistory() {
    const { user } = useAuth();
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchUserHistory = async () => {
            try {
                const attemptsRef = collection(db, 'attempts');
                const q = query(
                    attemptsRef,
                    where('userId', '==', user.uid),
                    orderBy('submittedAt', 'desc')
                );
                const snapshot = await getDocs(q);
                
                const attemptsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    startedAt: toDate(doc.data().startedAt),
                    submittedAt: toDate(doc.data().submittedAt),
                } as Attempt));
                setAttempts(attemptsData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user history:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setLoading(false);
            }
        };

        fetchUserHistory();
    }, [user]);

    return { attempts, loading, error };
}

// Admin: Create a new round
export async function createRound(roundData: Omit<Round, 'id' | 'createdAt' | 'participantCount'>) {
    const roundsRef = collection(db, 'rounds');

    const docRef = await addDoc(roundsRef, {
        ...roundData,
        participantCount: 0,
        createdAt: serverTimestamp(),
    });

    return docRef.id;
}

// Admin: Update a round
export async function updateRound(roundId: string, updates: Partial<Round>) {
    const roundRef = doc(db, 'rounds', roundId);
    await updateDoc(roundRef, updates);
}

// Create registration
export async function createRegistration(registrationData: Omit<Registration, 'id' | 'createdAt'>) {
    const registrationsRef = collection(db, 'registrations');

    // Check if roll number is already registered for this round
    const q = query(
        registrationsRef,
        where('roundId', '==', registrationData.roundId),
        where('rollNumber', '==', registrationData.rollNumber)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
        throw new Error('This roll number is already registered for this round');
    }

    const docRef = await addDoc(registrationsRef, {
        ...registrationData,
        createdAt: serverTimestamp(),
    });

    return docRef.id;
}

// Submit typing attempt
export async function submitAttempt(attemptData: Omit<Attempt, 'id' | 'submittedAt'>) {
    const attemptsRef = collection(db, 'attempts');

    // Check if user has already attempted this round
    const q = query(
        attemptsRef,
        where('roundId', '==', attemptData.roundId),
        where('userId', '==', attemptData.userId)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
        throw new Error('You have already attempted this round');
    }

    const docRef = await addDoc(attemptsRef, {
        ...attemptData,
        submittedAt: serverTimestamp(),
    });

    return docRef.id;
}

// Admin: Get all registrations for a round
export async function getRegistrationsByRound(roundId: string): Promise<Registration[]> {
    const registrationsRef = collection(db, 'registrations');
    const q = query(registrationsRef, where('roundId', '==', roundId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: toDate(doc.data().createdAt),
    } as Registration));
}
