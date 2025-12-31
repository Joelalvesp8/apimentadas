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
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
          <CardHeader>
            <CardTitle className="text-3xl text-white drop-shadow-[0_0_10px_rgba(220,38,38,0.4)]">🎴 Criar Nova Carta</CardTitle>
            <CardDescription className="text-gray-400">
              Crie sua própria carta personalizada para o jogo Apimentadas!
              <br />
              <span className="text-sm text-red-400">
                ⚠️ Sua carta será revisada por um administrador antes de ser aprovada
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-200 bg-red-950/80 border-2 border-red-700/60 rounded-md shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-green-300 bg-green-950/50 border-2 border-green-700/50 rounded-md">
                  ✅ Carta criada com sucesso! Aguardando aprovação do administrador.
                  <br />
                  Redirecionando para o dashboard...
                </div>
              )}

              {/* Type Selection */}
              <div className="space-y-2">
                <Label className="text-gray-200 font-medium">Tipo de Carta *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('pergunta')}
                    className={`p-4 border-2 rounded-lg transition-all duration-300 ${
                      type === 'pergunta'
                        ? 'border-red-700/60 bg-zinc-900/70 shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                        : 'border-zinc-700/40 bg-zinc-900/40 hover:border-zinc-600/60 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">❓</span>
                      <p className="font-medium text-white">Pergunta</p>
                      <p className="text-xs text-gray-400">
                        Uma pergunta para o outro responder
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('tarefa')}
                    className={`p-4 border-2 rounded-lg transition-all duration-300 ${
                      type === 'tarefa'
                        ? 'border-red-700/60 bg-zinc-900/70 shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                        : 'border-zinc-700/40 bg-zinc-900/40 hover:border-zinc-600/60 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">✨</span>
                      <p className="font-medium text-white">Tarefa</p>
                      <p className="text-xs text-gray-400">
                        Uma tarefa para executar
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label className="text-gray-200 font-medium">Categoria *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['casais', 'trios', 'grupos'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-3 border-2 rounded-lg transition-all duration-300 ${
                        category === cat
                          ? 'border-red-700/60 bg-zinc-900/70 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                          : 'border-zinc-700/40 bg-zinc-900/40 text-gray-300 hover:border-zinc-600/60 hover:bg-zinc-900/60'
                      }`}
                    >
                      <p className="font-medium capitalize">{cat}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-2">
                <Label className="text-gray-200 font-medium">Nível de Apimentada 🌶️</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { value: 'facil', label: 'Leve', emoji: '🌶️' },
                    { value: 'medio', label: 'Média', emoji: '🌶️🌶️' },
                    { value: 'dificil', label: 'Picante', emoji: '🌶️🌶️🌶️' },
                    { value: 'extremo', label: 'Infernal', emoji: '🌶️🌶️🌶️🌶️' },
                  ] as const).map((diff) => (
                    <button
                      key={diff.value}
                      type="button"
                      onClick={() => setDifficulty(diff.value)}
                      className={`p-3 border-2 rounded-lg transition-all duration-300 ${
                        difficulty === diff.value
                          ? 'border-red-700/60 bg-zinc-900/70 shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                          : 'border-zinc-700/40 bg-zinc-900/40 hover:border-zinc-600/60 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="text-center">
                        <p className="text-xs mb-1">{diff.emoji}</p>
                        <p className="text-xs font-medium text-gray-300">{diff.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-gray-200 font-medium">
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
                  className="resize-none bg-zinc-900/90 border-2 border-zinc-700/50 text-white placeholder:text-gray-500 focus:border-red-600/80 focus:ring-2 focus:ring-red-600/30 transition-all duration-300 shadow-inner"
                />
                <p className="text-xs text-gray-500 text-right">
                  {content.length}/500 caracteres
                </p>
              </div>

              {/* Preview */}
              {content.trim() && (
                <div className="space-y-2">
                  <Label className="text-gray-200 font-medium">Prévia da Carta</Label>
                  <div className="p-4 border-2 border-red-700/50 rounded-lg bg-zinc-900/70 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize bg-red-900/40 border-red-700/50 text-red-200">
                        {type}
                      </Badge>
                      <Badge variant="secondary" className="capitalize bg-red-900/40 border-red-700/50 text-red-200">
                        {category}
                      </Badge>
                      <Badge variant="secondary" className="capitalize bg-red-900/40 border-red-700/50 text-red-200">
                        {difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-200">{content}</p>
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
                  className="flex-1 bg-zinc-900/60 border-2 border-zinc-700/50 text-gray-300 hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createUserCard.isPending || success || !content.trim()}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] transition-all duration-500 border-2 border-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
