import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import portrait from '@/assets/portrait.jpg';
import { MapPin } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* About Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              <h1 className="section-heading text-3xl sm:text-4xl lg:text-5xl">ABOUT</h1>
              <a href="mailto:justiceansah@gmail.com" className="text-primary hover:underline font-medium text-sm sm:text-base">
                justiceansah@gmail.com
              </a>
              
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                STEM Educator and Robotics Engineer with expertise in educational technology, 
                robotics engineering, and innovative learning solutions. Passionate about empowering 
                the next generation through hands-on learning experiences and cutting-edge technology 
                implementations in STEM education.
              </p>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Accra, Ghana</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">East Legon, Greater Accra Region</p>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <img 
                src={portrait} 
                alt="Justice Ansah - STEM Educator & Robotics Engineer" 
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;