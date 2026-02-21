'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Send, MessageCircle } from 'lucide-react';

export interface ExploreUserData {
  id: string;
  nickname: string;
  image?: string | null;
  bio?: string | null;
  orientation?: string | null;
  sex?: string | null;
  sessionsPlayed: number;
  averageRating: number | null;
  connectionStatus?: 'none' | 'pending_sent' | 'pending_received' | 'connected';
}

interface UserListItemProps {
  user: ExploreUserData;
  onConnect: (userId: string) => void;
  onInvite: (userId: string) => void;
  onMessage: (userId: string, nickname: string) => void;
  onPreview?: (user: ExploreUserData) => void;
}

export function UserListItem({ user, onConnect, onInvite, onMessage, onPreview }: UserListItemProps) {
  const getInitials = (nickname: string) => {
    // Get first 2 characters of nickname
    return nickname.substring(0, 2).toUpperCase();
  };

  const orientationLabels: Record<string, string> = {
    heterosexual: 'Heterossexual',
    homosexual: 'Homossexual',
    bisexual: 'Bissexual',
    other: 'Outro',
  };

  const sexLabels: Record<string, string> = {
    male: 'Homem',
    female: 'Mulher',
  };

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-zinc-900/50 transition-colors">
      {/* Avatar */}
      <button onClick={() => onPreview?.(user)} className="shrink-0 rounded-full focus:outline-none">
        <Avatar className="h-12 w-12 border-2 border-red-600/30 hover:border-red-500/60 transition-colors">
          <AvatarImage src={user.image || undefined} alt={user.nickname} />
          <AvatarFallback className="bg-gradient-to-br from-red-900 to-red-950 text-white font-semibold">
            {getInitials(user.nickname)}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <button onClick={() => onPreview?.(user)} className="focus:outline-none">
            <h3 className="text-white font-semibold text-sm truncate hover:text-red-300 transition-colors">
              @{user.nickname}
            </h3>
          </button>
          {user.averageRating && user.averageRating >= 4 && (
            <span className="text-xs">⭐</span>
          )}
        </div>
        <p className="text-gray-400 text-xs">
          {user.sex && sexLabels[user.sex]}
          {user.sex && user.orientation && ' • '}
          {user.orientation && orientationLabels[user.orientation]}
        </p>
        {user.bio && (
          <p className="text-gray-500 text-xs truncate mt-0.5">
            {user.bio}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Message button - only show for users without connection */}
        {user.connectionStatus === 'none' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMessage(user.id, user.nickname)}
            className="text-blue-400 hover:bg-blue-950/30 hover:text-blue-300 text-xs h-8 px-2"
            title="Enviar mensagem única"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onConnect(user.id)}
          className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white text-xs h-8 px-3"
        >
          <UserPlus className="w-3 h-3 mr-1" />
          Conectar
        </Button>
        <Button
          size="sm"
          onClick={() => onInvite(user.id)}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs h-8 px-3"
        >
          <Send className="w-3 h-3 mr-1" />
          Convidar
        </Button>
      </div>
    </div>
  );
}
