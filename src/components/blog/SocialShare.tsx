import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Share2, Twitter, Linkedin, MessageCircle, Link, Check } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url: string;
  excerpt?: string;
}

export const SocialShare = ({ title, url, excerpt }: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = `${window.location.origin}${url}`;
  const shareText = excerpt || title;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The blog post link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className="border-primary/20 hover:border-primary hover:bg-primary/10"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-surface border border-primary/20 rounded-lg shadow-xl p-3 z-10 min-w-[200px]">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start hover:bg-primary/10"
              onClick={() => handleShare('twitter')}
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter/X
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start hover:bg-primary/10"
              onClick={() => handleShare('linkedin')}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start hover:bg-primary/10"
              onClick={() => handleShare('whatsapp')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start hover:bg-primary/10"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};