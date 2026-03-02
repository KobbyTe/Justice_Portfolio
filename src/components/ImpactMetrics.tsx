import { useState, useEffect, useRef } from 'react';
import { Users, GraduationCap, Heart, School, Clock, Award } from 'lucide-react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface MetricData {
  students_impacted: number;
  teachers_trained: number;
  girls_mentored: number;
  schools_taught: number;
  years_of_mentoring: number;
  years_of_experience: number;
}

// Animated counter component
const AnimatedNumber = ({ value, isInView }: { value: number; isInView: boolean }) => {
  const spring = useSpring(0, { stiffness: 50, damping: 20, duration: 2.5 });
  const display = useTransform(spring, (v) => Math.floor(v).toLocaleString());

  useEffect(() => {
    if (isInView) spring.set(value);
  }, [isInView, value, spring]);

  return <motion.span>{display}</motion.span>;
};

// Animated circular progress
const CircularProgress = ({ progress, isInView }: { progress: number; isInView: boolean }) => {
  const size = 72;
  const stroke = 3;
  const radius = (size - stroke * 2) / 2;
  const circumference = radius * 2 * Math.PI;

  const spring = useSpring(0, { stiffness: 30, damping: 15, duration: 2.5 });
  const strokeOffset = useTransform(spring, (v) => circumference - (v / 100) * circumference);

  useEffect(() => {
    if (isInView) spring.set(progress);
  }, [isInView, progress, spring]);

  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--primary) / 0.08)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        style={{ strokeDashoffset: strokeOffset }}
        strokeLinecap="round"
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const { data } = await supabase.from('impact_metrics').select('*').single();
        if (data) setMetrics(data as unknown as MetricData);
      } catch (error) {
        console.error('Error loading impact metrics:', error);
      }
    };
    loadMetrics();
  }, []);

  const metricsConfig = [
    { key: 'students_impacted' as keyof MetricData, icon: Users, label: 'Students Impacted', ringPercent: 85 },
    { key: 'teachers_trained' as keyof MetricData, icon: GraduationCap, label: 'Teachers Trained', ringPercent: 70 },
    { key: 'girls_mentored' as keyof MetricData, icon: Heart, label: 'Girls Mentored', ringPercent: 90 },
    { key: 'schools_taught' as keyof MetricData, icon: School, label: 'Schools Taught', ringPercent: 75 },
    { key: 'years_of_mentoring' as keyof MetricData, icon: Clock, label: 'Years of Mentoring', ringPercent: 60 },
    { key: 'years_of_experience' as keyof MetricData, icon: Award, label: 'Years of Experience', ringPercent: 65 },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 80, damping: 18 },
    },
  };

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 relative overflow-hidden">
      {/* Subtle top/bottom dividers */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-block text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5">
            By The Numbers
          </span>
          <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
            Impact Chronicles
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Making a difference through education, mentorship, and innovation.
          </p>
        </motion.div>

        {/* Metrics grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {metricsConfig.map((metric) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.key}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="group relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 sm:p-6 text-center transition-colors duration-300 hover:border-primary/40 hover:bg-card/80"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-primary/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Icon with ring */}
                <div className="relative inline-flex items-center justify-center w-[72px] h-[72px] mb-4 mx-auto">
                  <CircularProgress progress={metric.ringPercent} isInView={isInView} />
                  <div className="relative z-10 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110">
                    <Icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                </div>

                {/* Value */}
                <div className="text-2xl sm:text-3xl font-black mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  <AnimatedNumber value={metrics[metric.key]} isInView={isInView} />
                  <span className="text-primary/80">+</span>
                </div>

                {/* Label */}
                <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-tight">
                  {metric.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ImpactMetrics;
