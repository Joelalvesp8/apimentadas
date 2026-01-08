import { useEffect, useState } from 'react';

export type NotificationPermission = 'default' | 'granted' | 'denied';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      return result as NotificationPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  };

  const showNotification = (
    title: string,
    options?: NotificationOptions
  ): Notification | null => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Cannot show notification: not supported or permission denied');
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options,
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  };

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  };
}

// Helper function to show game notifications
export function useGameNotifications() {
  const { isSupported, permission, requestPermission, showNotification } = useNotifications();

  const notifyYourTurn = (roundNumber: number) => {
    showNotification('🎴 Sua vez de virar!', {
      body: `É sua vez de virar a carta na rodada #${roundNumber}. Clique para jogar!`,
      tag: 'your-turn',
      requireInteraction: true,
    });
  };

  const notifyQuestionReady = (roundNumber: number, playerName: string) => {
    showNotification('❓ Nova pergunta disponível!', {
      body: `${playerName} virou a carta. Rodada #${roundNumber} pronta para responder!`,
      tag: 'question-ready',
    });
  };

  const notifyRoundCompleted = (roundNumber: number) => {
    showNotification('✅ Rodada completa!', {
      body: `Todos responderam na rodada #${roundNumber}. Veja as respostas!`,
      tag: 'round-completed',
    });
  };

  const notifyWaitingForAnswers = (waitingCount: number, roundNumber: number) => {
    showNotification('⏳ Aguardando respostas', {
      body: `${waitingCount} ${waitingCount === 1 ? 'pessoa ainda não respondeu' : 'pessoas ainda não responderam'} na rodada #${roundNumber}`,
      tag: 'waiting-answers',
    });
  };

  return {
    isSupported,
    permission,
    requestPermission,
    notifyYourTurn,
    notifyQuestionReady,
    notifyRoundCompleted,
    notifyWaitingForAnswers,
  };
}
