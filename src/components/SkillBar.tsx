import { useEffect, useRef, useState } from 'react';

interface SkillBarProps {
  skill: string;
  percentage: number;
  delay?: number;
}

const SkillBar = ({ skill, percentage, delay = 0 }: SkillBarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => {
            setAnimatedPercentage(percentage);
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [percentage, delay]);

  return (
    <div ref={ref} className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-foreground">{skill}</h4>
        <span className="text-sm text-muted-foreground">{percentage}%</span>
      </div>
      <div className="skill-bar">
        <div 
          className="skill-progress"
          style={{ 
            width: isVisible ? `${animatedPercentage}%` : '0%',
            transitionDelay: `${delay}ms`
          }}
        />
      </div>
    </div>
  );
};

export default SkillBar;