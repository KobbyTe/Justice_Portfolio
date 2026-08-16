import { Github, Linkedin, Twitter, Mail, ArrowUp, Instagram, Youtube, Facebook, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type SocialLink = { id: string; platform: string; url: string };

const getIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'github': return Github;
    case 'linkedin': return Linkedin;
    case 'twitter':
    case 'x': return Twitter;
    case 'instagram': return Instagram;
    case 'youtube': return Youtube;
    case 'facebook': return Facebook;
    case 'email':
    case 'mail': return Mail;
    default: return ExternalLink;
  }
};

const Footer = () => {
  const year = new Date().getFullYear();
  const [socials, setSocials] = useState<SocialLink[]>([]);

  useEffect(() => {
    supabase
      .from('social_links')
      .select('id, platform, url')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setSocials((data as SocialLink[]) || []));
  }, []);


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
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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
                ...socials.map((s) => ({ href: s.url, icon: getIcon(s.platform), label: s.platform, tooltip: s.platform })),
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
