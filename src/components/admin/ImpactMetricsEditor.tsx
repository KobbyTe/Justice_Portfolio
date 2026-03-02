import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Users, GraduationCap, Heart, School, Clock, Award } from 'lucide-react';

interface MetricData {
  id?: string;
  students_impacted: number;
  teachers_trained: number;
  girls_mentored: number;
  schools_taught: number;
  years_of_mentoring: number;
  years_of_experience: number;
}

const ImpactMetricsEditor = () => {
  const [metrics, setMetrics] = useState<MetricData>({
    students_impacted: 0,
    teachers_trained: 0,
    girls_mentored: 0,
    schools_taught: 0,
    years_of_mentoring: 0,
    years_of_experience: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('impact_metrics')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setMetrics(data as unknown as MetricData);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast.error('Failed to load impact metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData = {
        students_impacted: metrics.students_impacted,
        teachers_trained: metrics.teachers_trained,
        girls_mentored: metrics.girls_mentored,
        schools_taught: metrics.schools_taught,
        years_of_mentoring: metrics.years_of_mentoring,
        years_of_experience: metrics.years_of_experience,
        updated_at: new Date().toISOString()
      };

      if (metrics.id) {
        const { error } = await supabase
          .from('impact_metrics')
          .update(updateData as any)
          .eq('id', metrics.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('impact_metrics')
          .insert([updateData] as any);
        if (error) throw error;
      }

      toast.success('Impact metrics updated successfully');
      loadMetrics();
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast.error('Failed to save impact metrics');
    }
  };

  const handleInputChange = (key: keyof MetricData, value: string) => {
    const numValue = parseInt(value) || 0;
    setMetrics(prev => ({ ...prev, [key]: numValue }));
  };

  const metricsConfig = [
    { key: 'students_impacted' as keyof MetricData, icon: Users, label: 'Students Impacted', description: 'Total number of students reached through programs' },
    { key: 'teachers_trained' as keyof MetricData, icon: GraduationCap, label: 'Teachers Trained', description: 'Number of teachers trained in STEM education' },
    { key: 'girls_mentored' as keyof MetricData, icon: Heart, label: 'Girls Mentored', description: 'Girls mentored in STEM fields' },
    { key: 'schools_taught' as keyof MetricData, icon: School, label: 'Schools Taught', description: 'Number of schools where programs were conducted' },
    { key: 'years_of_mentoring' as keyof MetricData, icon: Clock, label: 'Years of Mentoring', description: 'Total years spent mentoring students' },
    { key: 'years_of_experience' as keyof MetricData, icon: Award, label: 'Years of Experience', description: 'Total years of professional experience' },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Metrics Management</CardTitle>
        <p className="text-sm text-muted-foreground">
          Update the impact metrics displayed on the homepage. Changes will appear immediately.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metricsConfig.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.key} className="space-y-2">
                  <Label htmlFor={metric.key} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    {metric.label}
                  </Label>
                  <Input
                    id={metric.key}
                    type="number"
                    min="0"
                    value={metrics[metric.key]}
                    onChange={(e) => handleInputChange(metric.key, e.target.value)}
                    placeholder="0"
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ImpactMetricsEditor;
