import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Star, 
  Medal,
  Crown,
  Sparkles,
  PartyPopper,
  Gift,
  Zap,
  TrendingUp,
  Share2,
  MessageCircle,
  Mail,
  Copy,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface GoalData {
  id: string;
  title: string;
  category: 'revenue' | 'sales' | 'activity' | 'streak';
  targetValue: number;
  currentValue: number;
  unit?: string;
  completedAt?: Date;
  timeframe: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  reward?: string;
  bonusPoints?: number;
}

interface GoalCompletionCelebrationProps {
  goal: GoalData;
  onClose: () => void;
  onShareGoal?: (goal: GoalData) => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const difficultyConfig = {
  easy: {
    color: 'from-green-400 to-green-600',
    bg: 'bg-green-50',
    text: 'text-green-800',
    icon: Target,
    multiplier: 1,
    label: 'Achievement Unlocked!'
  },
  medium: {
    color: 'from-blue-400 to-blue-600', 
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    icon: Medal,
    multiplier: 1.5,
    label: 'Great Achievement!'
  },
  hard: {
    color: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-50', 
    text: 'text-purple-800',
    icon: Trophy,
    multiplier: 2,
    label: 'Outstanding Achievement!'
  },
  extreme: {
    color: 'from-blue-400 to-purple-600',
    bg: 'bg-blue-50',
    text: 'text-blue-800', 
    icon: Crown,
    multiplier: 3,
    label: 'LEGENDARY Achievement!'
  }
};

const categoryEmojis = {
  revenue: '💰',
  sales: '🏠', 
  activity: '⚡',
  streak: '🔥'
};

const ExplosionParticle = ({ 
  delay, 
  color, 
  direction 
}: { 
  delay: number; 
  color: string;
  direction: { x: number; y: number };
}) => (
  <motion.div
    className={`absolute w-3 h-3 ${color} rounded-full`}
    initial={{ 
      scale: 0,
      x: 0,
      y: 0,
      opacity: 1
    }}
    animate={{
      scale: [0, 1, 0.5, 0],
      x: direction.x,
      y: direction.y,
      opacity: [1, 1, 0.7, 0]
    }}
    transition={{
      duration: 2,
      delay,
      ease: "easeOut"
    }}
  />
);

const CelebrationExplosion = ({ isActive, color }: { isActive: boolean; color: string }) => {
  if (!isActive) return null;
  
  const particles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    const radius = 150 + Math.random() * 100;
    
    return (
      <ExplosionParticle
        key={i}
        delay={Math.random() * 0.5}
        color={color}
        direction={{
          x: Math.cos(angle * Math.PI / 180) * radius,
          y: Math.sin(angle * Math.PI / 180) * radius
        }}
      />
    );
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {particles}
    </div>
  );
};

const CountUpAnimation = ({ 
  from, 
  to, 
  duration = 2000,
  unit = ''
}: {
  from: number;
  to: number;
  duration?: number;
  unit?: string;
}) => {
  const [count, setCount] = useState(from);
  
  useEffect(() => {
    const startTime = Date.now();
    const difference = to - from;
    
    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth counting
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = from + (difference * easeOut);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(to);
      }
    };
    
    updateCount();
  }, [from, to, duration]);
  
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
      className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
      animate={{
        textShadow: [
          "0 0 0px rgba(255,193,7,0)",
          "0 0 20px rgba(255,193,7,0.8)", 
          "0 0 0px rgba(255,193,7,0)"
        ]
      }}
      transition={{ duration: 1, repeat: 2 }}
    >
      {formatValue(count)}
      {unit && unit !== '$' && unit !== '%' && ` ${unit}`}
    </motion.span>
  );
};

export default function GoalCompletionCelebration({
  goal,
  onClose,
  onShareGoal,
  autoClose = false,
  autoCloseDelay = 5000
}: GoalCompletionCelebrationProps) {
  const [showExplosion, setShowExplosion] = useState(false);
  const [celebrationPhase, setCelebrationPhase] = useState<'enter' | 'celebrate' | 'rewards' | 'exit'>('enter');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const config = difficultyConfig[goal.difficulty];
  const DifficultyIcon = config.icon;
  const categoryEmoji = categoryEmojis[goal.category];
  
  const bonusMultiplier = config.multiplier;
  const totalPoints = (goal.bonusPoints || 100) * bonusMultiplier;
  
  useEffect(() => {
    // Auto-close functionality
    if (autoClose) {
      const timer = setTimeout(() => {
        setCelebrationPhase('exit');
        setTimeout(onClose, 500);
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);
  
  useEffect(() => {
    // Phase progression
    const enterTimer = setTimeout(() => {
      setShowExplosion(true);
      setCelebrationPhase('celebrate');
    }, 500);
    
    const celebrateTimer = setTimeout(() => {
      setShowExplosion(false);
      setCelebrationPhase('rewards');
    }, 3000);
    
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(celebrateTimer);
    };
  }, []);
  
  const formatValue = (value: number, unit?: string) => {
    if (unit === '$') {
      return `$${value.toLocaleString()}`;
    } else if (unit === '%') {
      return `${value}%`;
    }
    return value.toString();
  };

  // Social sharing functions
  const getShareMessage = () => {
    const valueText = formatValue(goal.currentValue, goal.unit);
    const difficultyText = goal.difficulty.charAt(0).toUpperCase() + goal.difficulty.slice(1);
    return `🎉 Just achieved my ${difficultyText} ${goal.category} goal! ${categoryEmoji} ${goal.title}: ${valueText} ${goal.unit && goal.unit !== '$' && goal.unit !== '%' ? goal.unit : ''} in ${goal.timeframe}! #RealEstate #Goals #Achievement`;
  };

  const shareToSocial = (platform: string) => {
    const message = getShareMessage();
    const encodedMessage = encodeURIComponent(message);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodedMessage}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedMessage}`;
        break;
      case 'instagram':
        // Instagram doesn't have direct URL sharing, so copy text to clipboard for manual posting
        navigator.clipboard.writeText(message).then(() => {
          window.open('https://www.instagram.com/', '_blank');
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const shareViaEmail = () => {
    const message = getShareMessage();
    const subject = `Achievement Unlocked: ${goal.title}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        data-testid={`goal-celebration-${goal.id}`}
      >
        <motion.div
          className="relative max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.3, opacity: 0, rotateY: 90 }}
          animate={{ 
            scale: celebrationPhase === 'exit' ? 0.8 : 1, 
            opacity: celebrationPhase === 'exit' ? 0 : 1, 
            rotateY: 0 
          }}
          exit={{ scale: 0.3, opacity: 0, rotateY: -90 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
        >
          <Card className={`${config.bg} border-4 border-white shadow-2xl overflow-hidden`}>
            <CardContent className="text-center p-8 space-y-6 relative">
              {/* Close button (X) - hidden during celebration phase */}
              {celebrationPhase !== 'celebrate' && (
                <motion.button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  data-testid="close-celebration"
                >
                  <Sparkles className="h-5 w-5 text-gray-600" />
                </motion.button>
              )}
              
              {/* Main Icon with Animation */}
              <motion.div
                className="relative inline-flex"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: celebrationPhase === 'celebrate' ? [1, 1.2, 1] : 1, 
                  rotate: 0 
                }}
                transition={{ 
                  scale: { duration: 0.8, repeat: celebrationPhase === 'celebrate' ? 2 : 0 },
                  rotate: { duration: 1.2, ease: "backOut" }
                }}
              >
                <div className={`p-8 rounded-full bg-gradient-to-r ${config.color} shadow-2xl relative`}>
                  <DifficultyIcon className="h-20 w-20 text-white" />
                  
                  {/* Pulsing glow effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.color}`}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{ filter: 'blur(20px)' }}
                  />
                </div>
              </motion.div>
              
              {/* Celebration Message */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="space-y-2"
              >
                <motion.h1
                  className={`text-4xl font-bold ${config.text}`}
                  animate={celebrationPhase === 'celebrate' ? {
                    scale: [1, 1.05, 1],
                  } : {}}
                  transition={{ duration: 0.6, repeat: 2 }}
                >
                  {config.label}
                </motion.h1>
                
                <p className="text-xl text-gray-700 flex items-center justify-center gap-2">
                  <span>{categoryEmoji}</span>
                  {goal.title} 
                  <span>{categoryEmoji}</span>
                </p>
              </motion.div>
              
              {/* Goal Achievement Display */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="bg-white/70 rounded-2xl p-6 space-y-4"
              >
                <div className="text-gray-600">
                  <span className="text-sm font-medium">Goal Achieved:</span>
                </div>
                
                <CountUpAnimation
                  from={0}
                  to={goal.currentValue}
                  unit={goal.unit}
                />
                
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <Badge className={`${config.text} bg-white/80`}>
                    {goal.timeframe}
                  </Badge>
                  <Badge className={`${config.text} bg-white/80`}>
                    {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                  </Badge>
                  <Badge className={`${config.text} bg-white/80`}>
                    {goal.difficulty.charAt(0).toUpperCase() + goal.difficulty.slice(1)}
                  </Badge>
                </div>
              </motion.div>
              
              {/* Rewards Section */}
              <AnimatePresence>
                {celebrationPhase === 'rewards' && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Gift className="h-6 w-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-blue-800">Rewards Earned!</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Points */}
                      <div className="bg-white/80 rounded-lg p-4 text-center">
                        <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-700">
                          +{totalPoints}
                        </div>
                        <div className="text-sm text-gray-600">Achievement Points</div>
                        {bonusMultiplier > 1 && (
                          <Badge variant="outline" className="mt-2 text-orange-700 border-orange-200">
                            {bonusMultiplier}x Bonus!
                          </Badge>
                        )}
                      </div>
                      
                      {/* Special Reward */}
                      {goal.reward && (
                        <div className="bg-white/80 rounded-lg p-4 text-center">
                          <PartyPopper className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                          <div className="text-lg font-semibold text-purple-700">
                            {goal.reward}
                          </div>
                          <div className="text-sm text-gray-600">Special Reward</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="flex gap-4 justify-center pt-4"
              >
                <Button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className={`bg-gradient-to-r ${config.color} text-white hover:opacity-90 transition-opacity`}
                  data-testid="share-goal"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Achievement
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="bg-white/80 hover:bg-white"
                  data-testid="continue-button"
                >
                  Continue
                </Button>
              </motion.div>

              {/* Social Sharing Options */}
              <AnimatePresence>
                {showShareOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white/90 rounded-2xl p-6 border border-gray-200 shadow-lg"
                  >
                    <h4 className="text-lg font-semibold text-center mb-4 text-gray-800">
                      Share your achievement with friends!
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Twitter Share */}
                      <motion.button
                        onClick={() => shareToSocial('twitter')}
                        className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        data-testid="share-twitter"
                      >
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-600 transition-colors">
                          <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Twitter</span>
                      </motion.button>

                      {/* LinkedIn Share */}
                      <motion.button
                        onClick={() => shareToSocial('linkedin')}
                        className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        data-testid="share-linkedin"
                      >
                        <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-800 transition-colors">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">LinkedIn</span>
                      </motion.button>

                      {/* Email Share */}
                      <motion.button
                        onClick={shareViaEmail}
                        className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        data-testid="share-email"
                      >
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-700 transition-colors">
                          <Mail className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Email</span>
                      </motion.button>

                      {/* Facebook Share */}
                      <motion.button
                        onClick={() => shareToSocial('facebook')}
                        className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        data-testid="share-facebook"
                      >
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-700 transition-colors">
                          <Share2 className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Facebook</span>
                      </motion.button>

                      {/* Instagram Share */}
                      <motion.button
                        onClick={() => shareToSocial('instagram')}
                        className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-colors group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        data-testid="share-instagram"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2 group-hover:from-purple-600 group-hover:to-pink-600 transition-colors">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Instagram</span>
                      </motion.button>

                      {/* Copy Link */}
                      <motion.button
                        onClick={copyToClipboard}
                        className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        data-testid="copy-message"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                          copied ? 'bg-green-500' : 'bg-gray-600 group-hover:bg-gray-700'
                        }`}>
                          {copied ? (
                            <CheckCircle className="h-6 w-6 text-white" />
                          ) : (
                            <Copy className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {copied ? 'Copied!' : 'Copy'}
                        </span>
                      </motion.button>
                    </div>

                    {/* Preview Message */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Preview:</p>
                      <p className="text-sm text-gray-700 italic">"{getShareMessage()}"</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            
            {/* Explosion Effect */}
            <CelebrationExplosion 
              isActive={showExplosion} 
              color="bg-blue-400"
            />
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}