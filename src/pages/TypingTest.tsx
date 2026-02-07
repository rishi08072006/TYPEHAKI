import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Play, RefreshCw, Trophy } from "lucide-react";
import { sampleTypingText } from "@/lib/mockData";
import { Link } from "react-router-dom";

type TestStatus = "rules" | "ready" | "typing" | "finished";

export default function TypingTest() {
  const [status, setStatus] = useState<TestStatus>("rules");
  const [timeLeft, setTimeLeft] = useState(60);
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompetition, setIsCompetition] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const text = sampleTypingText;

  const rules = [
    "You have only one attempt to complete this test",
    "Use of AI tools or extensions is strictly prohibited",
    "The test will auto-end when the timer reaches zero",
    "Your score is calculated based on WPM and accuracy",
  ];

  const calculateStats = useCallback(() => {
    if (!startTime) return;

    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    const wordsTyped = typedText.trim().split(/\s+/).length;
    const calculatedWpm = Math.round(wordsTyped / timeElapsed) || 0;

    let correctChars = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === text[i]) correctChars++;
    }
    const calculatedAccuracy = typedText.length > 0
      ? Math.round((correctChars / typedText.length) * 100)
      : 100;

    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);
  }, [typedText, startTime, text]);

  useEffect(() => {
    if (status !== "typing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status === "typing") {
      calculateStats();
    }
  }, [typedText, status, calculateStats]);

  useEffect(() => {
    if (status === "typing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status]);

  const handleStart = () => {
    setStatus("typing");
    setStartTime(Date.now());
    setTypedText("");
    setTimeLeft(60);
    setWpm(0);
    setAccuracy(100);
  };

  const handleRestart = () => {
    setStatus("ready");
    setTypedText("");
    setTimeLeft(60);
    setWpm(0);
    setAccuracy(100);
    setStartTime(null);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== "typing") return;
    const value = e.target.value;
    if (value.length <= text.length) {
      setTypedText(value);
      if (value.length === text.length) {
        setStatus("finished");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (status === "ready" && e.key === "Enter") {
      handleStart();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderText = () => {
    return text.split("").map((char, index) => {
      let className = "text-muted-foreground";

      if (index < typedText.length) {
        className = typedText[index] === char
          ? "text-success"
          : "text-destructive bg-destructive/20";
      }

      if (index === typedText.length) {
        return (
          <span key={index} className="relative">
            <span className="absolute -left-[1px] w-[2px] h-6 bg-primary animate-cursor-blink" />
            <span className={className}>{char}</span>
          </span>
        );
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {status === "rules" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardContent className="py-12 space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-warning/10 flex items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-warning" />
                    </div>
                    <h2 className="text-2xl font-bold">Before You Start</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Please read and understand the following rules before beginning your typing test.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto space-y-4">
                    {rules.map((rule, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{rule}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Badge variant={isCompetition ? "success" : "secondary"}>
                        {isCompetition ? "Competition Mode" : "Practice Mode"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCompetition(!isCompetition)}
                      >
                        Switch Mode
                      </Button>
                    </div>
                    <Button variant="hero" size="xl" onClick={() => setStatus("ready")}>
                      I Understand, Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {status === "ready" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <Badge variant={isCompetition ? "success" : "secondary"} className="text-sm">
                  {isCompetition ? "Competition Mode" : "Practice Mode"}
                </Badge>
                <h2 className="text-3xl font-bold">Ready to Type?</h2>
                <p className="text-muted-foreground">
                  Click the button below or press Enter to start the test
                </p>
              </div>

              <div className="text-6xl font-mono font-bold text-primary">
                {formatTime(timeLeft)}
              </div>

              <Button
                variant="hero"
                size="xl"
                onClick={handleStart}
                onKeyDown={handleKeyDown}
                className="animate-pulse-glow"
              >
                <Play className="h-5 w-5" />
                Start Test
              </Button>
            </motion.div>
          )}

          {status === "typing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Stats Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-mono font-bold">{wpm}</p>
                    <p className="text-sm text-muted-foreground">WPM</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-mono font-bold">{accuracy}%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className={`text-5xl font-mono font-bold ${timeLeft <= 10 ? 'text-destructive' : 'text-primary'}`}>
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>

              {/* Typing Area */}
              <Card className="bg-card/50 border-border/50">
                <CardContent className="py-12">
                  <div
                    className="font-mono text-lg md:text-xl leading-relaxed cursor-text"
                    onClick={() => inputRef.current?.focus()}
                  >
                    {renderText()}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={typedText}
                    onChange={handleInput}
                    className="absolute opacity-0 -z-10"
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </CardContent>
              </Card>

              <p className="text-center text-sm text-muted-foreground">
                Start typing to begin. Click on the text area if keyboard isn't responding.
              </p>
            </motion.div>
          )}

          {status === "finished" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardContent className="py-12 space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">Test Complete!</h2>
                    <p className="text-muted-foreground">
                      {isCompetition
                        ? "Your result has been submitted. Check the leaderboard for your ranking."
                        : "Great practice session! Try again to improve your score."}
                    </p>
                  </div>

                  <div className="flex justify-center gap-12">
                    <div className="text-center">
                      <p className="text-5xl font-mono font-bold text-primary">{wpm}</p>
                      <p className="text-muted-foreground">Words per Minute</p>
                    </div>
                    <div className="text-center">
                      <p className="text-5xl font-mono font-bold">{accuracy}%</p>
                      <p className="text-muted-foreground">Accuracy</p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    {!isCompetition && (
                      <Button variant="outline" size="lg" onClick={handleRestart}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    )}
                    <Link to="/leaderboard">
                      <Button variant="hero" size="lg">
                        <Trophy className="h-4 w-4 mr-2" />
                        View Leaderboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
