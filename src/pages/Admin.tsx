import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Plus,
  IndianRupee,
  Keyboard,
  Settings,
  Loader2,
  AlertCircle,
  Trash2
} from "lucide-react";
import { useRounds, useLeaderboard, createRound, deleteRound, Round } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

export default function Admin() {
  const { user } = useAuth();
  const { rounds, loading: roundsLoading, error: roundsError } = useRounds();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedRoundId, setSelectedRoundId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newRound, setNewRound] = useState({
    name: "",
    registrationDeadline: "",
    typingDate: "",
    typingTimeStart: "",
    typingTimeEnd: "",
    entryFee: "",
    prizePool: "",
    duration: "60",
    typingText: "",
  });

  // Get leaderboard for selected round
  const { entries: leaderboardEntries, loading: leaderboardLoading } = useLeaderboard(selectedRoundId);

  // Calculate stats from real data
  const stats = [
    { label: "Total Rounds", value: rounds.length.toString(), icon: Trophy },
    { label: "Active Rounds", value: rounds.filter(r => r.status === 'registration_open' || r.status === 'active').length.toString(), icon: Keyboard },
    { label: "Total Participants", value: rounds.reduce((sum, r) => sum + r.participantCount, 0).toString(), icon: Users },
    { label: "Total Prize Pool", value: `₹${rounds.reduce((sum, r) => sum + r.prizePool, 0).toLocaleString()}`, icon: IndianRupee },
  ];

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      await createRound({
        name: newRound.name,
        registrationDeadline: new Date(newRound.registrationDeadline),
        typingDate: newRound.typingDate,
        typingTimeStart: newRound.typingTimeStart,
        typingTimeEnd: newRound.typingTimeEnd,
        entryFee: parseInt(newRound.entryFee) || 0,
        prizePool: parseInt(newRound.prizePool) || 0,
        duration: parseInt(newRound.duration) || 60,
        typingText: newRound.typingText,
        status: 'upcoming',
        type: 'tournament', // tournaments created via admin panel
        createdBy: user?.uid || '',
      });

      // Reset form
      setNewRound({
        name: "",
        registrationDeadline: "",
        typingDate: "",
        typingTimeStart: "",
        typingTimeEnd: "",
        entryFee: "",
        prizePool: "",
        duration: "60",
        typingText: "",
      });

      // Switch to rounds tab to see the new round
      setActiveTab("rounds");
    } catch (err) {
      console.error('Error creating round:', err);
      setCreateError(err instanceof Error ? err.message : 'Failed to create round');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRound = async (roundId: string) => {
    setIsDeleting(true);
    try {
      await deleteRound(roundId);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting round:', err);
      alert('Failed to delete tournament: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (roundsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="font-bold">TypeHaki</span>
              <Badge variant="secondary" className="ml-2">Admin</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="rounds" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Rounds</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Round</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
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

              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle>Recent Rounds</CardTitle>
                </CardHeader>
                <CardContent>
                  {rounds.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No rounds created yet. Create your first round!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rounds.slice(0, 5).map((round) => (
                        <div key={round.id} className="flex items-start justify-between py-2">
                          <div>
                            <p className="font-medium">{round.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {round.participantCount} participants • ₹{round.prizePool.toLocaleString()} prize
                            </p>
                          </div>
                          {getStatusBadge(round.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Rounds Tab */}
          <TabsContent value="rounds">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle>All Rounds</CardTitle>
                  <CardDescription>Manage competition rounds</CardDescription>
                </CardHeader>
                <CardContent>
                  {rounds.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No rounds created yet.
                    </div>
                  ) : (
                      <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Round Name</TableHead>
                          <TableHead>Typing Date</TableHead>
                          <TableHead>Entry Fee</TableHead>
                          <TableHead>Prize Pool</TableHead>
                          <TableHead>Participants</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rounds.map((round) => (
                          <TableRow key={round.id}>
                            <TableCell className="font-medium">{round.name}</TableCell>
                            <TableCell>{round.typingDate}</TableCell>
                            <TableCell>₹{round.entryFee}</TableCell>
                            <TableCell className="text-primary font-medium">₹{round.prizePool.toLocaleString()}</TableCell>
                            <TableCell>{round.participantCount}</TableCell>
                            <TableCell>{getStatusBadge(round.status)}</TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteConfirm(round.id)}
                                disabled={isDeleting}
                                className="gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle>Select Round</CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    className="w-full p-2 rounded-md bg-background border border-border"
                    value={selectedRoundId}
                    onChange={(e) => setSelectedRoundId(e.target.value)}
                  >
                    <option value="">Select a round...</option>
                    {rounds.map((round) => (
                      <option key={round.id} value={round.id}>{round.name}</option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              {selectedRoundId && (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                    <CardDescription>View performance for selected round</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {leaderboardLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                      </div>
                    ) : leaderboardEntries.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No attempts yet for this round.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">WPM</TableHead>
                            <TableHead className="text-right">Accuracy</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leaderboardEntries.map((entry, index) => (
                            <TableRow key={entry.id}>
                              <TableCell>#{index + 1}</TableCell>
                              <TableCell className="font-medium">{entry.userName}</TableCell>
                              <TableCell className="text-right font-mono">{entry.wpm}</TableCell>
                              <TableCell className="text-right font-mono">{entry.accuracy}%</TableCell>
                              <TableCell className="text-right font-mono text-primary font-semibold">{entry.score}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Create Round Tab */}
          <TabsContent value="create">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card/50 border-border/50 max-w-2xl">
                <CardHeader>
                  <CardTitle>Create New Round</CardTitle>
                  <CardDescription>Set up a new typing competition round</CardDescription>
                </CardHeader>
                <CardContent>
                  {createError && (
                    <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateRound} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Round Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., TypeHaki Championship - Round 1"
                        value={newRound.name}
                        onChange={(e) => setNewRound({ ...newRound, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                        <Input
                          id="registrationDeadline"
                          type="datetime-local"
                          value={newRound.registrationDeadline}
                          onChange={(e) => setNewRound({ ...newRound, registrationDeadline: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="typingDate">Typing Date</Label>
                        <Input
                          id="typingDate"
                          type="date"
                          value={newRound.typingDate}
                          onChange={(e) => setNewRound({ ...newRound, typingDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="typingTimeStart">Time Window Start</Label>
                        <Input
                          id="typingTimeStart"
                          type="time"
                          value={newRound.typingTimeStart}
                          onChange={(e) => setNewRound({ ...newRound, typingTimeStart: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="typingTimeEnd">Time Window End</Label>
                        <Input
                          id="typingTimeEnd"
                          type="time"
                          value={newRound.typingTimeEnd}
                          onChange={(e) => setNewRound({ ...newRound, typingTimeEnd: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="entryFee">Entry Fee (₹)</Label>
                        <Input
                          id="entryFee"
                          type="number"
                          placeholder="49"
                          value={newRound.entryFee}
                          onChange={(e) => setNewRound({ ...newRound, entryFee: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prizePool">Prize Pool (₹)</Label>
                        <Input
                          id="prizePool"
                          type="number"
                          placeholder="5000"
                          value={newRound.prizePool}
                          onChange={(e) => setNewRound({ ...newRound, prizePool: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (seconds)</Label>
                        <Input
                          id="duration"
                          type="number"
                          placeholder="60"
                          value={newRound.duration}
                          onChange={(e) => setNewRound({ ...newRound, duration: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="typingText">Typing Text</Label>
                      <Textarea
                        id="typingText"
                        placeholder="Enter the text that participants will type..."
                        value={newRound.typingText}
                        onChange={(e) => setNewRound({ ...newRound, typingText: e.target.value })}
                        rows={5}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        This is the text participants will type during the competition.
                      </p>
                    </div>

                    <Separator />

                    <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 mr-2" />
                          Create Round
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tournament?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tournament and all associated registrations and attempts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteRound(deleteConfirm)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin inline" /> : null}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
