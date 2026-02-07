import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, School, GitBranch, Hash, Trophy, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserHistory } from "@/hooks/useFirestore";
import { format } from "date-fns";

export default function Profile() {
  const { user, userProfile, isAdmin } = useAuth();
  const { attempts, loading: historyLoading } = useUserHistory();

  // Use real user data
  const displayName = userProfile?.name || user?.displayName || "User";
  const displayEmail = userProfile?.email || user?.email || "";
  const displayAvatar = userProfile?.avatar || user?.photoURL || "";

  // Mask mobile number for display (full number visible only to admin)
  const maskedMobile = userProfile?.mobile
    ? userProfile.mobile.replace(/\d(?=\d{4})/g, "•")
    : "-";

  const profileFields = [
    { icon: Mail, label: "Email", value: displayEmail },
    { icon: Phone, label: "Mobile", value: maskedMobile },
    { icon: School, label: "College", value: userProfile?.college || "-" },
    { icon: GitBranch, label: "Branch", value: userProfile?.branch || "-" },
    { icon: Hash, label: "Section", value: userProfile?.section || "-" },
    { icon: Hash, label: "Roll Number", value: userProfile?.rollNumber || "-" },
  ];

  // Calculate stats
  const bestWpm = attempts.length > 0 ? Math.max(...attempts.map(a => a.wpm)) : 0;
  const bestRank = 0; // TODO: Calculate from leaderboard positions

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Profile Card */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback className="text-2xl">{displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold">{displayName}</h1>
                      {isAdmin && <Badge variant="secondary">Admin</Badge>}
                    </div>
                    <p className="text-muted-foreground">{displayEmail}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {profileFields.map((field) => (
                      <div key={field.label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <field.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{field.label}</p>
                          <p className="text-sm font-medium">{field.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6 text-center">
                <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{attempts.length}</p>
                <p className="text-sm text-muted-foreground">Rounds Played</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{bestWpm > 0 ? bestWpm : '-'}</p>
                <p className="text-sm text-muted-foreground">Best WPM</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{bestRank > 0 ? `#${bestRank}` : '-'}</p>
                <p className="text-sm text-muted-foreground">Best Rank</p>
              </CardContent>
            </Card>
          </div>

          {/* Competition History */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Competition History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                </div>
              ) : attempts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No competition history yet. Register for a round to get started!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">WPM</TableHead>
                      <TableHead className="text-right">Accuracy</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="text-muted-foreground">
                          {format(attempt.submittedAt, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right font-mono">{attempt.wpm}</TableCell>
                        <TableCell className="text-right font-mono">{attempt.accuracy}%</TableCell>
                        <TableCell className="text-right font-mono font-semibold text-primary">
                          {attempt.score}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
