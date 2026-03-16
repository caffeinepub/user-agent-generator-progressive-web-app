import { useState, useEffect } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Header() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success('অ্যাপ ইনস্টল হচ্ছে...');
    } else {
      toast.info('অ্যাপ ইনস্টল বাতিল করা হয়েছে');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                ইউজার-এজেন্ট জেনারেটর
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                যেকোনো ডিভাইস এবং দেশের জন্য রিয়েলিস্টিক ইউজার-এজেন্ট তৈরি করুন
              </p>
            </div>
          </div>
          {isInstallable && (
            <Button
              onClick={handleInstallClick}
              variant="default"
              size="sm"
              className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">অ্যাপ ইনস্টল করুন</span>
              <span className="sm:hidden">ইনস্টল</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
