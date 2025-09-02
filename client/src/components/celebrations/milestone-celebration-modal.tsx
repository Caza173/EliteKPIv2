import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Sparkles, 
  Crown, 
  Medal,
  Gift,
  Target,
  Award,
  Zap,
  PartyPopper,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface MilestoneData {
  id: string;
  title: string;
  description: string;
  category: 'revenue' | 'sales' | 'activity' | 'streak' | 'goal' | 'level';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  value: number;
  unit?: string;
  points?: number;
  previousLevel?: string;
  newLevel?: string;
  rewards?: string[];
}

interface MilestoneCelebrationModalProps {
  milestone: MilestoneData | null;
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
}

const tierConfig = {
  bronze: {
    gradient: 'from-orange-400 via-orange-500 to-orange-600',
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    text: 'text-orange-800',
    icon: Medal,
    particles: 'bg-orange-400'
  },
  silver: {
    gradient: 'from-gray-400 via-gray-500 to-gray-600', 
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
    text: 'text-gray-800',
    icon: Star,
    particles: 'bg-gray-400'
  },
  gold: {
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100', 
    text: 'text-blue-800',
    icon: Trophy,
    particles: 'bg-blue-400'
  },
  platinum: {
    gradient: 'from-purple-400 via-purple-500 to-purple-600',
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    text: 'text-purple-800', 
    icon: Crown,
    particles: 'bg-purple-400'
  },
  diamond: {
    gradient: 'from-blue-400 via-cyan-500 to-blue-600',
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-100',
    text: 'text-blue-800',
    icon: Sparkles,
    particles: 'bg-blue-400'
  }
};

const categoryMessages = {
  revenue: "Outstanding financial milestone!",
  sales: "Sales excellence achieved!",
  activity: "Activity streak mastery!",
  streak: "Consistency champion!",
  goal: "Goal crushed!",
  level: "Level up achievement!"
};

// Confetti Particle Component
const ConfettiParticle = ({ 
  delay, 
  color, 
  size = 'small',
  direction = 'up'
}: { 
  delay: number; 
  color: string;
  size?: 'small' | 'medium' | 'large';
  direction?: 'up' | 'diagonal';
}) => {
  const sizeClass = size === 'large' ? 'w-4 h-4' : size === 'medium' ? 'w-3 h-3' : 'w-2 h-2';
  const shapes = ['rounded-full', 'rounded-sm', 'rounded-none'];
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  
  const directionConfig = direction === 'diagonal' ? {
    x: [0, Math.random() * 300 - 150],
    y: [0, -Math.random() * 400 - 100]
  } : {
    x: [0, Math.random() * 200 - 100],
    y: [0, -Math.random() * 300 - 150]
  };

  return (
    <motion.div
      className={`absolute ${sizeClass} ${color} ${randomShape}`}
      initial={{ 
        opacity: 0,
        scale: 0,
        rotate: 0,
        x: 0,
        y: 0
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        rotate: Math.random() * 360,
        ...directionConfig
      }}
      transition={{
        duration: 3,
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
    />
  );
};

// Firework Effect
const FireworkEffect = ({ isActive, tierColor }: { isActive: boolean; tierColor: string }) => {
  if (!isActive) return null;

  const confettiColors = [
    'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-cyan-400',
    'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-orange-400',
    tierColor
  ];

  const particles = Array.from({ length: 60 }, (_, i) => (
    <ConfettiParticle
      key={i}
      delay={Math.random() * 2}
      color={confettiColors[Math.floor(Math.random() * confettiColors.length)]}
      size={Math.random() > 0.7 ? 'large' : Math.random() > 0.4 ? 'medium' : 'small'}
      direction={Math.random() > 0.5 ? 'diagonal' : 'up'}
    />
  ));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles}
    </div>
  );
};

// Animated Number Counter
const AnimatedNumber = ({ 
  value, 
  unit = '', 
  duration = 2000 
}: { 
  value: number; 
  unit?: string;
  duration?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const endValue = value;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = endValue * easeOut;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        setDisplayValue(endValue);
      }
    };

    updateValue();
  }, [value, duration]);

  const formatValue = (val: number) => {
    if (unit === '$') {
      return `$${Math.round(val).toLocaleString()}`;
    } else if (unit === '%') {
      return `${Math.round(val * 10) / 10}%`;
    }
    return Math.round(val).toString();
  };

  return (
    <motion.span 
      className="text-6xl font-bold tabular-nums"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      {formatValue(displayValue)}
      {unit && unit !== '$' && unit !== '%' && ` ${unit}`}
    </motion.span>
  );
};

export default function MilestoneCelebrationModal({
  milestone,
  isOpen,
  onClose,
  onShare
}: MilestoneCelebrationModalProps) {
  const [showFireworks, setShowFireworks] = useState(false);
  const [celebrationPhase, setCelebrationPhase] = useState<'enter' | 'celebrate' | 'rewards'>('enter');

  useEffect(() => {
    if (isOpen && milestone) {
      setShowFireworks(true);
      setCelebrationPhase('enter');
      
      // Phase transitions
      const enterTimer = setTimeout(() => setCelebrationPhase('celebrate'), 1000);
      const rewardsTimer = setTimeout(() => setCelebrationPhase('rewards'), 3000);
      const fireworkTimer = setTimeout(() => setShowFireworks(false), 5000);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(rewardsTimer);
        clearTimeout(fireworkTimer);
      };
    }
  }, [isOpen, milestone]);

  if (!milestone) return null;

  const config = tierConfig[milestone.tier];
  const TierIcon = config.icon;
  const message = categoryMessages[milestone.category];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl p-0 bg-transparent border-0 shadow-none"
        data-testid={`milestone-modal-${milestone.id}`}
      >
        <DialogTitle className="sr-only">
          {milestone.title} Achievement
        </DialogTitle>
        
        {/* Main Celebration Card */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotateY: 180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.175, 0.885, 0.32, 1.275] }}
          className={`relative overflow-hidden rounded-2xl ${config.bg} border-4 border-white shadow-2xl`}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white"
            data-testid="close-milestone-modal"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="p-8 text-center space-y-6">
            {/* Trophy Icon with Glow */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative inline-flex"
            >
              <div className={`p-6 rounded-full bg-gradient-to-r ${config.gradient} shadow-2xl`}>
                <TierIcon className="h-16 w-16 text-white" />
              </div>
              
              {/* Glow effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} blur-xl opacity-50`}
              />
            </motion.div>

            {/* Milestone Title */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-2"
            >
              <motion.h1 
                className={`text-4xl font-bold ${config.text}`}
                animate={celebrationPhase === 'celebrate' ? {
                  scale: [1, 1.05, 1],
                  textShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 20px rgba(0,0,0,0.3)", "0 0 0px rgba(0,0,0,0)"]
                } : {}}
                transition={{ duration: 1, repeat: celebrationPhase === 'celebrate' ? 2 : 0 }}
              >
                {milestone.title}
              </motion.h1>
              
              <motion.p 
                className="text-lg text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {message}
              </motion.p>
            </motion.div>

            {/* Achievement Value */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className={`${config.text}`}
            >
              <AnimatedNumber 
                value={milestone.value}
                unit={milestone.unit}
              />
            </motion.div>

            {/* Level Up Section */}
            {milestone.newLevel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
                className="bg-white/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-center gap-4">
                  {milestone.previousLevel && (
                    <>
                      <Badge variant="outline" className="text-base px-3 py-1">
                        {milestone.previousLevel}
                      </Badge>
                      <motion.div
                        animate={{ x: [0, 10, 0] }}
                        transition={{ duration: 1, repeat: 2 }}
                      >
                        <Zap className="h-6 w-6 text-blue-500" />
                      </motion.div>
                    </>
                  )}
                  <Badge className={`text-base px-3 py-1 bg-gradient-to-r ${config.gradient} text-white`}>
                    {milestone.newLevel}
                  </Badge>
                </div>
              </motion.div>
            )}

            {/* Rewards Section */}
            <AnimatePresence>
              {celebrationPhase === 'rewards' && milestone.rewards && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="bg-white/70 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-800">Rewards Unlocked!</h3>
                  </div>
                  <div className="space-y-2">
                    {milestone.rewards.map((reward, index) => (
                      <motion.div
                        key={reward}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <Star className="h-4 w-4 text-blue-500" />
                        {reward}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Points Display */}
            {milestone.points && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="flex items-center justify-center gap-2 text-lg font-semibold text-purple-600"
              >
                <Target className="h-5 w-5" />
                +{milestone.points} Points Earned
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="flex gap-4 justify-center pt-4"
            >
              {onShare && (
                <Button
                  onClick={onShare}
                  className={`bg-gradient-to-r ${config.gradient} text-white hover:opacity-90`}
                  data-testid="share-milestone"
                >
                  <PartyPopper className="h-4 w-4 mr-2" />
                  Share Achievement
                </Button>
              )}
              
              <Button
                onClick={onClose}
                variant="outline"
                className="bg-white/80 hover:bg-white"
                data-testid="continue-milestone"
              >
                Continue
              </Button>
            </motion.div>
          </div>

          {/* Fireworks Effect */}
          <FireworkEffect isActive={showFireworks} tierColor={config.particles} />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}