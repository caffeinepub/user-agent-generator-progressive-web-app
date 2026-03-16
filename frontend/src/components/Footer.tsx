import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p className="flex items-center justify-center gap-1.5 flex-wrap">
            © 2025. Built with{' '}
            <Heart className="h-4 w-4 text-red-500 fill-red-500 inline-block" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs">
            Credits 114 baranor opaiy
          </p>
        </div>
      </div>
    </footer>
  );
}
