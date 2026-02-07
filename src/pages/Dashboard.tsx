import { Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Trophy, IndianRupee, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRounds, useUserHistory } from "@/hooks/useFirestore";

export default function Dashboard() {
  const { userProfile, user } = useAuth();
  const { rounds, loading: roundsLoading } = useRounds();
  const { attempts, loading: historyLoading } = useUserHistory();

  // Use real user data, falling back to Firebase user data
  const displayName = userProfile?.name || user?.displayName || "User";
  const firstName = displayName.split(" ")[0];

  // Calculate user stats from history
  const bestWpm = attempts.length > 0 ? Math.max(...attempts.map(a => a.wpm)) : 0;
  const bestRank = 0; // TODO: Calculate from leaderboard positions
  const totalEarnings = 0; // TODO: Calculate from prizes won

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registration_open":
        return <Badge variant="success">Registration Open</Badge>;
      case "upcoming":
        return <Badge variant="upcoming">Upcoming</Badge>;
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "closed":
        return <Badge variant="closed">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Format time window for display
  const formatTimeWindow = (start: string, end: string) => {
    if (!start || !end) return "TBD";
    return `${start} - ${end}`;
  };

  if (roundsLoading) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {firstName}!</h1>
              <p className="text-muted-foreground mt-1">Ready to compete? Check out the available rounds below.</p>
            </div>
            <Link to="/typing-test">
              <Button variant="hero" size="lg">
                Practice Typing
              </Button>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Rounds Played", value: attempts.length.toString(), icon: Trophy },
              { label: "Best WPM", value: bestWpm > 0 ? bestWpm.toString() : "-", icon: Clock },
              { label: "Best Rank", value: bestRank > 0 ? `#${bestRank}` : "-", icon: Users },
              { label: "Total Earnings", value: `₹${totalEarnings}`, icon: IndianRupee },
            ].map((stat) => (
              <Card key={stat.label} className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Rounds Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Available Rounds</h2>
            {rounds.length === 0 ? (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No rounds available yet. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rounds.map((round, index) => (
                  <motion.div
                    key={round.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg leading-tight">{round.name}</CardTitle>
                          {getStatusBadge(round.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Registration ends: {format(new Date(round.registrationDeadline), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{round.typingDate} • {formatTimeWindow(round.typingTimeStart, round.typingTimeEnd)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{round.participantCount} participants</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div>
                            <p className="text-xs text-muted-foreground">Entry Fee</p>
                            <p className="text-lg font-bold">₹{round.entryFee}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Prize Pool</p>
                            <p className="text-lg font-bold text-primary">₹{round.prizePool.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link to={`/round/${round.id}`} className="w-full">
                          <Button
                            variant={round.status === "registration_open" ? "default" : "secondary"}
                            className="w-full"
                            disabled={round.status === "closed"}
                          >
                            {round.status === "closed" ? "Registration Closed" : "View Details"}
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
