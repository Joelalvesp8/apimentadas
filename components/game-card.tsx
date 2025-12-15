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
          <Card className="w-full h-full flex flex-col bg-white border-4 border-purple-500">
            <CardContent className="p-8 flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="flex gap-2 justify-center">
                  <Badge>
                    {typeLabels[card.type as keyof typeof typeLabels]}
                  </Badge>
                  <Badge variant="secondary">
                    {categoryLabels[card.category as keyof typeof categoryLabels]}
                  </Badge>
                  <Badge
                    className={cn(
                      'text-white',
                      difficultyColors[card.difficulty as keyof typeof difficultyColors]
                    )}
                  >
                    {card.difficulty}
                  </Badge>
                </div>

                <div className="text-center">
                  <p className="text-lg leading-relaxed">{card.content}</p>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Clique para virar
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
