import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, XCircle, Loader2, IndianRupee, ArrowLeft } from "lucide-react";
import { ContestAccessCode } from "@/components/ContestAccessCode";
import { UPIPayment } from "@/components/UPIPayment";
import { useAuth } from "@/contexts/AuthContext";
import { generateContestAccessCode, initiatePayment } from "@/lib/paymentService";
import { useToast } from "@/components/ui/use-toast";

type PaymentStatus = "pending" | "processing" | "success" | "failed";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [accessCode, setAccessCode] = useState<string | null>(null);

  const round = location.state?.round || {
    id: "default-round",
    name: "TypeHaki Championship - Round 1",
    entryFee: 49,
    typingDate: "2026-02-12",
  };

  const handlePayment = async () => {
    if (!user || !userProfile) {
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive",
      });
      return;
    }

    setStatus("processing");
    
    try {
      // For demo purposes, we'll simulate payment
      // In production, integrate with actual Razorpay API
      
      // Simulate payment delay
      setTimeout(() => {
        try {
          // Generate unique access code
          const code = generateContestAccessCode(
            round.id,
            user.uid,
            userProfile.name,
            `payment_${Date.now()}`
          );
          
          setAccessCode(code);
          setStatus("success");
          
          // Store registration in Firestore (optional)
          // This would also be done by your backend after payment verification
          
          toast({
            title: "Registration Successful!",
            description: `Your access code: ${code}`,
          });
        } catch (error) {
          setStatus("failed");
          toast({
            title: "Error",
            description: "Failed to generate access code",
            variant: "destructive",
          });
        }
      }, 2500);
    } catch (error) {
      setStatus("failed");
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setStatus("pending");
    setAccessCode(null);
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {status === "pending" && (
            <div className="space-y-6">
              {/* UPI Payment Option */}
              <UPIPayment 
                upiId="typehaki@upi" 
                amount={round.entryFee}
                recipientName="TypeHaki Arena"
              />

              {/* Or Razorpay Payment */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <IndianRupee className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Complete Payment</CardTitle>
                <CardDescription>
                  Confirm your entry for the competition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Round</span>
                    <span className="font-medium text-right max-w-[200px]">{round.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entry Fee</span>
                    <span className="font-medium">₹{round.entryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg text-primary">₹{round.entryFee}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                    <Shield className="h-4 w-4 text-success" />
                    <span>Secure payment powered by Razorpay</span>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-900">
                    <p className="text-xs text-blue-900 dark:text-blue-100 text-center">
                      ✓ Pay via UPI, Card, Wallet or Bank Transfer
                    </p>
                  </div>
                </div>

                <Button variant="hero" size="lg" className="w-full" onClick={handlePayment}>
                  Pay ₹{round.entryFee}
                </Button>

                <Link to="/dashboard" className="block">
                  <Button variant="ghost" size="sm" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Cancel and go back
                  </Button>
                </Link>
              </CardContent>
            </Card>
            </div>
          )}

          {status === "processing" && (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="py-16 text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold">Processing Payment</h3>
                  <p className="text-muted-foreground mt-1">Please wait while we confirm your payment...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {status === "success" && accessCode && userProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ContestAccessCode
                accessCode={accessCode}
                userName={userProfile.name}
                roundName={round.name}
                typingDate={round.typingDate || "TBD"}
              />
              <div className="mt-6 space-y-2">
                <Link to="/typing-test" className="block">
                  <Button variant="hero" size="lg" className="w-full">
                    Practice Now
                  </Button>
                </Link>
                <Link to="/dashboard" className="block">
                  <Button variant="ghost" size="lg" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {status === "failed" && (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="py-12 text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center"
                >
                  <XCircle className="h-10 w-10 text-destructive" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold">Payment Failed</h3>
                  <p className="text-muted-foreground mt-2">
                    We couldn't process your payment. Please try again.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button variant="hero" size="lg" className="w-full" onClick={handleRetry}>
                    Try Again
                  </Button>
                  <Link to="/dashboard" className="block">
                    <Button variant="ghost" size="lg" className="w-full">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
