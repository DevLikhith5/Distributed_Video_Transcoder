import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative border-t border-border/40 bg-background pt-32 pb-12 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-dot-pattern opacity-50" />

      {/* Massive Watermark */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 -z-10 select-none pointer-events-none">
        <h1 className="text-[20vw] font-bold text-foreground/5 tracking-tighter leading-none whitespace-nowrap">
          STREAMLY
        </h1>
      </div>

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        {/* Pre-Footer CTA */}
        <div className="flex flex-col items-center text-center mb-32">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Ready to build the future?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10">
            Join thousands of developers building the next generation of video apps.
          </p>
          <Link to="/signup">
            <div className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-medium flex items-center justify-center hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:scale-105 cursor-pointer">
              Start for free
            </div>
          </Link>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-24">
          {/* Brand Section */}
          <div className="lg:pr-8">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <div className="h-4 w-4 bg-background rounded-sm" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Streamly
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Powering video transcoding for the next generation of creators and developers. Built for speed, security, and scale.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-bold mb-6 text-foreground">Product</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold mb-6 text-foreground">Company</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold mb-6 text-foreground">Legal</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} Streamly. All rights reserved.</span>
          </div>

          {/* System Status */}
          {/* <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">All systems operational</span>
          </div> */}

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};