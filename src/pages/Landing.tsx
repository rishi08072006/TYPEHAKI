import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Keyboard, Trophy, Timer, Users, Zap, Shield, ChevronRight } from "lucide-react";

export default function Landing() {
  const steps = [
    {
      icon: Users,
      title: "Register for a Round",
      description: "Sign up for upcoming typing competitions with a small entry fee.",
    },
    {
      icon: Timer,
      title: "Type During the Window",
      description: "Complete your typing test within the scheduled time window.",
    },
    {
      icon: Trophy,
      title: "Get Ranked & Win",
      description: "Compete for top positions and win from the prize pool.",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Real-time Competition",
      description: "Compete against typists from across the country in scheduled rounds.",
    },
    {
      icon: Shield,
      title: "Fair Play Guaranteed",
      description: "Advanced anti-cheat measures ensure a level playing field for everyone.",
    },
    {
      icon: Trophy,
      title: "Win Real Rewards",
      description: "Top performers share the prize pool based on their ranking.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Keyboard className="h-4 w-4" />
              Skill-Based Typing Competitions
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Type fast.{" "}
              <span className="text-gradient">Compete smart.</span>
              <br />
              Win rewards.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join India's premier typing competition platform. Register for rounds, 
              showcase your speed, and climb the leaderboard to win real prizes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Login with Google
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How TypeHaki Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to compete and win
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="relative h-full bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill-Based Competition */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                A True <span className="text-gradient">Skill-Based</span> Competition
              </h2>
              <p className="text-lg text-muted-foreground">
                TypeHaki is designed for serious typists who want to prove their skills. 
                No luck involved—just pure typing speed and accuracy determine your rank.
              </p>
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl bg-card border border-border overflow-hidden">
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-destructive/70" />
                    <div className="w-3 h-3 rounded-full bg-warning/70" />
                    <div className="w-3 h-3 rounded-full bg-success/70" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="font-mono text-lg md:text-xl leading-relaxed text-center max-w-md">
                      <span className="text-success">The quick brown fox</span>
                      <span className="text-primary animate-pulse">|</span>
                      <span className="text-muted-foreground"> jumps over the lazy dog</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>WPM: <span className="text-foreground font-medium">125</span></span>
                    <span>Accuracy: <span className="text-foreground font-medium">98.5%</span></span>
                    <span>Time: <span className="text-foreground font-medium">0:45</span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-primary/5 to-primary/10">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Compete?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of typists competing for glory and prizes. 
              Your next victory is just a few keystrokes away.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Get Started Now
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
