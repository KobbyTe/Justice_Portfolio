import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PartnerLogo {
  id: string;
  name: string;
  logo_url: string;
  category: string;
}

const LogoCarousel = () => {
  const [logos, setLogos] = useState<PartnerLogo[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('partner_logos')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (data && data.length > 0) setLogos(data);
    };
    load();
  }, []);

  if (logos.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-muted/30 border-y border-border/40 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <p className="text-center text-sm sm:text-base font-medium tracking-widest uppercase text-muted-foreground">
          Trusted By & Featured At
        </p>
      </div>
      <div
        className="group relative flex overflow-hidden"
        aria-label="Partner logos carousel"
      >
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        {/* Two copies for seamless loop */}
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center gap-8 sm:gap-12 animate-logo-scroll group-hover:[animation-play-state:paused]"
            aria-hidden={copy === 1}
          >
            {logos.map((logo) => (
              <div
                key={`${copy}-${logo.id}`}
                className="flex items-center justify-center h-12 sm:h-16 w-28 sm:w-36 shrink-0"
              >
                <img
                  src={logo.logo_url}
                  alt={logo.name}
                  className="max-h-full max-w-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default LogoCarousel;
