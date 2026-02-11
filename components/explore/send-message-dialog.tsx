'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSendDirectMessage } from '@/hooks/useSocial';
import { Loader2, MessageCircle, AlertCircle } from 'lucide-react';

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiverId: string;
  receiverNickname: string;
  onSuccess?: () => void;
}

export function SendMessageDialog({
  open,
  onOpenChange,
  receiverId,
  receiverNickname,
  onSuccess,
}: SendMessageDialogProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const sendMessage = useSendDirectMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!message.trim()) return;

    try {
      await sendMessage.mutateAsync({
        receiverId,
        message: message.trim(),
      });

      // Success - reset and close
      setMessage('');
      setError(null);
      onOpenChange(false);

      // Call success callback to show toast
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);

      // Extract error message
      const errorMsg = error?.response?.data?.error ||
                       error?.message ||
                       'Erro ao enviar mensagem. Tente novamente.';

      setError(errorMsg);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-red-700/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <MessageCircle className="w-5 h-5 text-red-500" />
            Enviar Mensagem
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Envie uma mensagem para <span className="text-red-400 font-semibold">@{receiverNickname}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-700/50 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-200 font-semibold">Erro ao enviar</p>
                <p className="text-xs text-red-300 mt-1">{error}</p>
                {error.includes('migration') || error.includes('table') || error.includes('column') ? (
                  <p className="text-xs text-red-400 mt-2">
                    💡 Execute a migration do banco de dados primeiro. Veja: MIGRATION-DIRECT-MESSAGES.md
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="p-3 bg-blue-950/40 border border-blue-700/50 rounded-md">
            <p className="text-xs text-blue-200">
              💡 <strong>Mensagem única:</strong> Você pode enviar apenas uma mensagem a cada 24 horas
              para usuários sem conexão. Use com sabedoria!
            </p>
          </div>

          {/* Message textarea */}
          <div className="space-y-2">
            <Textarea
              placeholder="Digite sua mensagem... (máximo 500 caracteres)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={6}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus:border-red-600 resize-none"
              disabled={sendMessage.isPending}
            />
            <p className="text-xs text-gray-500 text-right">
              {message.length}/500 caracteres
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={sendMessage.isPending}
              className="border-zinc-700 text-gray-300 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!message.trim() || sendMessage.isPending}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
            >
              {sendMessage.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
