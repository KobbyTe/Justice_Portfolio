import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Send } from 'lucide-react';

const Wall = () => {
  const [wallMessage, setWallMessage] = useState({ name: '', message: '' });
  const [wallEntries, setWallEntries] = useState([
    { id: 1, name: 'Elon', message: 'working on your o-1', timestamp: '2 days ago' },
    { id: 2, name: 'CyberCultist', message: "I'm f*cking cloning this", timestamp: '1 week ago' },
    { id: 3, name: 'Kalculus Guy', message: 'Nice one 👌. My Gat parked beside the road 😌😌', timestamp: '2 weeks ago' },
    { id: 4, name: 'Kelvin', message: 'Boss Justice, you do all 😭', timestamp: '1 month ago' },
  ]);

  const handleWallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wallMessage.name && wallMessage.message) {
      const newEntry = {
        id: Date.now(),
        ...wallMessage,
        timestamp: 'Just now'
      };
      setWallEntries([newEntry, ...wallEntries]);
      setWallMessage({ name: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Wall Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="section-heading text-center mb-8 sm:mb-12 text-3xl sm:text-4xl lg:text-5xl">💬 Sign On My Wall</h1>
          
          <div className="max-w-4xl mx-auto">
            {/* Wall Form */}
            <Card className="glass-card mb-8 sm:mb-12">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleWallSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid gap-4 sm:gap-6">
                    <Input
                      placeholder="Your name"
                      value={wallMessage.name}
                      onChange={(e) => setWallMessage({ ...wallMessage, name: e.target.value })}
                      className="bg-background/50"
                    />
                    <Textarea
                      placeholder="Leave a message..."
                      value={wallMessage.message}
                      onChange={(e) => setWallMessage({ ...wallMessage, message: e.target.value })}
                      className="bg-background/50 min-h-[100px]"
                    />
                    <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                      <Send className="w-4 h-4 mr-2" />
                      Sign On My Wall
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Wall Entries */}
            <div className="grid gap-4 sm:gap-6">
              {wallEntries.map((entry) => (
                <Card key={entry.id} className="glass-card">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-1 sm:space-y-0">
                      <h3 className="font-semibold">@{entry.name}</h3>
                      <span className="text-sm text-muted-foreground">{entry.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base">{entry.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Wall;