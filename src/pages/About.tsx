import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SkillBar from '@/components/SkillBar';
import portrait from '@/assets/portrait.jpg';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const skills = [
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

const About = () => {
  const [aboutContent, setAboutContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAboutContent();
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* About Hero */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div className="space-y-6 order-2 lg:order-1 animate-fade-up">
              <div>
                <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">Who I Am</p>
                <h1 className="section-heading text-3xl sm:text-4xl lg:text-5xl">ABOUT</h1>
              </div>
              <a href="mailto:justiceansah@gmail.com" className="text-primary hover:underline font-medium text-sm sm:text-base inline-block">
                justiceansah@gmail.com
              </a>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {(aboutContent as any)?.about_description || 'I am Justice Ansah, a young innovator who grew up in a farming community with no background in technology. From those simple beginnings, curiosity led me to robotics, IoT development, and teaching STEM education. My work now bridges technology, agriculture, and sustainable development, with a vision to reimagine how communities grow and thrive. My journey has never been a straight line, but each step has been driven by a belief that innovation can rise from any soil. The story is still unfolding.'}
              </p>
            </div>

            <div className="relative order-1 lg:order-2">
              {!isLoading && (
                <img
                  src={(aboutContent as any)?.profile_image_url || portrait}
                  alt="Justice Ansah - STEM Educator & Robotics Engineer"
                  className="w-full max-w-md mx-auto transition-all duration-500 rounded-2xl"
                  style={{
                    maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 70%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0.2) 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 70%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0.2) 100%)'
                  }}
                />
              )}
              {isLoading && (
                <div className="w-full max-w-md mx-auto h-96 bg-muted animate-pulse rounded-2xl" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 sm:py-20 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">Competencies</p>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold">Core Skills</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-2">
            {skills.map((s, i) => (
              <SkillBar key={s.skill} skill={s.skill} percentage={s.percentage} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">The Journey</p>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold">Career Milestones</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent -translate-x-1/2" />
            <div className="md:hidden absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />

            <div className="space-y-10">
              {milestones.map((m, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <div
                    key={i}
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
