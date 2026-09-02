import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Award, X } from 'lucide-react';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface Certificate {
  id: string;
  title: string;
  issuer: string | null;
  description: string | null;
  category: string;
  file_url: string | null;
  credential_url: string | null;
  issued_on: string | null;
}

const formatDate = (value: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

const Certificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [preview, setPreview] = useState<Certificate | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('certificates')
        .select('id, title, issuer, description, category, file_url, credential_url, issued_on')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('issued_on', { ascending: false });
      setCertificates((data as Certificate[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(certificates.map((c) => c.category).filter(Boolean)));
    return ['All', ...unique];
  }, [certificates]);

  const filtered =
    activeFilter === 'All' ? certificates : certificates.filter((c) => c.category === activeFilter);

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPreview(null);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [preview]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Certificates"
        description="Certifications and credentials earned by Justice Ansah across robotics, STEM education, and AI."
        url="/certificates"
      />
      <Navigation />

      <main>
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">Credentials</p>
              <h1 className="section-heading text-center text-3xl sm:text-4xl lg:text-5xl mb-4">Certificates</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Training, certifications, and recognitions collected along the journey.
              </p>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-14">
              {categories.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  aria-pressed={activeFilter === filter}
                  className={`px-4 py-2 min-h-[44px] text-sm font-medium rounded-full border transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-primary text-primary-foreground border-primary shadow-glow'
                      : 'border-border text-muted-foreground hover:text-primary hover:border-primary/60'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Award className="w-10 h-10 mx-auto mb-4 text-muted-foreground/60" aria-hidden="true" />
                <p className="text-muted-foreground text-lg">No certificates in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filtered.map((cert, i) => (
                  <motion.article
                    key={cert.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
                    className="glass-card overflow-hidden flex flex-col group"
                  >
                    <button
                      type="button"
                      onClick={() => cert.file_url && setPreview(cert)}
                      className="relative aspect-[4/3] w-full bg-muted/40 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={cert.file_url ? `View ${cert.title} certificate` : cert.title}
                    >
                      {cert.file_url ? (
                        <img
                          src={cert.file_url}
                          alt={cert.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Award className="w-10 h-10 text-primary/60" aria-hidden="true" />
                        </span>
                      )}
                    </button>

                    <div className="p-5 flex flex-col gap-2 flex-1">
                      <span className="inline-flex self-start text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        {cert.category}
                      </span>
                      <h2 className="font-heading text-lg font-semibold leading-snug">{cert.title}</h2>
                      {(cert.issuer || cert.issued_on) && (
                        <p className="text-sm text-muted-foreground">
                          {[cert.issuer, formatDate(cert.issued_on)].filter(Boolean).join(' • ')}
                        </p>
                      )}
                      {cert.description && (
                        <p className="text-sm text-muted-foreground/90 line-clamp-3">{cert.description}</p>
                      )}
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto pt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          View credential
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Lightbox */}
      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={preview.title}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <button
            type="button"
            onClick={() => setPreview(null)}
            aria-label="Close preview"
            className="absolute top-4 right-4 p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full bg-muted/60 text-foreground hover:text-primary"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
          <img
            src={preview.file_url!}
            alt={preview.title}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Certificates;
