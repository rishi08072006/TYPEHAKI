import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContestAccessVerifier } from "@/components/ContestAccessVerifier";
import { getContestRegistration } from "@/lib/paymentService";
import { Calendar, Clock, Users, Trophy, IndianRupee, AlertTriangle, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useRound } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";

export default function RoundDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { round, loading: roundLoading } = useRound(id || '');
  const [registeredAccessCode, setRegisteredAccessCode] = useState<string | null>(null);
  const [showAccessVerifier, setShowAccessVerifier] = useState(false);

  useEffect(() => {
    if (user && id) {
      const registration = getContestRegistration(id, user.uid);
      if (registration) {
        setRegisteredAccessCode(registration.accessCode);
      }
    }
  }, [user, id]);

  const handleStartContest = () => {
    if (registeredAccessCode) {
      setShowAccessVerifier(true);
    }
  };

  const handleAccessGranted = () => {
    // Redirect to typing test with contest mode
    navigate(`/typing-test?round=${id}`, { state: { roundId: id, contestMode: true } });
  };

  const handleRegisterNow = () => {
    navigate("/payment", {
      state: { round },
    });
  };

  // Loading state
  if (roundLoading) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Round not found
  if (!round) {
    return (
      <Layout>
        <div className="container py-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Round not found</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registration_open":
        return <Badge variant="success">Registration Open</Badge>;
      case "upcoming":
        return <Badge variant="upcoming">Upcoming</Badge>;
      case "active":
        return <Badge variant="success">Active Now</Badge>;
      case "closed":
        return <Badge variant="closed">Registration Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isRegistrationOpen = round.status === "registration_open" || round.status === "active";
  const isDeadlinePassed = new Date() > new Date(round.registrationDeadline);

  return (
    <Layout>
      <div className="container py-8">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2">{round.name}</CardTitle>
                      <CardDescription className="text-base">
                        Test your typing speed and accuracy in this competitive round
                      </CardDescription>
                    </div>
                    {getStatusBadge(round.status)}
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Contest Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-xl">Contest Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Typing Date</p>
                          <p className="font-medium">{round.typingDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Time Window</p>
                          <p className="font-medium">
                            {round.typingTimeStart} - {round.typingTimeEnd}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-medium">{round.duration} seconds</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Registration Deadline
                          </p>
                          <p className="font-medium">
                            {format(new Date(round.registrationDeadline), "MMM d, yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Participants</p>
                          <p className="font-medium">{round.participantCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Trophy className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Prize Pool</p>
                          <p className="font-medium">₹{round.prizePool.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Typing Text Preview */}
            {round.typingText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-xl">Typing Text</CardTitle>
                    <CardDescription>
                      This is what you'll be typing during the contest
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-secondary/50 rounded-lg p-6 font-mono text-sm leading-relaxed">
                      {round.typingText}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Registration/Payment */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="sticky top-24 space-y-4"
            >
              {/* Registration Status Card */}
              {registeredAccessCode ? (
                <Card className="border-success/30 bg-success/5">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-3">
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <CardTitle className="text-lg">You're Registered!</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white dark:bg-slate-950 rounded p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-2">Your Access Code</p>
                      <p className="text-2xl font-bold font-mono text-primary">
                        {registeredAccessCode}
                      </p>
                    </div>
                    {showAccessVerifier ? (
                      <ContestAccessVerifier
                        roundId={round.id}
                        userId={user?.uid || ""}
                        roundName={round.name}
                        onAccessGranted={handleAccessGranted}
                        onAccessDenied={(reason) => {
                          console.error("Access denied:", reason);
                          setShowAccessVerifier(false);
                        }}
                      />
                    ) : (
                      <Button
                        variant="hero"
                        size="lg"
                        className="w-full"
                        onClick={handleStartContest}
                        disabled={round.status !== "active"}
                      >
                        {round.status === "active" ? "Enter Contest" : "Contest Not Active"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Fee Card */}
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Entry Fee</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">₹{round.entryFee}</span>
                            <span className="text-xs text-muted-foreground">one-time</span>
                          </div>
                        </div>
                        <div className="bg-secondary/50 rounded p-3 text-xs space-y-1">
                          <p className="text-muted-foreground">✓ Permanent access to contest</p>
                          <p className="text-muted-foreground">✓ Unique access code</p>
                          <p className="text-muted-foreground">✓ Results & ranking</p>
                          <p className="text-muted-foreground">✓ Pay via UPI, Card, Wallet</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Warning if deadline passed */}
                  {isDeadlinePassed && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Registration deadline has passed for this round
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Registration Button */}
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handleRegisterNow}
                    disabled={!isRegistrationOpen || isDeadlinePassed}
                  >
                    {isDeadlinePassed
                      ? "Registration Closed"
                      : isRegistrationOpen
                      ? `Register - Pay ₹${round.entryFee}`
                      : "Coming Soon"}
                  </Button>

                  {/* Payment Security Badge */}
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>Secure payment via Razorpay</span>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
