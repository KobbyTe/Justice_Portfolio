import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRateLimit } from '@/hooks/useRateLimit';
import { toast } from 'sonner';
import { CheckCircle, AlertTriangle, Loader2, Send } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

type TokenStatus = 'loading' | 'valid' | 'expired' | 'used' | 'not_found';

const SubmitRecommendation = () => {
  const { token } = useParams<{ token: string }>();
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('loading');
  const [tokenData, setTokenData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { checkRateLimit } = useRateLimit(10000, 3, 60000);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setTokenStatus('not_found');
      return;
    }

    const { data, error } = await supabase
      .from('recommendation_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error || !data) {
      setTokenStatus('not_found');
      return;
    }

    if (data.is_used) {
      setTokenStatus('used');
      return;
    }

    if (new Date(data.expires_at) < new Date()) {
      setTokenStatus('expired');
      return;
    }

    setTokenData(data);
    setTokenStatus('valid');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const { allowed, message } = checkRateLimit();
    if (!allowed) {
      toast.error(message);
      return;
    }

    if (isSubmitting || !tokenData) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string)?.trim();
    const position = (formData.get('position') as string)?.trim() || null;
    const company = (formData.get('company') as string)?.trim() || null;
    const message_text = (formData.get('message') as string)?.trim();
    const linkedin_url = (formData.get('linkedin_url') as string)?.trim() || null;
    const twitter_url = (formData.get('twitter_url') as string)?.trim() || null;
    const image = formData.get('image') as File;

    if (!name || !message_text) {
      toast.error('Name and message are required');
      setIsSubmitting(false);
      return;
    }

    try {
      let recommender_image_url = null;
      if (image && image.size > 0) {
        const fileExt = image.name.split('.').pop();
        const fileName = `recommendations/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('portfolio-assets')
          .upload(fileName, image, { upsert: false });

        if (uploadError) throw new Error('Failed to upload photo');

        const { data: urlData } = supabase.storage
          .from('portfolio-assets')
          .getPublicUrl(fileName);
        recommender_image_url = urlData.publicUrl;
      }

      // Insert recommendation as inactive (pending approval)
      const { error: insertError } = await supabase
        .from('recommendations')
        .insert([{
          name,
          position,
          company,
          message: message_text,
          linkedin_url,
          twitter_url,
          recommender_image_url,
          is_active: false,
          sort_order: 0,
        }]);

      if (insertError) throw insertError;

      // Mark token as used
      const { error: updateError } = await supabase
        .from('recommendation_tokens')
        .update({ is_used: true })
        .eq('id', tokenData.id);

      if (updateError) console.error('Failed to mark token as used:', updateError);

      setSubmitted(true);
    } catch (error) {
      toast.error('Failed to submit recommendation. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (tokenStatus === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Validating your link...</p>
        </div>
      );
    }

    if (tokenStatus === 'not_found') {
      return (
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center py-12">
            <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
            <p className="text-muted-foreground text-center">This recommendation link is not valid. Please check the URL or contact the person who sent it.</p>
          </CardContent>
        </Card>
      );
    }

    if (tokenStatus === 'used') {
      return (
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Already Submitted</h2>
            <p className="text-muted-foreground text-center">A recommendation has already been submitted using this link. Thank you!</p>
          </CardContent>
        </Card>
      );
    }

    if (tokenStatus === 'expired') {
      return (
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center py-12">
            <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link Expired</h2>
            <p className="text-muted-foreground text-center">This recommendation link has expired. Please request a new one.</p>
          </CardContent>
        </Card>
      );
    }

    if (submitted) {
      return (
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground text-center">Your recommendation has been submitted successfully. It will appear on the site once approved.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Submit Your Recommendation</CardTitle>
          <CardDescription>
            Hi {tokenData?.recommender_name}! Please share your recommendation below. It will be reviewed before being published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name *</label>
              <Input
                name="name"
                defaultValue={tokenData?.recommender_name || ''}
                placeholder="Your full name"
                maxLength={100}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Position / Title</label>
                <Input name="position" placeholder="e.g. CEO, Teacher" maxLength={100} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company / Organization</label>
                <Input name="company" placeholder="e.g. Google, MIT" maxLength={100} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Recommendation *</label>
              <Textarea
                name="message"
                placeholder="Share your experience working with or knowing this person..."
                rows={5}
                maxLength={2000}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                <Input name="linkedin_url" placeholder="https://linkedin.com/in/..." type="url" maxLength={500} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Twitter / X URL</label>
                <Input name="twitter_url" placeholder="https://x.com/..." type="url" maxLength={500} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Photo (optional)</label>
              <Input type="file" name="image" accept="image/*" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Submit Recommendation</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <SEO title="Submit Recommendation" description="Submit your recommendation and testimonial." />
      <Navigation />
      <div className="min-h-screen bg-background pt-24 pb-16 px-4">
        {renderContent()}
      </div>
      <Footer />
    </>
  );
};

export default SubmitRecommendation;
