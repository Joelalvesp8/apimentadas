'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateUserCard } from '@/hooks/useCards';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function CreateCardPage() {
  const router = useRouter();
  const createUserCard = useCreateUserCard();

  const [type, setType] = useState<'pergunta' | 'tarefa'>('pergunta');
  const [category, setCategory] = useState<'casais' | 'trios' | 'grupos'>('casais');
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil' | 'extremo'>('facil');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!content.trim() || content.length < 10) {
      setError('O conteúdo deve ter pelo menos 10 caracteres');
      return;
    }

    if (content.length > 500) {
      setError('O conteúdo deve ter no máximo 500 caracteres');
      return;
    }

    try {
      await createUserCard.mutateAsync({
        type,
        category,
        difficulty,
        content: content.trim(),
      });

      setSuccess(true);
      setContent('');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Erro ao criar carta');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">🎴 Criar Nova Carta</CardTitle>
            <CardDescription>
              Crie sua própria carta personalizada para o jogo Apimentadas!
              <br />
              <span className="text-sm text-orange-600">
                ⚠️ Sua carta será revisada por um administrador antes de ser aprovada
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                  ✅ Carta criada com sucesso! Aguardando aprovação do administrador.
                  <br />
                  Redirecionando para o dashboard...
                </div>
              )}

              {/* Type Selection */}
              <div className="space-y-2">
                <Label>Tipo de Carta *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('pergunta')}
                    className={`p-4 border-2 rounded-lg transition ${
                      type === 'pergunta'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">❓</span>
                      <p className="font-medium">Pergunta</p>
                      <p className="text-xs text-muted-foreground">
                        Uma pergunta para o outro responder
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('tarefa')}
                    className={`p-4 border-2 rounded-lg transition ${
                      type === 'tarefa'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">✨</span>
                      <p className="font-medium">Tarefa</p>
                      <p className="text-xs text-muted-foreground">
                        Uma tarefa para executar
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['casais', 'trios', 'grupos'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-3 border-2 rounded-lg transition ${
                        category === cat
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-200'
                      }`}
                    >
                      <p className="font-medium capitalize">{cat}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-2">
                <Label>Nível de Apimentada 🌶️</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { value: 'facil', label: 'Leve', emoji: '🌶️', color: 'green' },
                    { value: 'medio', label: 'Média', emoji: '🌶️🌶️', color: 'yellow' },
                    { value: 'dificil', label: 'Picante', emoji: '🌶️🌶️🌶️', color: 'orange' },
                    { value: 'extremo', label: 'Infernal', emoji: '🌶️🌶️🌶️🌶️', color: 'red' },
                  ] as const).map((diff) => (
                    <button
                      key={diff.value}
                      type="button"
                      onClick={() => setDifficulty(diff.value)}
                      className={`p-3 border-2 rounded-lg transition ${
                        difficulty === diff.value
                          ? `border-${diff.color}-500 bg-${diff.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <p className="text-xs mb-1">{diff.emoji}</p>
                        <p className="text-xs font-medium">{diff.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  {type === 'pergunta' ? 'Pergunta' : 'Tarefa'} *
                </Label>
                <Textarea
                  id="content"
                  placeholder={
                    type === 'pergunta'
                      ? 'Ex: Qual foi a primeira vez que você sentiu algo especial por alguém?'
                      : 'Ex: Faça uma massagem relaxante no pescoço do seu parceiro por 2 minutos.'
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={createUserCard.isPending || success}
                  rows={4}
                  maxLength={500}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {content.length}/500 caracteres
                </p>
              </div>

              {/* Preview */}
              {content.trim() && (
                <div className="space-y-2">
                  <Label>Prévia da Carta</Label>
                  <div className="p-4 border-2 border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {type}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {category}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm">{content}</p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={createUserCard.isPending || success}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createUserCard.isPending || success || !content.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {createUserCard.isPending ? 'Criando...' : success ? '✓ Criada!' : 'Criar Carta'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
