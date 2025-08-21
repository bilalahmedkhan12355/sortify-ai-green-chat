import { useEffect, useState } from "react";

interface IntroScreenProps {
  onComplete: () => void;
}

const IntroScreen = ({ onComplete }: IntroScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-subtle flex items-center justify-center z-50">
      <div className="text-center space-y-8 animate-fade-in-up">
        {/* Animated Recycling Symbol */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto mb-6">
            <svg
              className="w-full h-full text-primary animate-recycling-spin"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.562 12.331c1.005-.641 1.228-2.001.587-3.006a2.244 2.244 0 0 0-3.006-.587l-1.244.795c-.461.294-.96.442-1.457.442h-4.035l1.825-2.738a2.244 2.244 0 0 0-.587-3.006c-1.005-.641-2.365-.418-3.006.587l-2.562 3.843c-.294.461-.442.96-.442 1.457v4.035l-2.738-1.825c-1.005-.641-2.365-.418-3.006.587-.641 1.005-.418 2.365.587 3.006l3.843 2.562c.461.294.96.442 1.457.442h4.035l1.825 2.738c.641 1.005 2.001 1.228 3.006.587 1.005-.641 1.228-2.001.587-3.006l-2.562-3.843c-.294-.461-.442-.96-.442-1.457v-4.035l2.738 1.825z"/>
            </svg>
          </div>
          
          {/* Pulsing Ring */}
          <div className="absolute inset-0 w-32 h-32 mx-auto -mt-4 border-4 border-primary/30 rounded-full animate-pulse-eco"></div>
        </div>

        {/* Logo and Text */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-eco bg-clip-text text-transparent">
            Sortify.io
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Your AI-powered recycling assistant for a sustainable future
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-eco transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Loading {progress}%
          </p>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-4 h-4 text-primary/20 animate-pulse-eco`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              ♻️
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;