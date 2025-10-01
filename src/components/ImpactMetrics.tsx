import { useState, useEffect, useRef } from 'react';
import { Users, GraduationCap, Heart, School } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MetricData {
  students_impacted: number;
  teachers_trained: number;
  girls_mentored: number;
  schools_taught: number;
}

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
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMetrics();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('impact-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'impact_metrics'
        },
        () => {
          loadMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMetrics = async () => {
    try {
      const { data } = await supabase
        .from('impact_metrics')
        .select('*')
        .single();
      
      if (data) {
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error loading impact metrics:', error);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const counters = Object.keys(metrics) as Array<keyof MetricData>;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setDisplayMetrics(prev => {
        const updated = { ...prev };
        counters.forEach(key => {
          updated[key] = Math.floor(metrics[key] * progress);
        });
        return updated;
      });

      if (currentStep >= steps) {
        setDisplayMetrics(metrics);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible, metrics]);

  const metricsConfig = [
    {
      key: 'students_impacted' as keyof MetricData,
      icon: Users,
      label: 'Students Impacted',
      color: 'text-primary'
    },
    {
      key: 'teachers_trained' as keyof MetricData,
      icon: GraduationCap,
      label: 'Teachers Trained',
      color: 'text-primary'
    },
    {
      key: 'girls_mentored' as keyof MetricData,
      icon: Heart,
      label: 'Girls Mentored',
      color: 'text-primary'
    },
    {
      key: 'schools_taught' as keyof MetricData,
      icon: School,
      label: 'Schools Taught',
      color: 'text-primary'
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-4">
            Impact Metrics
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Making a difference through education and mentorship
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {metricsConfig.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.key}
                className="glass-card p-8 text-center hover-lift group"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 ${metric.color} mb-4 transition-transform group-hover:scale-110`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {displayMetrics[metric.key].toLocaleString()}+
                </div>
                <div className="text-muted-foreground font-medium">
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
