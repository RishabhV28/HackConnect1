import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Share2, 
  BarChart3, 
  MessageSquare, 
  Calendar, 
  ArrowRight 
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-32 lg:pb-36">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary-50/30 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
                <span className="bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">Connect</span> and{" "}
                <span className="bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">Collaborate</span> with Student Organizations
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                HackConnect helps student organizations share resources, 
                offer services, and build a stronger community together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button asChild size="lg" className="font-medium">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                {/* Main graphics/illustration would go here */}
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 shadow-xl flex items-center justify-center p-8">
                  <div className="text-7xl text-primary-600 font-bold">HC</div>
                </div>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-lg"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need for Campus Collaboration</h2>
            <p className="text-lg text-muted-foreground">
              HackConnect provides all the tools student organizations need to connect, share resources, 
              and grow together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-10 w-10 text-primary" />}
              title="Connect with Organizations"
              description="Build relationships with other student groups and expand your network on campus."
            />
            <FeatureCard
              icon={<Share2 className="h-10 w-10 text-primary" />}
              title="Share Equipment & Resources"
              description="Borrow and lend equipment for events to maximize resource utilization."
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-primary" />}
              title="Offer & Find Services"
              description="Provide specialized services to other organizations or find the help you need."
            />
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-primary" />}
              title="Direct Messaging"
              description="Communicate directly with other organizations to coordinate collaborations."
            />
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-primary" />}
              title="Event Planning"
              description="Coordinate events, track availability, and manage resource scheduling."
            />
            <FeatureCard
              icon={<ArrowRight className="h-10 w-10 text-primary" />}
              title="Community Growth"
              description="Build a stronger campus community through meaningful partnerships."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-700 shadow-xl p-8 md:p-12 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Connect Your Organization?</h2>
              <p className="text-lg text-primary-100 mb-8">
                Join HackConnect today and start collaborating with other student organizations on campus.
              </p>
              <Button asChild size="lg" variant="secondary" className="font-medium">
                <Link href="/register">Create Your Organization Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-primary">HackConnect</h3>
              <p className="text-sm text-muted-foreground mt-2">© 2025 HackConnect. All rights reserved.</p>
            </div>
            <div className="flex space-x-8">
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}