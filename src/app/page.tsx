import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Shield, MessageSquare, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-primary">
            FindIt
          </h1>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-heading font-bold tracking-tight text-foreground mb-6">
          Lost Something on Campus?
          <br />
          <span className="text-primary">
            We&apos;ll Help You Find It.
          </span>
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Report lost items, browse found items, and get automatically matched
          with potential finders. Connect via real-time chat to get your
          belongings back.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/browse">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Browse Items
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-heading font-bold text-center mb-12">
          How It Works
        </h3>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              icon: Search,
              title: "Report",
              desc: "Post your lost or found item with details, photos, and location.",
              color: "bg-primary/10 text-primary",
            },
            {
              icon: Zap,
              title: "Auto-Match",
              desc: "Our algorithm matches lost items with found items automatically.",
              color: "bg-amber/10 text-amber",
            },
            {
              icon: MessageSquare,
              title: "Connect",
              desc: "Chat in real-time with the person who found or lost the item.",
              color: "bg-teal/10 text-teal",
            },
            {
              icon: Shield,
              title: "Recover",
              desc: "Arrange a meetup and get your belongings back safely.",
              color: "bg-success/10 text-success",
            },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div
                className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <step.icon className="w-8 h-8" />
              </div>
              <h4 className="font-heading font-semibold text-lg mb-2">
                {step.title}
              </h4>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-muted-foreground">
        <p className="font-heading font-semibold text-primary mb-1">FindIt</p>
        <p className="text-sm">Reuniting people with what matters.</p>
      </footer>
    </div>
  );
}
