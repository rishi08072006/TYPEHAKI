import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, CheckCircle, AlertCircle, Lock, Save, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PaymentConfig {
    keyId: string;
    keySecret: string;
    merchantId: string;
    testMode: boolean;
    lastUpdated: string;
}

export default function PaymentConfig() {
    const { isAdmin, user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [config, setConfig] = useState<PaymentConfig>({
        keyId: "",
        keySecret: "",
        merchantId: "",
        testMode: false,
        lastUpdated: new Date().toISOString(),
    });

    const [formData, setFormData] = useState<PaymentConfig>(config);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            navigate("/");
            return;
        }

        // Load config from localStorage
        const stored = localStorage.getItem("payment_config");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setConfig(parsed);
                setFormData(parsed);
            } catch (err) {
                console.error("Failed to load payment config:", err);
            }
        }
    }, [isAdmin, navigate]);

    const handleChange = (field: keyof PaymentConfig, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setLoading(true);

        try {
            // Validate inputs
            if (!formData.keyId.trim()) {
                toast({
                    title: "Error",
                    description: "Razorpay Key ID is required",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            if (!formData.keySecret.trim()) {
                toast({
                    title: "Error",
                    description: "Razorpay Key Secret is required",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            // Save to localStorage
            const updatedConfig = {
                ...formData,
                lastUpdated: new Date().toISOString(),
            };

            localStorage.setItem("payment_config", JSON.stringify(updatedConfig));

            // TODO: In production, also save to Firestore with encryption
            // await saveConfigToFirestore(updatedConfig);

            setConfig(updatedConfig);
            setHasChanges(false);

            toast({
                title: "Success",
                description: "Payment configuration updated successfully",
            });
        } catch (error) {
            console.error("Failed to save config:", error);
            toast({
                title: "Error",
                description: "Failed to save payment configuration",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData(config);
        setHasChanges(false);
    };

    const handleCopyKeyId = () => {
        navigator.clipboard.writeText(formData.keyId);
        toast({
            title: "Copied",
            description: "Key ID copied to clipboard",
        });
    };

    if (!isAdmin) {
        return (
            <Layout>
                <div className="container py-8">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Access denied. Only admins can access payment configuration.
                        </AlertDescription>
                    </Alert>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container py-8 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                >
                    <div>
                        <h1 className="text-3xl font-bold">Payment Gateway Configuration</h1>
                        <p className="text-muted-foreground mt-2">
                            Configure your Razorpay API credentials for payment processing
                        </p>
                    </div>

                    {/* Security Warning */}
                    <Alert>
                        <Lock className="h-4 w-4" />
                        <AlertDescription>
                            Keep your API Secret Key confidential. Never share it or commit it to version control.
                        </AlertDescription>
                    </Alert>

                    {/* Configuration Card */}
                    <Card className="border-border/50 bg-card/50">
                        <CardHeader>
                            <CardTitle className="text-xl">Razorpay Credentials</CardTitle>
                            <CardDescription>
                                Enter your Razorpay API credentials from your dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {config.lastUpdated && (
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-success" />
                                    Last updated: {new Date(config.lastUpdated).toLocaleString()}
                                </div>
                            )}

                            {/* Key ID */}
                            <div className="space-y-2">
                                <Label htmlFor="keyId">Razorpay Key ID</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="keyId"
                                        type="text"
                                        placeholder="rzp_live_xxxxxxxxxxxxx"
                                        value={formData.keyId}
                                        onChange={(e) => handleChange("keyId", e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopyKeyId}
                                        disabled={!formData.keyId}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Found in your Razorpay Dashboard under API Keys
                                </p>
                            </div>

                            {/* Key Secret */}
                            <div className="space-y-2">
                                <Label htmlFor="keySecret">Razorpay Key Secret</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="keySecret"
                                        type={showSecretKey ? "text" : "password"}
                                        placeholder="••••••••••••••••••••••"
                                        value={formData.keySecret}
                                        onChange={(e) => handleChange("keySecret", e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowSecretKey(!showSecretKey)}
                                    >
                                        {showSecretKey ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Keep this secret and never share it publicly
                                </p>
                            </div>

                            {/* Merchant ID */}
                            <div className="space-y-2">
                                <Label htmlFor="merchantId">Merchant ID (Optional)</Label>
                                <Input
                                    id="merchantId"
                                    type="text"
                                    placeholder="Enter your merchant ID"
                                    value={formData.merchantId}
                                    onChange={(e) => handleChange("merchantId", e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Your business merchant ID for Razorpay
                                </p>
                            </div>

                            {/* Test Mode Toggle */}
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                                <input
                                    type="checkbox"
                                    id="testMode"
                                    checked={formData.testMode}
                                    onChange={(e) => handleChange("testMode", e.target.checked)}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <div>
                                    <label htmlFor="testMode" className="text-sm font-medium cursor-pointer">
                                        Test Mode
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        Use test credentials for development. Uncheck for production.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Test Credentials Info */}
                    <Card className="border-amber-200/50 bg-amber-50 dark:bg-amber-950/30">
                        <CardHeader>
                            <CardTitle className="text-base text-amber-900 dark:text-amber-100">
                                Test Credentials
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
                            <p>
                                <strong>Test Card:</strong> 4111111111111111
                            </p>
                            <p>
                                <strong>Expiry:</strong> Any future date
                            </p>
                            <p>
                                <strong>CVV:</strong> Any 3 digits
                            </p>
                            <p>
                                <strong>Note:</strong> Use test keys from your Razorpay dashboard when in test mode
                            </p>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={!hasChanges || loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="hero"
                            onClick={handleSave}
                            disabled={!hasChanges || loading}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? "Saving..." : "Save Configuration"}
                        </Button>
                    </div>

                    {/* Instructions */}
                    <Card className="border-border/50 bg-card/50">
                        <CardHeader>
                            <CardTitle className="text-base">Setup Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3">
                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                <li>
                                    Go to{" "}
                                    <a
                                        href="https://dashboard.razorpay.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        Razorpay Dashboard
                                    </a>
                                </li>
                                <li>Sign in to your account</li>
                                <li>Navigate to Settings → API Keys</li>
                                <li>Copy your Key ID and Key Secret</li>
                                <li>Paste them above and save</li>
                                <li>Test with test credentials first</li>
                                <li>Switch to live keys for production</li>
                            </ol>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </Layout>
    );
}
