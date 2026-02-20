import { useState, useEffect, useRef } from 'react';
import { Users, GraduationCap, Heart, School } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MetricData {
  students_impacted: number;
  teachers_trained: number;
  girls_mentored: number;
  schools_taught: number;
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
  const [metrics, setMetrics] = useState<MetricData>({
    students_impacted: 0,
    teachers_trained: 0,
    girls_mentored: 0,
    schools_taught: 0
  });
  const [displayMetrics, setDisplayMetrics] = useState<MetricData>({
    students_impacted: 0,
    teachers_trained: 0,
    girls_mentored: 0,
    schools_taught: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [ringProgress, setRingProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMetrics();
    const channel = supabase
      .channel('impact-metrics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'impact_metrics' }, () => {
        loadMetrics();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadMetrics = async () => {
    try {
      const { data } = await supabase.from('impact_metrics').select('*').single();
      if (data) setMetrics(data);
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
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 relative overflow-hidden">
      {/* Gradient separators */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">By The Numbers</p>
          <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-4">
            Impact Chronicles
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Making a difference through education, mentorship, and innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {metricsConfig.map((metric, i) => {
            const Icon = metric.icon;
            const animatedPercent = isVisible ? Math.round((metric.maxPercent * ringProgress) / 100) : 0;

            return (
              <div
                key={metric.key}
                className="glass-card p-8 text-center hover-lift glow-border-hover group relative"
                style={{
                  animationDelay: `${i * 100}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms, box-shadow 0.3s ease, border-color 0.3s ease`
                }}
              >
                {/* SVG progress ring */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
                  <ProgressRing progress={animatedPercent} size={80} stroke={4} />
                  <div className="relative z-10 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="text-4xl font-black mb-2 bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                  {displayMetrics[metric.key].toLocaleString()}+
                </div>
                <div className="text-muted-foreground font-medium text-sm">
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
