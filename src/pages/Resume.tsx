import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TechStack from '@/components/TechStack';
import { Download, Briefcase, GraduationCap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const experiences = [
  {
    type: 'work',
    icon: '🤖',
    title: 'STEM Instructor & Jr. Robotics Engineer',
    org: 'Inovtech STEM Center',
    period: 'February 2025 – Present',
    description: 'Facilitated hands-on robotics workshops using LEGO® Mindstorms, Arduino, and Avishkaar platforms.',
  },
  {
    type: 'work',
    icon: '❤️',
    title: 'Girl Mentor',
    org: 'Technovation',
    period: '2025 – Present',
    description: 'Empowered students to identify and solve global issues through innovative technology solutions.',
  },
  {
    type: 'work',
    icon: '🔧',
    title: 'Intern',
    org: 'Academic City University MakeUp Lab',
    period: 'August 2024 – November 2024',
    description: 'Assisted in developing sustainable technology tools including plastic shredder and 3D filament extruder.',
  },
];

const education = [
  {
    type: 'edu',
    icon: '🎓',
    title: 'General Science with ICT',
    org: 'Aggrey Memorial A.M.E. Zion SHS',
    period: '2021 – 2023',
    description: 'Completed senior high school with a focus on science and information and communication technology.',
  },
];

interface TimelineCardProps {
  item: typeof experiences[0];
  index: number;
  align: 'left' | 'right';
}

const TimelineCard = ({ item, index, align }: TimelineCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative flex items-start gap-6 ${
        align === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'
      } flex-row`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateX(0)'
          : align === 'left' ? 'translateX(-32px)' : 'translateX(32px)',
        transition: `opacity 0.6s ease ${index * 100}ms, transform 0.6s ease ${index * 100}ms`,
      }}
    >
      {/* Node dot - desktop */}
      <div className="hidden md:flex absolute left-1/2 top-5 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-glow z-10" />
      {/* Node dot - mobile */}
      <div className="md:hidden flex-shrink-0 relative z-10 mt-2">
        <div className="w-4 h-4 rounded-full bg-primary border-2 border-background shadow-glow" />
      </div>

      {/* Card */}
      <div className={`md:w-1/2 ${align === 'left' ? 'md:pr-10' : 'md:pl-10'} flex-1 md:flex-none`}>
        <div className="glass-card p-5 hover-lift glow-border-hover">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.period}</span>
          </div>
          <h3 className="font-heading font-bold text-base text-foreground mb-1">{item.title}</h3>
          <p className="text-primary text-sm font-semibold mb-2">{item.org}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
        </div>
      </div>

      {/* Spacer */}
      <div className="hidden md:block md:w-1/2" />
    </div>
  );
};

const Resume = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResumeFile();
  }, []);

  const loadResumeFile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resume_files')
        .select('*')
        .eq('is_current', true)
        .maybeSingle();
      if (error) console.error('Error loading resume file:', error);
      else setResumeFile(data);
    } catch (error) {
      console.error('Error loading resume file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if ((resumeFile as any)?.file_url) {
      window.open((resumeFile as any).file_url, '_blank');
    }
  };

  const allItems = [...experiences, ...education];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Resume" description="Experience, education, and skills of Justice Ansah — Robotics Engineer, STEM Educator, and IoT Developer." url="/resume" />
      <Navigation />

      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 animate-fade-up">
            <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">My Journey</p>
            <h1 className="section-heading text-center text-3xl sm:text-4xl lg:text-5xl">RÉSUMÉ</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Experience, education, and the moments that shaped who I am.</p>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto mb-20">
            {/* Experience */}
            <div className="flex items-center gap-3 mb-10">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-heading font-bold text-primary">Experience</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/40 to-transparent" />
            </div>

            <div className="relative mb-16">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent -translate-x-1/2" />
              <div className="md:hidden absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
              <div className="space-y-8">
                {experiences.map((item, i) => (
                  <TimelineCard key={i} item={item} index={i} align={i % 2 === 0 ? 'left' : 'right'} />
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="flex items-center gap-3 mb-10">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-heading font-bold text-primary">Education</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/40 to-transparent" />
            </div>

            <div className="relative mb-16">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent -translate-x-1/2" />
              <div className="md:hidden absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
              <div className="space-y-8">
                {education.map((item, i) => (
                  <TimelineCard key={i} item={item} index={i} align="left" />
                ))}
              </div>
            </div>
          </div>

          {/* Download CTA */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="glass-card p-8 text-center glow-border-hover border border-primary/20 rounded-2xl">
              <h3 className="font-heading font-bold text-xl mb-2">Want the full picture?</h3>
              <p className="text-muted-foreground text-sm mb-6">Download the complete résumé — all experience, skills, and achievements in one place.</p>
              <Button
                onClick={handleDownload}
                disabled={loading || !resumeFile}
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 px-10 shadow-glow hover:shadow-[0_0_28px_hsl(var(--primary)/0.5)] transition-all duration-300 text-base"
              >
                <Download className="w-5 h-5 mr-2" />
                {loading
                  ? 'Loading...'
                  : resumeFile
                    ? `Download ${(resumeFile as any).file_name}`
                    : 'No Resume Available'
                }
              </Button>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <div className="text-center mb-10">
              <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">Tools & Technologies</p>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold">Tech Stack</h2>
            </div>
            <TechStack />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resume;
