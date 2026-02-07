import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface ContestAccessCodeProps {
    accessCode: string;
    userName: string;
    roundName: string;
    typingDate: string;
}

export function ContestAccessCode({
    accessCode,
    userName,
    roundName,
    typingDate,
}: ContestAccessCodeProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopyCode = () => {
        navigator.clipboard.writeText(accessCode);
        setCopied(true);
        toast({
            title: "Copied!",
            description: "Access code copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="border-border/50 bg-gradient-to-br from-success/10 to-primary/10">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Registration Confirmed! 🎉</CardTitle>
                <CardDescription>
                    You're all set to participate in {roundName}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-white dark:bg-slate-950 rounded-lg p-6 text-center border-2 border-success/30">
                    <p className="text-sm text-muted-foreground mb-3">Your Unique Access Code</p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="text-4xl font-bold tracking-widest text-primary font-mono">
                            {accessCode}
                        </div>
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={handleCopyCode}
                            className="ml-2"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-success" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 text-sm">
                    <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                        <div>
                            <p className="text-muted-foreground mb-1">Participant</p>
                            <p className="font-medium">{userName}</p>
                        </div>
                        <div className="border-t border-border pt-3">
                            <p className="text-muted-foreground mb-1">Contest</p>
                            <p className="font-medium">{roundName}</p>
                        </div>
                        <div className="border-t border-border pt-3">
                            <p className="text-muted-foreground mb-1">Contest Date</p>
                            <p className="font-medium">{typingDate}</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-900">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Important!</h4>
                        <ul className="text-amber-800 dark:text-amber-200 space-y-1 text-xs">
                            <li>✓ Save your access code - you'll need it to enter the contest</li>
                            <li>✓ This code is unique to you and valid for 30 days</li>
                            <li>✓ Do not share your access code with others</li>
                            <li>✓ Check your email for confirmation details</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
