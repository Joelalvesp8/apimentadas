'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Send } from 'lucide-react';

interface UserListItemProps {
  user: {
    id: string;
    nickname: string;
    bio?: string | null;
    orientation?: string | null;
    sessionsPlayed: number;
    averageRating: number | null;
    user: {
      name: string;
      image?: string | null;
    };
  };
  onConnect: (userId: string) => void;
  onInvite: (userId: string) => void;
}

export function UserListItem({ user, onConnect, onInvite }: UserListItemProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const orientationLabels: Record<string, string> = {
    heterosexual: 'Heterossexual',
    homosexual: 'Homossexual',
    bisexual: 'Bissexual',
    other: 'Outro',
  };

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-zinc-900/50 transition-colors">
      {/* Avatar */}
      <Avatar className="h-12 w-12 border-2 border-red-600/30">
        <AvatarImage src={user.user.image || undefined} alt={user.nickname} />
        <AvatarFallback className="bg-gradient-to-br from-red-900 to-red-950 text-white font-semibold">
          {getInitials(user.user.name)}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-sm truncate">
            @{user.nickname}
          </h3>
          {user.averageRating && user.averageRating >= 4 && (
            <span className="text-xs">⭐</span>
          )}
        </div>
        <p className="text-gray-400 text-xs truncate">
          {user.user.name}
          {user.orientation && ` • ${orientationLabels[user.orientation]}`}
        </p>
        {user.bio && (
          <p className="text-gray-500 text-xs truncate mt-0.5">
            {user.bio}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
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
