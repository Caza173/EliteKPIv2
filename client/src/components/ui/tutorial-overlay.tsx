import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Target, 
  CheckCircle,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  highlightElement?: boolean;
  action?: string;
  waitForAction?: boolean;
  validation?: () => boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  steps: TutorialStep[];
  category: 'getting-started' | 'properties' | 'financial' | 'advanced';
}

interface TutorialOverlayProps {
  tutorial: Tutorial | null;
  currentStepIndex: number;
  isActive: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

export function TutorialOverlay({
  tutorial,
  currentStepIndex,
  isActive,
  onNext,
  onPrevious,
  onClose,
  onComplete,
  onSkip
}: TutorialOverlayProps) {
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!tutorial || !isActive) return;

    const currentStep = tutorial.steps[currentStepIndex];
    if (currentStep?.targetSelector && currentStep.highlightElement) {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        setHighlightedElement(element);
        
        // Calculate overlay position
        const rect = element.getBoundingClientRect();
        const position = currentStep.position || 'bottom';
        
        let top = rect.bottom + 10;
        let left = rect.left;
        
        switch (position) {
          case 'top':
            top = rect.top - 200;
            break;
          case 'left':
            top = rect.top;
            left = rect.left - 320;
            break;
          case 'right':
            top = rect.top;
            left = rect.right + 10;
            break;
          case 'center':
            top = window.innerHeight / 2 - 150;
            left = window.innerWidth / 2 - 200;
            break;
        }
        
        setOverlayPosition({ top, left });
        
        // Add highlight styles
        element.classList.add('tutorial-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightedElement(null);
    }

    return () => {
      // Clean up highlight styles
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
    };
  }, [tutorial, currentStepIndex, isActive]);

  if (!tutorial || !isActive) return null;

  const currentStep = tutorial.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / tutorial.steps.length) * 100;
  const isLastStep = currentStepIndex === tutorial.steps.length - 1;

  const handleNext = () => {
    if (currentStep.validation && !currentStep.validation()) {
      return; // Don't proceed if validation fails
    }
    
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-none"
        style={{
          background: highlightedElement ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)'
        }}
      />
      
      {/* Tutorial instruction card */}
      <div
        className="fixed z-50 w-96"
        style={{
          top: currentStep.position === 'center' ? '50%' : overlayPosition.top,
          left: currentStep.position === 'center' ? '50%' : overlayPosition.left,
          transform: currentStep.position === 'center' ? 'translate(-50%, -50%)' : 'none'
        }}
      >
        <Card className="shadow-2xl border-2 border-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                Step {currentStepIndex + 1} of {tutorial.steps.length}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {currentStep.title}
            </CardTitle>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {currentStep.description}
            </p>
            
            {currentStep.action && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Action Required:
                </p>
                <p className="text-sm text-blue-700 mt-1">{currentStep.action}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onPrevious}
                  disabled={currentStepIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onSkip}
                >
                  Skip Tutorial
                </Button>
              </div>
              
              <Button 
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .tutorial-highlight {
            position: relative !important;
            z-index: 45 !important;
            outline: 3px solid #3B82F6 !important;
            outline-offset: 2px !important;
            border-radius: 4px !important;
            background-color: rgba(59, 130, 246, 0.1) !important;
            pointer-events: auto !important;
          }
        `
      }} />
    </>
  );
}