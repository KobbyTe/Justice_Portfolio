import { useState, useEffect, useRef } from 'react';
import { Users, GraduationCap, Heart, School, Clock, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MetricData {
  students_impacted: number;
  teachers_trained: number;
  girls_mentored: number;
  schools_taught: number;
  years_of_mentoring: number;
  years_of_experience: number;
}

// SVG progress ring
const ProgressRing = ({ progress, size = 80, stroke = 4 }: { progress: number; size?: number; stroke?: number }) => {
  const radius = (size - stroke * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--primary) / 0.12)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  );
};

const ImpactMetrics = () => {
  const defaultMetrics: MetricData = {
    students_impacted: 0,
    teachers_trained: 0,
    girls_mentored: 0,
    schools_taught: 0,
    years_of_mentoring: 0,
    years_of_experience: 0,
  };
  const [metrics, setMetrics] = useState<MetricData>(defaultMetrics);
  const [displayMetrics, setDisplayMetrics] = useState<MetricData>(defaultMetrics);
  const [isVisible, setIsVisible] = useState(false);
  const [ringProgress, setRingProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const { data } = await supabase.from('impact_metrics').select('*').single();
      if (data) setMetrics(data as unknown as MetricData);
    } catch (error) {
      console.error('Error loading impact metrics:', error);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    const counters = Object.keys(metrics) as Array<keyof MetricData>;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setRingProgress(Math.round(progress * 100));
      setDisplayMetrics(prev => {
        const updated = { ...prev };
        counters.forEach(key => { updated[key] = Math.floor(metrics[key] * progress); });
        return updated;
      });
      if (currentStep >= steps) {
        setDisplayMetrics(metrics);
        setRingProgress(100);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible, metrics]);

  const metricsConfig = [
    { key: 'students_impacted' as keyof MetricData, icon: Users, label: 'Students Impacted', maxPercent: 85 },
    { key: 'teachers_trained' as keyof MetricData, icon: GraduationCap, label: 'Teachers Trained', maxPercent: 70 },
    { key: 'girls_mentored' as keyof MetricData, icon: Heart, label: 'Girls Mentored', maxPercent: 90 },
    { key: 'schools_taught' as keyof MetricData, icon: School, label: 'Schools Taught', maxPercent: 75 },
    { key: 'years_of_mentoring' as keyof MetricData, icon: Clock, label: 'Years of Mentoring', maxPercent: 60 },
    { key: 'years_of_experience' as keyof MetricData, icon: Award, label: 'Years of Experience', maxPercent: 65 },
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 relative overflow-hidden">
      {/* Gradient separators */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-14">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">By The Numbers</p>
          <h2 className="section-heading text-2xl sm:text-3xl lg:text-5xl mb-3 sm:mb-4">
            Impact Chronicles
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
            Making a difference through education, mentorship, and innovation.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 max-w-6xl mx-auto">
          {metricsConfig.map((metric, i) => {
            const Icon = metric.icon;
            const animatedPercent = isVisible ? Math.round((metric.maxPercent * ringProgress) / 100) : 0;

            return (
              <div
                key={metric.key}
                className="glass-card p-4 sm:p-8 text-center hover-lift glow-border-hover group relative"
                style={{
                  animationDelay: `${i * 100}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms, box-shadow 0.3s ease, border-color 0.3s ease`
                }}
              >
                {/* SVG progress ring */}
                <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 mb-3 sm:mb-5">
                  <ProgressRing progress={animatedPercent} size={56} stroke={3} />
                  <div className="hidden sm:block absolute inset-0">
                    <ProgressRing progress={animatedPercent} size={80} stroke={4} />
                  </div>
                  <div className="relative z-10 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                    <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                </div>

                <div className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                  {displayMetrics[metric.key].toLocaleString()}+
                </div>
                <div className="text-muted-foreground font-medium text-xs sm:text-sm">
                  {metric.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ImpactMetrics;
