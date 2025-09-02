import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { 
  Info, 
  Target, 
  TrendingUp, 
  ChevronUp,
  Sparkles,
  Trophy
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export interface ProgressBarData {
  id: string;
  label: string;
  current: number;
  target: number;
  previousValue?: number;
  unit?: string;
  category: 'revenue' | 'sales' | 'activity' | 'goal';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
  showMilestones?: boolean;
  milestones?: { value: number; label: string }[];
  tooltip?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
}

interface InteractiveProgressBarProps {
  data: ProgressBarData;
  height?: 'sm' | 'md' | 'lg' | 'xl';
  showAnimation?: boolean;
  showDetails?: boolean;
  onMilestoneReached?: (milestone: { value: number; label: string }) => void;
  className?: string;
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-100',
    fill: 'bg-gradient-to-r from-blue-400 to-blue-600',
    glow: 'shadow-blue-400/50',
    text: 'text-blue-700',
    accent: 'border-blue-300'
  },
  green: {
    bg: 'bg-green-100', 
    fill: 'bg-gradient-to-r from-green-400 to-green-600',
    glow: 'shadow-green-400/50',
    text: 'text-green-700',
    accent: 'border-green-300'
  },
  purple: {
    bg: 'bg-purple-100',
    fill: 'bg-gradient-to-r from-purple-400 to-purple-600', 
    glow: 'shadow-purple-400/50',
    text: 'text-purple-700',
    accent: 'border-purple-300'
  },
  orange: {
    bg: 'bg-orange-100',
    fill: 'bg-gradient-to-r from-orange-400 to-orange-600',
    glow: 'shadow-orange-400/50', 
    text: 'text-orange-700',
    accent: 'border-orange-300'
  },
  red: {
    bg: 'bg-red-100',
    fill: 'bg-gradient-to-r from-red-400 to-red-600',
    glow: 'shadow-red-400/50',
    text: 'text-red-700', 
    accent: 'border-red-300'
  },
  cyan: {
    bg: 'bg-cyan-100',
    fill: 'bg-gradient-to-r from-cyan-400 to-cyan-600',
    glow: 'shadow-cyan-400/50',
    text: 'text-cyan-700',
    accent: 'border-cyan-300'
  }
};

const heightConfig = {
  sm: { bar: 'h-2', container: 'py-1' },
  md: { bar: 'h-3', container: 'py-2' },
  lg: { bar: 'h-4', container: 'py-3' },
  xl: { bar: 'h-6', container: 'py-4' }
};

const PulseEffect = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;
  
  return (
    <motion.div
      className="absolute inset-0 bg-white rounded-full"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

const MilestoneMarker = ({ 
  position, 
  milestone, 
  isReached,
  barHeight 
}: { 
  position: number; 
  milestone: { value: number; label: string };
  isReached: boolean;
  barHeight: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className="absolute top-0 transform -translate-x-1/2"
          style={{ left: `${position}%` }}
          whileHover={{ scale: 1.2 }}
          data-testid={`milestone-${milestone.value}`}
        >
          <div className={`w-1 ${barHeight} bg-gray-400 rounded-sm relative`}>
            <motion.div
              className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md ${
                isReached ? 'bg-green-500' : 'bg-gray-300'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {isReached && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Target className="h-2 w-2 text-white" />
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">
          {milestone.label}: {milestone.value.toLocaleString()}
          {isReached && ' ✅'}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const AnimatedCounter = ({ 
  current, 
  previous = 0, 
  target, 
  unit = '',
  duration = 1500 
}: {
  current: number;
  previous?: number;
  target: number;
  unit?: string;
  duration?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(previous);
  
  useEffect(() => {
    const startTime = Date.now();
    const endValue = current;
    const difference = endValue - previous;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = previous + (difference * easeOut);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        setDisplayValue(endValue);
      }
    };

    updateValue();
  }, [current, previous, duration]);

  const formatValue = (val: number) => {
    if (unit === '$') {
      return `$${Math.round(val).toLocaleString()}`;
    } else if (unit === '%') {
      return `${Math.round(val * 10) / 10}%`;
    }
    return Math.round(val).toString();
  };

  return (
    <div className="flex items-baseline gap-1">
      <span className="font-bold tabular-nums text-lg">
        {formatValue(displayValue)}
      </span>
      <span className="text-sm text-gray-500">
        / {formatValue(target)}
        {unit && unit !== '$' && unit !== '%' && ` ${unit}`}
      </span>
    </div>
  );
};

export default function InteractiveProgressBar({
  data,
  height = 'md',
  showAnimation = true,
  showDetails = true,
  onMilestoneReached,
  className = ''
}: InteractiveProgressBarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const controls = useAnimation();
  
  const percentage = Math.min((data.current / data.target) * 100, 100);
  const previousPercentage = data.previousValue ? 
    Math.min((data.previousValue / data.target) * 100, 100) : 0;
  
  const colorScheme = colorConfig[data.color || 'blue'];
  const heightScheme = heightConfig[height];
  
  const isCompleted = data.current >= data.target;

  // Check for milestone reached
  useEffect(() => {
    if (data.milestones && data.previousValue !== undefined) {
      const reachedMilestones = data.milestones.filter(
        milestone => 
          data.current >= milestone.value && 
          data.previousValue! < milestone.value
      );
      
      reachedMilestones.forEach(milestone => {
        onMilestoneReached?.(milestone);
      });
    }
  }, [data.current, data.previousValue, data.milestones, onMilestoneReached]);

  // Celebration effect for completion
  useEffect(() => {
    if (isCompleted && !showSparkles) {
      setShowSparkles(true);
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.6 }
      });
      
      setTimeout(() => setShowSparkles(false), 2000);
    }
  }, [isCompleted, showSparkles, controls]);

  return (
    <div 
      className={`relative ${heightScheme.container} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`progress-bar-${data.id}`}
    >
      {/* Header with label and value */}
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{data.label}</h4>
            {data.tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">{data.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1"
              >
                <Trophy className="h-4 w-4 text-blue-500" />
                <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                  Complete
                </Badge>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <AnimatedCounter
              current={data.current}
              previous={data.previousValue}
              target={data.target}
              unit={data.unit}
            />
            
            {data.trend && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                data.trend.direction === 'up' ? 'bg-green-100 text-green-700' :
                data.trend.direction === 'down' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {data.trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : data.trend.direction === 'down' ? (
                  <ChevronUp className="h-3 w-3 rotate-180" />
                ) : (
                  <div className="w-3 h-0.5 bg-current rounded" />
                )}
                {data.trend.percentage}% {data.trend.period}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <motion.div
        animate={controls}
        className={`relative ${heightScheme.bar} ${colorScheme.bg} rounded-full overflow-hidden ${
          isHovered ? `shadow-lg ${colorScheme.glow}` : 'shadow-sm'
        } transition-all duration-300`}
      >
        {/* Background pulse effect */}
        <PulseEffect isActive={isHovered && !isCompleted} />
        
        {/* Progress Fill */}
        <motion.div
          className={`absolute left-0 top-0 h-full ${colorScheme.fill} rounded-full relative overflow-hidden`}
          initial={{ width: showAnimation ? `${previousPercentage}%` : `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: showAnimation ? 1.5 : 0, ease: "easeOut" }}
        >
          {/* Shimmer effect */}
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          
          {/* Sparkles for completion */}
          {showSparkles && (
            <div className="absolute inset-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 80 + 10}%`,
                    top: `${Math.random() * 60 + 20}%`
                  }}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    rotate: 360
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                >
                  <Sparkles className="h-3 w-3 text-white" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Milestones */}
        {data.showMilestones && data.milestones?.map((milestone) => {
          const position = (milestone.value / data.target) * 100;
          const isReached = data.current >= milestone.value;
          
          return (
            <MilestoneMarker
              key={milestone.value}
              position={Math.min(position, 95)}
              milestone={milestone}
              isReached={isReached}
              barHeight={heightScheme.bar}
            />
          );
        })}
        
        {/* Hover indicator */}
        {isHovered && (
          <motion.div
            className="absolute top-0 right-0 h-full w-1 bg-white/50 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </motion.div>

      {/* Progress percentage */}
      {showDetails && (
        <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
          <span>{Math.round(percentage)}% Complete</span>
          {data.target > data.current && (
            <span>
              {(data.target - data.current).toLocaleString()} remaining
            </span>
          )}
        </div>
      )}
    </div>
  );
}