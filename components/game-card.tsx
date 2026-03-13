'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GameCardProps {
  card: {
    id: string;
    type: string;
    category: string;
    difficulty: string;
    content: string;
  };
  onFlip?: (isFlipped: boolean) => void;
  className?: string;
}

const difficultyColors = {
  facil: 'bg-green-500',
  medio: 'bg-yellow-500',
  dificil: 'bg-orange-500',
  extremo: 'bg-red-500',
};

const typeLabels = {
  pergunta: 'Pergunta',
  tarefa: 'Tarefa',
};

const categoryLabels = {
  casais: 'Casais',
  trios: 'Trios',
  grupos: 'Grupos',
};

export function GameCard({ card, onFlip, className }: GameCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    const newFlippedState = !isFlipped;
    setIsFlipped(newFlippedState);
    onFlip?.(newFlippedState);
  };

  return (
    <div
      className={cn('flip-card w-full max-w-md h-80 cursor-pointer', className, {
        flipped: isFlipped,
      })}
      onClick={handleClick}
    >
      <div className="flip-card-inner">
        {/* Front */}
        <div className="flip-card-front">
          <Card className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 border-none text-white">
            <CardContent className="text-center p-8">
              <div className="text-6xl mb-4">❓</div>
              <p className="text-xl font-bold">Clique para revelar</p>
              <div className="flex gap-2 mt-6 justify-center">
                <Badge variant="secondary">
                  {typeLabels[card.type as keyof typeof typeLabels]}
                </Badge>
                <Badge variant="secondary">
                  {categoryLabels[card.category as keyof typeof categoryLabels]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back */}
        <div className="flip-card-back">
          <Card className="w-full h-full flex flex-col overflow-hidden border-none relative">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/card-background.png)',
              }}
            />

            {/* Content Overlay */}
            <CardContent className="relative z-10 p-8 flex flex-col h-full justify-between overflow-hidden">
              <div className="flex-1 flex flex-col space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                <div className="flex gap-2 justify-center flex-wrap flex-shrink-0">
                  <Badge className="bg-white/90 text-gray-900 hover:bg-white border border-amber-400">
                    {typeLabels[card.type as keyof typeof typeLabels]}
                  </Badge>
                  <Badge className="bg-white/90 text-gray-900 hover:bg-white border border-amber-400">
                    {categoryLabels[card.category as keyof typeof categoryLabels]}
                  </Badge>
                  <Badge
                    className={cn(
                      'text-white border border-amber-400',
                      difficultyColors[card.difficulty as keyof typeof difficultyColors]
                    )}
                  >
                    {card.difficulty}
                  </Badge>
                </div>

                <div className="text-center px-4 py-8 flex-1">
                  <p className="text-xl md:text-2xl font-serif leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {card.content}
                  </p>
                </div>
              </div>

              <p className="text-sm text-center text-white/70 drop-shadow-lg flex-shrink-0 mt-4">
                Clique para virar
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
