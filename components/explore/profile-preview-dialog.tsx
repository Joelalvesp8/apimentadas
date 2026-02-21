'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Send, MessageCircle, X, Star, GamepadIcon } from 'lucide-react';
import { ExploreUserData } from './user-list-item';

interface ProfilePreviewDialogProps {
  user: ExploreUserData | null;
  onClose: () => void;
  onConnect: (userId: string) => void;
  onInvite: (userId: string) => void;
  onMessage: (userId: string, nickname: string) => void;
}

const orientationLabels: Record<string, string> = {
  heterosexual: 'Heterossexual',
  homosexual: 'Homossexual',
  bisexual: 'Bissexual',
  other: 'Outro',
};

const sexLabels: Record<string, string> = {
  male: '♂ Homem',
  female: '♀ Mulher',
};

const connectionStatusLabel: Record<string, { label: string; color: string }> = {
  connected: { label: 'Conectado', color: 'bg-green-700/30 text-green-300 border-green-700/40' },
  pending_sent: { label: 'Solicitação enviada', color: 'bg-yellow-700/30 text-yellow-300 border-yellow-700/40' },
  pending_received: { label: 'Quer se conectar', color: 'bg-blue-700/30 text-blue-300 border-blue-700/40' },
  none: { label: '', color: '' },
};

export function ProfilePreviewDialog({
  user,
  onClose,
  onConnect,
  onInvite,
  onMessage,
}: ProfilePreviewDialogProps) {
  if (!user) return null;

  const initials = user.nickname.substring(0, 2).toUpperCase();
  const connStatus = connectionStatusLabel[user.connectionStatus ?? 'none'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header gradient */}
        <div className="h-20 rounded-t-2xl bg-gradient-to-br from-red-950/60 to-zinc-900" />

        {/* Avatar */}
        <div className="flex justify-center -mt-10 mb-3">
          <Avatar className="h-20 w-20 border-4 border-zinc-950 ring-2 ring-red-700/40 shadow-xl">
            <AvatarImage src={user.image ?? undefined} alt={user.nickname} />
            <AvatarFallback className="bg-gradient-to-br from-red-900 to-zinc-900 text-white text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info */}
        <div className="px-5 pb-5 text-center">
          <h2 className="text-xl font-bold text-white mb-1">@{user.nickname}</h2>

          <div className="flex flex-wrap gap-1.5 justify-center mb-3">
            {user.sex && (
              <Badge variant="outline" className="border-zinc-700 text-gray-400 text-xs">
                {sexLabels[user.sex] ?? user.sex}
              </Badge>
            )}
            {user.orientation && (
              <Badge variant="outline" className="border-zinc-700 text-gray-400 text-xs">
                {orientationLabels[user.orientation] ?? user.orientation}
              </Badge>
            )}
            {connStatus.label && (
              <Badge variant="outline" className={`text-xs border ${connStatus.color}`}>
                {connStatus.label}
              </Badge>
            )}
          </div>

          {user.bio && (
            <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-3">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <GamepadIcon className="h-4 w-4 text-red-500" />
                <span className="text-lg font-bold text-white">{user.sessionsPlayed}</span>
              </div>
              <p className="text-xs text-gray-500">Sessões</p>
            </div>
            <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-3">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-lg font-bold text-white">
                  {user.averageRating ? user.averageRating.toFixed(1) : '—'}
                </span>
              </div>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {user.connectionStatus === 'none' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { onMessage(user.id, user.nickname); onClose(); }}
                className="flex-1 border border-zinc-700 text-gray-300 hover:bg-zinc-800 text-xs"
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                Mensagem
              </Button>
            )}
            {(user.connectionStatus === 'none' || !user.connectionStatus) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { onConnect(user.id); onClose(); }}
                className="flex-1 border-zinc-700 text-gray-300 hover:bg-zinc-800 text-xs"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Conectar
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => { onInvite(user.id); onClose(); }}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Convidar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
