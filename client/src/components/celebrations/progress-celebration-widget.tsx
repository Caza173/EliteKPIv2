import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  Medal,
  Sparkles,
  Zap,
  Crown,
  Gift
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ProgressData {
  id: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  previousValue?: number;
  category: 'revenue' | 'sales' | 'activity' | 'streak' | 'goal';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  icon?: string;
  unit?: string;
  celebrateThreshold?: number;
}

interface ProgressCelebrationWidgetProps {
  progress: ProgressData;
  showAnimation?: boolean;
  onCelebrationComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
}

const tierColors = {
  bronze: { 
    gradient: 'from-orange-400 to-orange-600', 
    bg: 'bg-orange-50', 
    text: 'text-orange-700',
    border: 'border-orange-200'
  },
  silver: { 
    gradient: 'from-gray-400 to-gray-600', 
    bg: 'bg-gray-50', 
    text: 'text-gray-700',
    border: 'border-gray-200'
  },
  gold: { 
    gradient: 'from-blue-400 to-blue-600', 
    bg: 'bg-blue-50', 
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  platinum: { 
    gradient: 'from-purple-400 to-purple-600', 
    bg: 'bg-purple-50', 
    text: 'text-purple-700',
    border: 'border-purple-200'
  },
  diamond: { 
    gradient: 'from-blue-400 to-cyan-400', 
    bg: 'bg-blue-50', 
    text: 'text-blue-700',
    border: 'border-blue-200'
  }
};

const categoryIcons = {
  revenue: Trophy,
  sales: Target,
  activity: Zap,
  streak: Star,
  goal: Award
};

const FloatingParticle = ({ delay, color, size = 'w-2 h-2' }: { delay: number; color: string; size?: string }) => (
  <motion.div
    className={`absolute ${size} ${color} rounded-full`}
    initial={{ 
      opacity: 0,
      scale: 0,
      x: Math.random() * 200 - 100,
      y: 50
    }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1, 0.5],
      y: [-50, -100, -150],
      x: Math.random() * 100 - 50
    }}
    transition={{
      duration: 2,
      delay,
      ease: "easeOut"
    }}
  />
);

const CelebrationParticles = ({ isActive, tierColor }: { isActive: boolean; tierColor: string }) => {
  if (!isActive) return null;

  const particles = Array.from({ length: 15 }, (_, i) => (
    <FloatingParticle 
      key={i} 
      delay={i * 0.1} 
      color={tierColor === 'gold' ? 'bg-blue-400' : 
             tierColor === 'silver' ? 'bg-gray-300' :
             tierColor === 'bronze' ? 'bg-orange-400' :
             tierColor === 'platinum' ? 'bg-purple-400' : 'bg-blue-400'}
      size={Math.random() > 0.5 ? 'w-3 h-3' : 'w-2 h-2'}
    />
  ));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles}
    </div>
  );
};

const AnimatedCounter = ({ 
  value, 
  previousValue = 0, 
  unit = '', 
  duration = 1500 
}: { 
  value: number; 
  previousValue?: number; 
  unit?: string;
  duration?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(previousValue);
  
  useEffect(() => {
    const startTime = Date.now();
    const startValue = previousValue;
    const endValue = value;
    const difference = endValue - startValue;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (difference * easeOut);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        setDisplayValue(endValue);
      }
    };

    updateValue();
  }, [value, previousValue, duration]);

  const formatValue = (val: number) => {
    if (unit === '$') {
      return `$${Math.round(val).toLocaleString()}`;
    } else if (unit === '%') {
      return `${Math.round(val * 10) / 10}%`;
    }
    return Math.round(val).toString();
  };

  return (
    <span className="font-bold tabular-nums">
      {formatValue(displayValue)}
      {unit && unit !== '$' && unit !== '%' && ` ${unit}`}
    </span>
  );
};

export default function ProgressCelebrationWidget({
  progress,
  showAnimation = false,
  onCelebrationComplete,
  size = 'medium',
  interactive = true
}: ProgressCelebrationWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [celebrationTriggered, setCelebrationTriggered] = useState(false);

  const percentage = Math.min((progress.currentValue / progress.targetValue) * 100, 100);
  const previousPercentage = progress.previousValue ? 
    Math.min((progress.previousValue / progress.targetValue) * 100, 100) : 0;
  
  const tierConfig = tierColors[progress.tier];
  const CategoryIcon = categoryIcons[progress.category];
  
  // Check if we should trigger celebration
  const shouldCelebrate = progress.celebrateThreshold && 
    progress.currentValue >= progress.celebrateThreshold && 
    (progress.previousValue || 0) < progress.celebrateThreshold;

  useEffect(() => {
    if (shouldCelebrate && !celebrationTriggered) {
      setShowParticles(true);
      setCelebrationTriggered(true);
      
      setTimeout(() => {
        setShowParticles(false);
        onCelebrationComplete?.();
      }, 3000);
    }
  }, [shouldCelebrate, celebrationTriggered, onCelebrationComplete]);

  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const iconSizes = {
    small: 'h-5 w-5',
    medium: 'h-6 w-6', 
    large: 'h-8 w-8'
  };

  return (
    <motion.div
      layout
      initial={showAnimation ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={interactive ? { scale: 1.02, y: -2 } : {}}
      transition={{ duration: 0.3 }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`progress-widget-${progress.id}`}
    >
      <Card className={`relative overflow-hidden transition-all duration-300 ${
        isHovered ? `shadow-lg ${tierConfig.border} border-2` : 'shadow-sm border'
      } ${tierConfig.bg}`}>
        <CardContent className={sizeClasses[size]}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${tierConfig.gradient}`}>
                <CategoryIcon className={`${iconSizes[size]} text-white`} />
              </div>
              <div>
                <h4 className={`font-semibold ${size === 'small' ? 'text-sm' : 'text-base'}`}>
                  {progress.title}
                </h4>
                <p className={`text-gray-600 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                  {progress.description}
                </p>
              </div>
            </div>
            <Badge className={tierConfig.text} variant="outline">
              {progress.tier}
            </Badge>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`${size === 'small' ? 'text-lg' : size === 'medium' ? 'text-xl' : 'text-2xl'} font-bold ${tierConfig.text}`}>
                <AnimatedCounter 
                  value={progress.currentValue}
                  previousValue={progress.previousValue}
                  unit={progress.unit}
                />
              </span>
              <span className="text-sm text-gray-500">
                of {progress.targetValue.toLocaleString()}{progress.unit && progress.unit !== '$' && progress.unit !== '%' ? ` ${progress.unit}` : ''}
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="relative">
              <Progress 
                value={percentage} 
                className="h-3 bg-gray-100"
                data-testid={`progress-bar-${progress.id}`}
              />
              
              {/* Glow effect on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 h-3 rounded-full bg-gradient-to-r ${tierConfig.gradient} opacity-20 blur-sm`}
                  />
                )}
              </AnimatePresence>

              {/* Progress indicator with animation */}
              <motion.div
                className={`absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r ${tierConfig.gradient}`}
                initial={{ width: `${previousPercentage}%` }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {Math.round(percentage)}% Complete
              </span>
              {progress.currentValue >= progress.targetValue && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-green-600 font-medium"
                >
                  <Trophy className="h-4 w-4" />
                  Goal Achieved!
                </motion.div>
              )}
            </div>
          </div>

          {/* Celebration Button (if interactive) */}
          {interactive && percentage >= 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4"
            >
              <Button 
                size="sm" 
                className={`w-full bg-gradient-to-r ${tierConfig.gradient} hover:opacity-90`}
                onClick={() => {
                  setShowParticles(true);
                  setTimeout(() => setShowParticles(false), 2000);
                }}
                data-testid={`celebrate-button-${progress.id}`}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Celebrate Achievement
              </Button>
            </motion.div>
          )}
        </CardContent>

        {/* Particle Effects */}
        <CelebrationParticles isActive={showParticles} tierColor={progress.tier} />

        {/* Corner decoration for completed goals */}
        {percentage >= 100 && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute top-2 right-2"
          >
            <Crown className={`h-5 w-5 ${tierConfig.text}`} />
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}