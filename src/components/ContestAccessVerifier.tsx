import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { verifyContestAccess } from "@/lib/paymentService";

interface ContestAccessVerifierProps {
    roundId: string;
    userId: string;
    roundName: string;
    onAccessGranted: () => void;
    onAccessDenied: (reason: string) => void;
}

export function ContestAccessVerifier({
    roundId,
    userId,
    roundName,
    onAccessGranted,
    onAccessDenied,
}: ContestAccessVerifierProps) {
    const [accessCode, setAccessCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleVerifyAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const result = verifyContestAccess(roundId, userId, accessCode.trim());

            if (result.valid) {
                setSuccess(true);
                setTimeout(() => {
                    onAccessGranted();
                }, 1500);
            } else {
                setError(result.message);
                onAccessDenied(result.message);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to verify access";
            setError(message);
            onAccessDenied(message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Card className="border-success/30 bg-success/5">
                <CardContent className="py-12 text-center space-y-4">
                    <CheckCircle className="h-12 w-12 text-success mx-auto" />
                    <div>
                        <h3 className="text-lg font-semibold">Access Verified!</h3>
                        <p className="text-muted-foreground text-sm">Preparing your contest environment...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enter Access Code</CardTitle>
                <CardDescription>
                    Provide your unique access code to participate in {roundName}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleVerifyAccess} className="space-y-4">
                    <div>
                        <label htmlFor="accessCode" className="text-sm font-medium">
                            6-Digit Access Code
                        </label>
                        <Input
                            id="accessCode"
                            type="text"
                            placeholder="e.g., 123456"
                            value={accessCode}
                            onChange={(e) => {
                                // Only allow numbers and limit to 6 characters
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setAccessCode(value);
                            }}
                            maxLength={6}
                            className="mt-2 text-center text-2xl tracking-widest font-mono"
                            disabled={loading}
                            required
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        variant="hero"
                        size="lg"
                        className="w-full"
                        disabled={loading || accessCode.length !== 6}
                    >
                        {loading ? "Verifying..." : "Verify Access Code"}
                    </Button>
                </form>

                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
                        Don't have an access code?
                    </h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                        You need to register for this contest with payment first. Check your email for your access code.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
