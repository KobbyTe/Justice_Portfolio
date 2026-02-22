import { Github, Linkedin, Twitter, Mail, ArrowUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border overflow-hidden">
      {/* Gradient top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/5 blur-3xl pointer-events-none" />

      {/* Contact CTA */}
      <div className="py-10 sm:py-16 text-center border-b border-border relative z-10 px-4">
        <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">Let's Connect</p>
        <h2 className="text-xl sm:text-3xl font-heading font-bold text-foreground mb-3 sm:mb-4">
          Let's Build Something Together
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm mb-6 sm:mb-8">
          Whether it's a robotics project, STEM collaboration, or just a conversation about innovation — I'm open.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm sm:max-w-none mx-auto">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow hover:shadow-[0_0_28px_hsl(var(--primary)/0.5)] transition-all duration-300">
            <a href="mailto:kwabenatekyi19@gmail.com">
              <Mail className="w-4 h-4 mr-2" />
              Email Me
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 font-semibold transition-all duration-300">
            <a href="https://wa.me/233536987839" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              WhatsApp Me
            </a>
          </Button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-6 sm:py-10 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
              © {year} Justice Ansah. All rights reserved.
            </p>

            <div className="flex items-center space-x-1">
              {[
                { href: 'https://github.com/KobbyTe', icon: Github, label: 'GitHub', tooltip: 'GitHub' },
                { href: 'https://www.linkedin.com/in/justice-ansah-85917529a/', icon: Linkedin, label: 'LinkedIn', tooltip: 'LinkedIn' },
                { href: '#', icon: Twitter, label: 'Twitter', tooltip: 'Twitter' },
                { href: 'mailto:kwabenatekyi19@gmail.com', icon: Mail, label: 'Email', tooltip: 'Email' },
              ].map(({ href, icon: Icon, label, tooltip }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group relative p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-card text-foreground text-xs rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    {tooltip}
                  </span>
                </a>
              ))}
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              Back to top
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </div>

          <div className="flex justify-center space-x-4 sm:space-x-6 mt-6 pt-6 border-t border-border">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
