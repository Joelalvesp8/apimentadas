'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Star, Users } from 'lucide-react';

interface UserCardProps {
  user: {
    id: string;
    nickname: string;
    bio?: string | null;
    orientation?: string | null;
    sessionsPlayed: number;
    averageRating: number | null;
    image?: string | null;
    connectionStatus: string;
  };
  onConnect: (userId: string) => void;
  onInvite: (userId: string) => void;
}

const orientationLabels: Record<string, string> = {
  heterosexual: 'Heterossexual',
  homosexual: 'Homossexual',
  bisexual: 'Bissexual',
  other: 'Outro',
};

export function UserCard({ user, onConnect, onInvite }: UserCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect(user.id);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInvite = async () => {
    setIsInviting(true);
    try {
      await onInvite(user.id);
    } finally {
      setIsInviting(false);
    }
  };

  const getConnectionButtonLabel = () => {
    switch (user.connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'pending_sent':
        return 'Solicitação enviada';
      case 'pending_received':
        return 'Aceitar conexão';
      default:
        return 'Conectar';
    }
  };

  const isConnectionDisabled = user.connectionStatus === 'connected' || user.connectionStatus === 'pending_sent';

  return (
    <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-2 border-red-700/30 hover:border-red-600/50 transition-all">
      <CardContent className="p-6">
        {/* User Image and Name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.nickname}
                width={80}
                height={80}
                className="rounded-full border-2 border-red-600/50"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center border-2 border-red-600/50">
                <span className="text-white text-2xl font-bold">
                  {user.nickname.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {/* Online status indicator */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900" />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{user.nickname}</h3>
            {user.orientation && (
              <Badge variant="outline" className="border-red-600/50 text-red-400">
                {orientationLabels[user.orientation] || user.orientation}
              </Badge>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-black/40 rounded-lg border border-red-700/20">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-xs text-gray-400">Sessões</p>
              <p className="text-white font-bold">{user.sessionsPlayed}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-xs text-gray-400">Avaliação</p>
              <div className="flex items-center gap-1">
                <p className="text-white font-bold">
                  {user.averageRating ? user.averageRating.toFixed(1) : 'N/A'}
                </p>
                {user.averageRating && (
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleConnect}
            disabled={isConnecting || isConnectionDisabled}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50"
            size="sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isConnecting ? 'Conectando...' : getConnectionButtonLabel()}
          </Button>
          <Button
            onClick={handleInvite}
            disabled={isInviting}
            variant="outline"
            className="flex-1 border-red-600/50 text-red-400 hover:bg-red-600/10"
            size="sm"
          >
            <Mail className="w-4 h-4 mr-2" />
            {isInviting ? 'Enviando...' : 'Convidar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
