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
import { X, ChevronRight, ChevronLeft, Flame } from 'lucide-react';

export interface TourStep {
  target: string; // CSS selector do elemento alvo
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
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
  const [elementFound, setElementFound] = useState(false);

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Atualizar posição do destaque quando o passo muda
  useEffect(() => {
    if (!step) return;

    let retryCount = 0;
    const maxRetries = 5;

    const updatePosition = () => {
      const targetElement = document.querySelector(step.target);

      if (targetElement) {
        setElementFound(true);
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
      } else {
        // Elemento não encontrado
        console.log(`[Tour] Elemento não encontrado: ${step.target}, tentativa ${retryCount + 1}/${maxRetries}`);

        if (retryCount < maxRetries) {
          // Tentar novamente após um delay
          retryCount++;
          setTimeout(updatePosition, 200);
          return;
        }

        // Após todas as tentativas, usar posição central
        console.log(`[Tour] Elemento ${step.target} não encontrado após ${maxRetries} tentativas, usando posição central`);
        setElementFound(false);
        setHighlightPosition({
          top: window.scrollY + window.innerHeight / 2 - 50,
          left: window.scrollX + window.innerWidth / 2 - 150,
          width: 300,
          height: 100,
        });
      }
    };

    // Aguardar um pouco para garantir que o DOM está pronto
    const timer = setTimeout(updatePosition, 100);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer);
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
    const cardWidth = 320;

    // Se posição for center ou elemento não encontrado, centralizar
    if (position === 'center' || !elementFound) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '90vw',
      };
    }

    // Garantir que o card não saia da tela
    let left = highlightPosition.left + highlightPosition.width / 2;
    if (left - cardWidth / 2 < 10) left = cardWidth / 2 + 10;
    if (left + cardWidth / 2 > window.innerWidth - 10) left = window.innerWidth - cardWidth / 2 - 10;

    switch (position) {
      case 'top':
        return {
          top: `${Math.max(highlightPosition.top - 240, 10)}px`,
          left: `${left}px`,
          transform: 'translateX(-50%)',
        };
      case 'bottom':
        return {
          top: `${highlightPosition.top + highlightPosition.height + padding}px`,
          left: `${left}px`,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: `${highlightPosition.top + highlightPosition.height / 2}px`,
          left: `${Math.max(highlightPosition.left - cardWidth - padding, 10)}px`,
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
          left: `${left}px`,
          transform: 'translateX(-50%)',
        };
    }
  };

  return (
    <>
      {/* Overlay escuro */}
      <div
        className="fixed inset-0 bg-black/80 z-[9998]"
        style={{ pointerEvents: 'none' }}
      />

      {/* Destaque no elemento (se encontrado) */}
      {elementFound && highlightPosition.width > 0 && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: `${highlightPosition.top - 8}px`,
            left: `${highlightPosition.left - 8}px`,
            width: `${highlightPosition.width + 16}px`,
            height: `${highlightPosition.height + 16}px`,
          }}
        >
          <div className="absolute inset-0 rounded-lg border-4 border-red-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] animate-pulse" />
          <div className="absolute inset-0 rounded-lg bg-white/5" />
        </div>
      )}

      {/* Card de explicação */}
      <div
        className="fixed z-[10000] w-80"
        style={{
          ...getCardPosition(),
          pointerEvents: 'auto',
        }}
      >
        <Card className="bg-zinc-900 border-2 border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.6)]">
          <CardHeader className="relative pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-6 h-6 text-red-500" aria-hidden="true" />
                  <div className="text-xs font-semibold text-red-400 bg-red-950/50 px-2 py-1 rounded">
                    Passo {currentStep + 1} de {steps.length}
                  </div>
                </div>
                <CardTitle className="text-white text-lg leading-tight">
                  {step.title}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-400 hover:text-white hover:bg-zinc-800 -mt-1 -mr-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription className="text-gray-300 text-sm leading-relaxed mt-2">
              {step.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {/* Progress bar */}
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
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
                className="flex-1 border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                onClick={handleNext}
                size="sm"
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg"
              >
                {isLastStep ? 'Concluir' : step.action || 'Próximo'}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="w-full text-xs text-gray-500 hover:text-gray-300 hover:bg-zinc-800"
            >
              Pular tutorial
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
