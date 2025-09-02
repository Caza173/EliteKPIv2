import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  Crown, 
  Medal, 
  Sparkles, 
  X,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category: 'sales' | 'activity' | 'time' | 'streak' | 'milestone';
  points: number;
  icon?: any;
}

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

const tierColors = {
  bronze: "from-orange-400 to-orange-600",
  silver: "from-gray-300 to-gray-500", 
  gold: "from-blue-400 to-blue-600",
  platinum: "from-purple-400 to-purple-600",
  diamond: "from-blue-400 to-cyan-400"
};

const tierIcons = {
  bronze: Medal,
  silver: Star,
  gold: Trophy,
  platinum: Crown,
  diamond: Sparkles
};

// Confetti component
function ConfettiPiece({ delay, color }: { delay: number; color: string }) {
  return (
    <div
      className={`absolute w-2 h-2 ${color} rounded-full animate-pulse`}
      style={{
        animationDelay: `${delay}s`,
        transform: `translateY(${Math.random() * 100}px) rotate(${Math.random() * 360}deg)`
      }}
    />
  );
}

// Sparkle effect
function SparkleEffect() {
  const sparkles = Array.from({ length: 12 }, (_, i) => (
    <div
      key={i}
      className="absolute w-1 h-1 bg-blue-400 rounded-full animate-ping"
      style={{
        animationDelay: `${i * 0.1}s`,
        left: `${50 + Math.cos((i * 30) * Math.PI / 180) * 40}%`,
        top: `${50 + Math.sin((i * 30) * Math.PI / 180) * 40}%`
      }}
    />
  ));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparkles}
    </div>
  );
}

export default function AchievementCelebration({ achievement, isOpen, onClose }: AchievementCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (isOpen && achievement) {
      setShowConfetti(true);
      setShowSparkles(true);
      
      // Auto-hide confetti after animation
      const confettiTimer = setTimeout(() => setShowConfetti(false), 4000);
      const sparkleTimer = setTimeout(() => setShowSparkles(false), 2000);
      
      return () => {
        clearTimeout(confettiTimer);
        clearTimeout(sparkleTimer);
      };
    }
  }, [isOpen, achievement]);

  if (!achievement) return null;

  const TierIcon = tierIcons[achievement.tier];
  const tierGradient = tierColors[achievement.tier];

  const confettiColors = [
    "bg-red-400", "bg-blue-400", "bg-green-400", "bg-cyan-400", 
    "bg-purple-400", "bg-pink-400", "bg-indigo-400", "bg-orange-400"
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 30 }, (_, i) => (
                <ConfettiPiece 
                  key={i} 
                  delay={i * 0.05} 
                  color={confettiColors[i % confettiColors.length]}
                />
              ))}
            </div>
          )}

          {/* Main celebration modal */}
          <div className="relative max-w-md w-full animate-in zoom-in-95 duration-500">
            {/* Sparkle effect */}
            {showSparkles && <SparkleEffect />}
            
            <Card className={cn(
              "relative overflow-hidden border-2",
              "bg-gradient-to-br", tierGradient,
              "shadow-2xl animate-pulse"
            )}>
              {/* Celebration header */}
              <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-white/30 via-transparent to-white/30 animate-pulse" />
              
              <CardContent className="p-8 text-center relative z-10">
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="absolute top-2 right-2 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Achievement unlocked text */}
                <div className="mb-4 animate-in slide-in-from-top duration-300">
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-bold bg-white/90 text-gray-800 mb-2"
                  >
                    🎉 ACHIEVEMENT UNLOCKED!
                  </Badge>
                </div>

                {/* Achievement icon */}
                <div className="mb-6 relative animate-in zoom-in duration-500">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center animate-pulse shadow-lg">
                      <TierIcon className="h-12 w-12 text-white" />
                    </div>
                    
                    {/* Tier badge */}
                    <Badge 
                      className={cn(
                        "absolute -bottom-2 -right-2 capitalize text-xs font-bold",
                        "bg-white text-gray-800"
                      )}
                    >
                      {achievement.tier}
                    </Badge>
                  </div>
                </div>

                {/* Achievement details */}
                <div className="space-y-3 text-white animate-in slide-in-from-bottom duration-500">
                  <h2 className="text-2xl font-bold">{achievement.title}</h2>
                  <p className="text-white/90 text-sm">{achievement.description}</p>
                  
                  {/* Points awarded */}
                  <div className="flex items-center justify-center gap-2 mt-4 animate-bounce">
                    <Star className="h-5 w-5 text-blue-300" />
                    <span className="text-lg font-bold">+{achievement.points} points</span>
                  </div>
                </div>

                {/* Celebration button */}
                <div className="mt-8 animate-in slide-in-from-bottom duration-700">
                  <Button
                    onClick={onClose}
                    className="bg-white text-gray-800 hover:bg-white/90 font-bold px-8 py-2"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Awesome!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}