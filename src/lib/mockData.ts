export const mockRounds = [
  {
    id: "1",
    name: "TypeHaki Championship - Round 1",
    registrationDeadline: "2026-02-10T23:59:59",
    typingDate: "2026-02-12",
    typingTimeWindow: "10:00 AM - 6:00 PM IST",
    entryFee: 49,
    prizePool: 5000,
    status: "registration_open" as const,
    participants: 156,
  },
  {
    id: "2",
    name: "Speed Typing Sprint",
    registrationDeadline: "2026-02-15T23:59:59",
    typingDate: "2026-02-17",
    typingTimeWindow: "2:00 PM - 8:00 PM IST",
    entryFee: 29,
    prizePool: 2500,
    status: "upcoming" as const,
    participants: 89,
  },
  {
    id: "3",
    name: "College Typing Battle",
    registrationDeadline: "2026-02-08T23:59:59",
    typingDate: "2026-02-09",
    typingTimeWindow: "9:00 AM - 5:00 PM IST",
    entryFee: 19,
    prizePool: 1500,
    status: "closed" as const,
    participants: 234,
  },
];

export const mockUser = {
  id: "user-1",
  name: "Arjun Sharma",
  email: "arjun.sharma@email.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun",
  mobile: "+91 98765 43210",
  college: "Indian Institute of Technology, Delhi",
  branch: "Computer Science",
  section: "A",
  rollNumber: "2022CS10234",
};

export const mockLeaderboard = [
  { rank: 1, name: "Priya Patel", wpm: 142, accuracy: 98.5, score: 1398 },
  { rank: 2, name: "Rahul Kumar", wpm: 138, accuracy: 97.8, score: 1350 },
  { rank: 3, name: "Sneha Reddy", wpm: 135, accuracy: 99.1, score: 1338 },
  { rank: 4, name: "Vikram Singh", wpm: 132, accuracy: 96.5, score: 1274 },
  { rank: 5, name: "Anjali Gupta", wpm: 128, accuracy: 98.2, score: 1257 },
  { rank: 6, name: "Arjun Sharma", wpm: 125, accuracy: 97.0, score: 1213, isCurrentUser: true },
  { rank: 7, name: "Meera Nair", wpm: 122, accuracy: 96.8, score: 1181 },
  { rank: 8, name: "Karthik Iyer", wpm: 118, accuracy: 95.5, score: 1127 },
  { rank: 9, name: "Divya Menon", wpm: 115, accuracy: 97.2, score: 1118 },
  { rank: 10, name: "Suresh Rajan", wpm: 112, accuracy: 94.8, score: 1062 },
];

export const mockUserRounds = [
  { roundName: "Winter Typing Challenge", date: "2026-01-20", wpm: 125, accuracy: 97.0, rank: 6, score: 1213 },
  { roundName: "New Year Sprint", date: "2026-01-05", wpm: 118, accuracy: 95.5, rank: 12, score: 1127 },
];

export const sampleTypingText = `The quick brown fox jumps over the lazy dog. Programming is the art of telling a computer what to do through a series of instructions. Every great developer was once a beginner who never gave up on their dreams. In the world of technology, speed and accuracy are essential skills that can set you apart from the competition.`;
