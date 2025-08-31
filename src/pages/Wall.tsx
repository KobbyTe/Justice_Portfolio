import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Send } from 'lucide-react';

interface WallEntry {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

const Wall = () => {
  const [wallMessage, setWallMessage] = useState({
    name: '',
    message: ''
  });
  const [wallEntries, setWallEntries] = useState<WallEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWallMessages();
  }, []);

  const loadWallMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('wall_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWallEntries(data || []);
    } catch (error) {
      console.error('Error loading wall messages:', error);
    }
  };

  const handleWallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallMessage.name || !wallMessage.message) {
      toast({
        title: "Error",
        description: "Please fill in both name and message fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('wall_messages')
        .insert([{
          name: wallMessage.name,
          message: wallMessage.message
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your message has been added to the wall!"
      });

      setWallMessage({ name: '', message: '' });
      loadWallMessages(); // Reload messages
    } catch (error) {
      console.error('Error submitting message:', error);
      toast({
        title: "Error",
        description: "Failed to submit your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                      disabled={isSubmitting}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Signing..." : "Sign On My Wall"}
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
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base">{entry.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {wallEntries.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No messages yet. Be the first to sign the wall!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Wall;