import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SkillBar from '@/components/SkillBar';
import portrait from '@/assets/portrait.jpg';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, useInView } from 'framer-motion';
import { MapPin, Mail, Briefcase, GraduationCap, Heart, Cpu, Sprout, Lightbulb } from 'lucide-react';

const defaultSkills = [
  { skill: 'Robotics & Arduino', percentage: 88 },
  { skill: 'IoT Development', percentage: 82 },
  { skill: 'STEM Education', percentage: 92 },
  { skill: 'Web Development', percentage: 75 },
  { skill: 'CAD & 3D Design', percentage: 65 },
  { skill: 'Python / C++', percentage: 70 },
];

const milestones = [
  {
    year: '2023',
    title: 'General Science (ICT) — SHS',
    org: 'Aggrey Memorial A.M.E. Zion SHS',
    description: 'Completed senior high school with a focus on science and information technology.',
    icon: '🎓',
  },
  {
    year: '2024',
    title: 'Intern — MakeUp Lab',
    org: 'Academic City University',
    description: 'Assisted in building sustainable technology tools: plastic shredder and 3D filament extruder.',
    icon: '🔧',
  },
  {
    year: '2025',
    title: 'Girl Mentor',
    org: 'Technovation',
    description: 'Empowering girls to identify global issues and solve them through tech innovation.',
    icon: '❤️',
  },
  {
    year: '2025',
    title: 'STEM Instructor & Jr. Robotics Engineer',
    org: 'Inovtech STEM Center',
    description: 'Facilitating hands-on robotics workshops using LEGO® Mindstorms, Arduino, and Avishkaar.',
    icon: '🤖',
  },
];

const bioHighlights = [
  { icon: Cpu, label: 'Robotics Instructor', color: 'text-primary' },
  { icon: Sprout, label: 'AgriTech Enthusiast', color: 'text-primary' },
  { icon: GraduationCap, label: 'STEM Educator', color: 'text-primary' },
  { icon: Lightbulb, label: 'Autodidact Engineer', color: 'text-primary' },
];

const FadeInSection = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const About = () => {
  const [aboutContent, setAboutContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [skills, setSkills] = useState(defaultSkills);

  useEffect(() => {
    loadAboutContent();
    loadSkills();
  }, []);

  const loadAboutContent = async () => {
    try {
      const { data } = await supabase.from('about_content').select('*').single();
      setAboutContent(data);
    } catch (error) {
      console.error('Error loading about content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const rawBio = (aboutContent as any)?.about_description || 
    'I am Justice Ansah, a young innovator who grew up in a farming community with no background in technology. From those simple beginnings, curiosity led me to robotics, IoT development, and teaching STEM education. My work now bridges technology, agriculture, and sustainable development, with a vision to reimagine how communities grow and thrive. My journey has never been a straight line, but each step has been driven by a belief that innovation can rise from any soil. The story is still unfolding.';

  // Split bio into paragraphs for better formatting
  const bioParagraphs = rawBio.split('\n').filter((p: string) => p.trim().length > 0);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="About" description="Learn about Justice Ansah — a self-taught innovator bridging technology, agriculture, and sustainable development." url="/about" />
      <Navigation />

      {/* Hero Section — Cinematic Intro */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-5 gap-10 sm:gap-16 items-center">
            {/* Image — Takes 2 cols */}
            <motion.div
              className="lg:col-span-2 order-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative mx-auto max-w-sm">
                {/* Decorative ring */}
                <div className="absolute -inset-3 rounded-2xl border border-primary/20 rotate-2" />
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-sm" />
                {!isLoading ? (
                  <img
                    src={(aboutContent as any)?.profile_image_url || portrait}
                    alt="Justice Ansah - STEM Educator & Robotics Engineer"
                    className="relative w-full rounded-2xl object-cover aspect-[3/4] shadow-glow"
                  />
                ) : (
                  <div className="relative w-full rounded-2xl aspect-[3/4] bg-muted animate-pulse" />
                )}
              </div>
            </motion.div>

            {/* Text content — Takes 3 cols */}
            <motion.div
              className="lg:col-span-3 order-2 space-y-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div>
                <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-3">Who I Am</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-foreground">
                  Justice Ansah
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground mt-2 font-medium">
                  Autodidact Engineer · Robotics Instructor · Innovator
                </p>
              </div>

              {/* Quick info chips */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <MapPin className="w-3 h-3" /> Ghana
                </span>
                <a href="mailto:justiceansah@gmail.com" className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                  <Mail className="w-3 h-3" /> justiceansah@gmail.com
                </a>
              </div>

              {/* Highlight tags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {bioHighlights.map((h, i) => (
                  <motion.div
                    key={h.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card/80 border border-border hover:border-primary/30 hover:shadow-glow transition-all duration-300"
                  >
                    <h.icon className={`w-5 h-5 ${h.color}`} />
                    <span className="text-[11px] font-semibold text-muted-foreground text-center leading-tight">{h.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bio Section — Clean, structured layout */}
      <section className="py-16 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <FadeInSection>
            <div className="text-center mb-12">
              <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-3">My Story</p>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">The Journey So Far</h2>
            </div>
          </FadeInSection>

          <div className="space-y-6">
            {bioParagraphs.map((paragraph: string, i: number) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <div className="relative group">
                  {/* Accent bar on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/0 group-hover:bg-primary/50 transition-colors duration-500 rounded-full" />
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed pl-5 group-hover:text-foreground/80 transition-colors duration-500">
                    {paragraph}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>

          {/* Decorative divider */}
          <FadeInSection delay={0.2}>
            <div className="flex items-center justify-center gap-3 mt-14">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/40" />
              <Sprout className="w-5 h-5 text-primary/50" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/40" />
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 sm:py-20 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <FadeInSection>
            <div className="text-center mb-12">
              <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-3">Competencies</p>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Core Skills</h2>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.15}>
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-2">
              {skills.map((s, i) => (
                <SkillBar key={s.skill} skill={s.skill} percentage={s.percentage} delay={i * 100} />
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <FadeInSection>
            <div className="text-center mb-14">
              <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-3">The Journey</p>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Career Milestones</h2>
            </div>
          </FadeInSection>

          <div className="relative">
            {/* Vertical line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent -translate-x-1/2" />
            <div className="md:hidden absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />

            <div className="space-y-10">
              {milestones.map((m, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <FadeInSection key={i} delay={i * 0.12}>
                    <div
                      className={`relative flex items-start gap-6 ${
                        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                      } flex-row`}
                    >
                      {/* Node dot */}
                      <div className="hidden md:flex absolute left-1/2 top-4 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-glow z-10" />
                      <div className="md:hidden flex-shrink-0 relative z-10 mt-1">
                        <div className="w-4 h-4 rounded-full bg-primary border-2 border-background shadow-glow" />
                      </div>

                      {/* Content */}
                      <div className={`md:w-1/2 ${isLeft ? 'md:pr-10 md:text-right' : 'md:pl-10 md:text-left'} flex-1 md:flex-none`}>
                        <div className="glass-card p-5 hover-lift glow-border-hover transition-all duration-300">
                          <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'md:justify-end' : ''}`}>
                            <span className="text-xl">{m.icon}</span>
                            <span className="text-xs font-bold text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">{m.year}</span>
                          </div>
                          <h3 className="font-heading font-bold text-base text-foreground mb-1">{m.title}</h3>
                          <p className="text-primary text-sm font-medium mb-2">{m.org}</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">{m.description}</p>
                        </div>
                      </div>

                      {/* Spacer for the other side on desktop */}
                      <div className="hidden md:block md:w-1/2" />
                    </div>
                  </FadeInSection>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
