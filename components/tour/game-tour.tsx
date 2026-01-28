'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export interface TourStep {
  target: string; // CSS selector do elemento alvo
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Texto do botão de ação
}

interface GameTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

export function GameTour({ steps, onComplete, onSkip }: GameTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [highlightPosition, setHighlightPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Atualizar posição do destaque quando o passo muda
  useEffect(() => {
    if (!step) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setHighlightPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });

        // Scroll suave até o elemento
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, step]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip?.();
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible || !step) return null;

  // Calcular posição do card de explicação
  const getCardPosition = () => {
    const position = step.position || 'bottom';
    const padding = 20;

    switch (position) {
      case 'top':
        return {
          top: `${highlightPosition.top - 220}px`,
          left: `${highlightPosition.left + highlightPosition.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'bottom':
        return {
          top: `${highlightPosition.top + highlightPosition.height + padding}px`,
          left: `${highlightPosition.left + highlightPosition.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: `${highlightPosition.top + highlightPosition.height / 2}px`,
          left: `${highlightPosition.left - 320 - padding}px`,
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          top: `${highlightPosition.top + highlightPosition.height / 2}px`,
          left: `${highlightPosition.left + highlightPosition.width + padding}px`,
          transform: 'translateY(-50%)',
        };
      default:
        return {
          top: `${highlightPosition.top + highlightPosition.height + padding}px`,
          left: `${highlightPosition.left + highlightPosition.width / 2}px`,
          transform: 'translateX(-50%)',
        };
    }
  };

  return (
    <>
      {/* Overlay escuro */}
      <div className="fixed inset-0 bg-black/70 z-[9998] pointer-events-none" />

      {/* Destaque no elemento */}
      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          top: `${highlightPosition.top - 8}px`,
          left: `${highlightPosition.left - 8}px`,
          width: `${highlightPosition.width + 16}px`,
          height: `${highlightPosition.height + 16}px`,
        }}
      >
        <div className="absolute inset-0 rounded-lg border-4 border-red-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] animate-pulse" />
        <div className="absolute inset-0 rounded-lg bg-white/5 backdrop-blur-sm" />
      </div>

      {/* Card de explicação */}
      <div
        className="fixed z-[10000] w-80"
        style={getCardPosition()}
      >
        <Card className="bg-gradient-to-br from-zinc-900/98 to-zinc-950/98 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.4)]">
          <CardHeader className="relative">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🌶️</span>
                  <div className="text-xs text-gray-400">
                    Passo {currentStep + 1} de {steps.length}
                  </div>
                </div>
                <CardTitle className="text-white text-lg">
                  {step.title}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-400 hover:text-white -mt-1 -mr-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription className="text-gray-300">
              {step.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Progress bar */}
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 to-red-500 h-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>

            {/* Botões de navegação */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="flex-1 border-zinc-700 text-gray-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                onClick={handleNext}
                size="sm"
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg"
              >
                {isLastStep ? 'Concluir' : step.action || 'Próximo'}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="w-full text-xs text-gray-500 hover:text-gray-300"
            >
              Pular tutorial
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
