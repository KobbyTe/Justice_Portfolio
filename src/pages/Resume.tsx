import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TechStack from '@/components/TechStack';
import { Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Resume = () => {
  const [resumeFile, setResumeFile] = useState(null);

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
          
          {/* Main Content */}
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Education Section */}
            <div>
              <h2 className="text-2xl font-heading font-semibold mb-8 text-primary flex items-center gap-3">
                🎓 Education
              </h2>
              <Card className="glass-card hover-lift">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-2">Aggrey Memorial A.M.E. Zion SHS</h3>
                  <p className="text-primary font-semibold text-lg mb-1">General Science with ICT</p>
                  <p className="text-muted-foreground">2021 – 2023</p>
                </CardContent>
              </Card>
            </div>

            {/* Experience Section */}
            <div>
              <h2 className="text-2xl font-heading font-semibold mb-8 text-primary flex items-center gap-3">
                💼 Experience
              </h2>
              <div className="space-y-6">
                <Card className="glass-card hover-lift">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2">STEM Instructor & Jr. Robotics Engineer</h3>
                    <p className="text-primary font-semibold text-lg mb-1">Inovtech STEM Center</p>
                    <p className="text-muted-foreground text-sm mb-4">February 2025 – Present</p>
                    <p className="text-foreground leading-relaxed">
                      Facilitated hands-on robotics workshops using LEGO® Mindstorms, Arduino, and Avishkaar platforms.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card hover-lift">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2">Girl Mentor</h3>
                    <p className="text-primary font-semibold text-lg mb-1">Technovation</p>
                    <p className="text-muted-foreground text-sm mb-4">2025 – Present</p>
                    <p className="text-foreground leading-relaxed">
                      Empowered students to identify and solve global issues through innovative technology solutions.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card hover-lift">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2">Intern</h3>
                    <p className="text-primary font-semibold text-lg mb-1">Academic City University MakeUp Lab</p>
                    <p className="text-muted-foreground text-sm mb-4">August 2024 – November 2024</p>
                    <p className="text-foreground leading-relaxed">
                      Assisted in developing sustainable technology tools including plastic shredder and 3D filament extruder.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Download Section */}
            <div className="flex justify-center">
              <Card className="glass-card w-full max-w-md">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 text-center">Download Resume</h3>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
                    onClick={handleDownload}
                    disabled={!resumeFile}
                  >
                    <Download className="w-5 h-5 mr-3" />
                    {resumeFile ? `Download ${resumeFile.file_name}` : 'No Resume Available'}
                  </Button>
                </CardContent>
              </Card>
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