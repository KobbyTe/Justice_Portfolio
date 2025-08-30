import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SkillBar from '@/components/SkillBar';
import TechStack from '@/components/TechStack';
import { Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Resume = () => {
  const [resumeFile, setResumeFile] = useState(null);
  
  const skills = [
    { name: 'Python', percentage: 95 },
    { name: 'JavaScript', percentage: 90 },
    { name: 'C++', percentage: 85 },
    { name: 'Java', percentage: 80 },
    { name: 'Arduino Programming', percentage: 88 },
    { name: 'Robotics Engineering', percentage: 92 },
  ];

  useEffect(() => {
    loadResumeFile();
  }, []);

  const loadResumeFile = async () => {
    try {
      const { data } = await supabase
        .from('resume_files')
        .select('*')
        .eq('is_current', true)
        .single();
      setResumeFile(data);
    } catch (error) {
      console.error('Error loading resume file:', error);
    }
  };

  const handleDownload = () => {
    if (resumeFile?.file_url) {
      window.open(resumeFile.file_url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Resume Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="section-heading text-center mb-12 sm:mb-16 text-3xl sm:text-4xl lg:text-5xl">RÉSUMÉ</h1>
          
          <div className="grid lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Education & Experience */}
            <div className="lg:col-span-2 space-y-8 sm:space-y-12">
              {/* Education */}
              <div>
                <h2 className="text-xl font-heading font-semibold mb-6 text-primary">🎓 Education</h2>
                <Card className="glass-card">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-lg">Aggrey Memorial A.M.E. Zion SHS</h3>
                    <p className="text-primary font-medium">General Science with ICT</p>
                    <p className="text-sm text-muted-foreground">2021 – 2023</p>
                  </CardContent>
                </Card>
              </div>

              {/* Experience */}
              <div>
                <h2 className="text-xl font-heading font-semibold mb-6 text-primary">💼 Experience</h2>
                <div className="space-y-4 sm:space-y-6">
                  <Card className="glass-card">
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="font-semibold text-lg">STEM Instructor & Jr. Robotics Engineer</h3>
                      <p className="text-primary font-medium">Inovtech STEM Center</p>
                      <p className="text-sm text-muted-foreground mb-3">February 2025 – Present</p>
                      <p className="text-sm text-muted-foreground">
                        Facilitated hands-on robotics workshops using LEGO® Mindstorms, Arduino, and Avishkaar platforms.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="font-semibold text-lg">Girl Mentor</h3>
                      <p className="text-primary font-medium">Technovation</p>
                      <p className="text-sm text-muted-foreground mb-3">2025 – Present</p>
                      <p className="text-sm text-muted-foreground">
                        Empowered students to identify and solve global issues through innovative technology solutions.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="font-semibold text-lg">Intern</h3>
                      <p className="text-primary font-medium">Academic City University MakeUp Lab</p>
                      <p className="text-sm text-muted-foreground mb-3">August 2024 – November 2024</p>
                      <p className="text-sm text-muted-foreground">
                        Assisted in developing sustainable technology tools including plastic shredder and 3D filament extruder.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-heading font-semibold mb-6 text-primary">🛠️ Programming Skills</h2>
                <Card className="glass-card">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {skills.map((skill, index) => (
                        <SkillBar 
                          key={skill.name}
                          skill={skill.name}
                          percentage={skill.percentage}
                          delay={index * 100}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleDownload}
                  disabled={!resumeFile}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {resumeFile ? `Download ${resumeFile.file_name}` : 'No Resume Available'}
                </Button>
              </div>
            </div>
          </div>

          {/* Tech Stack Section */}
          <div className="mt-12 sm:mt-16">
            <h2 className="text-2xl sm:text-3xl font-heading font-semibold mb-8 text-center text-primary">🔧 Tech Stack</h2>
            <TechStack />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resume;