'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  FileText,
  ShoppingCart,
  UserCheck,
  Clock,
  CheckCircle,
  Gamepad2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [waitlistRes, usersRes, cardsRes, ordersRes, sessionsRes] = await Promise.all([
        fetch('/api/admin/waitlist'),
        fetch('/api/admin/users-stats'),
        fetch('/api/admin/cards-stats'),
        fetch('/api/admin/orders-stats'),
        fetch('/api/admin/sessions-stats'),
      ]);

      const waitlist = waitlistRes.ok ? await waitlistRes.json() : { data: [] };
      const users = usersRes.ok ? await usersRes.json() : { data: { total: 0, approved: 0 } };
      const cards = cardsRes.ok ? await cardsRes.json() : { data: { pending: 0, total: 0 } };
      const orders = ordersRes.ok ? await ordersRes.json() : { data: { pending: 0, total: 0 } };
      const sessions = sessionsRes.ok
        ? await sessionsRes.json()
        : { data: { totalSessions: 0, activeSessions: 0, neverPlayedCount: 0 } };

      return {
        waitlist: {
          total: waitlist.data?.length || 0,
          pending: waitlist.data?.filter((w: any) => w.status === 'pending').length || 0,
          approved: waitlist.data?.filter((w: any) => w.status === 'approved').length || 0,
        },
        users: users.data || { total: 0, approved: 0 },
        cards: cards.data || { pending: 0, total: 0 },
        orders: orders.data || { pending: 0, total: 0 },
        sessions: sessions.data || { totalSessions: 0, activeSessions: 0, neverPlayedCount: 0 },
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400 text-sm">Visão geral do sistema Apimentadas</p>
      </div>

      {/* Statistics Grid — 2 cols on mobile, 3 on md, auto on lg */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {/* Waitlist Card */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_20px_rgba(220,38,38,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-gray-300">Lista de Espera</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-white">{stats?.waitlist.pending || 0}</div>
            <p className="text-xs text-gray-500 mt-0.5">
              {stats?.waitlist.total || 0} total
            </p>
            <Link href="/admin/usuarios#waitlist">
              <Button variant="link" size="sm" className="text-red-400 hover:text-red-300 px-0 mt-2 h-auto text-xs">
                Ver todos →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_20px_rgba(220,38,38,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-gray-300">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-green-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-white">{stats?.users.approved || 0}</div>
            <p className="text-xs text-gray-500 mt-0.5">
              {stats?.users.total || 0} cadastrados
            </p>
            <Link href="/admin/usuarios">
              <Button variant="link" size="sm" className="text-red-400 hover:text-red-300 px-0 mt-2 h-auto text-xs">
                Gerenciar →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Sessions Card */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_20px_rgba(220,38,38,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-gray-300">Sessões</CardTitle>
            <Gamepad2 className="h-4 w-4 text-red-400 shrink-0" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-white">
              {stats?.sessions.totalSessions || 0}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {stats?.sessions.activeSessions || 0} ativas •{' '}
              <span className="text-yellow-600">
                {stats?.sessions.neverPlayedCount || 0} sem jogo
              </span>
            </p>
            <Link href="/admin/sessoes">
              <Button variant="link" size="sm" className="text-red-400 hover:text-red-300 px-0 mt-2 h-auto text-xs">
                Ver sessões →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Cards Pending */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_20px_rgba(220,38,38,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-gray-300">Cartas Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-blue-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-white">{stats?.cards.pending || 0}</div>
            <p className="text-xs text-gray-500 mt-0.5">
              {stats?.cards.total || 0} no sistema
            </p>
            <Link href="/admin/cartas">
              <Button variant="link" size="sm" className="text-red-400 hover:text-red-300 px-0 mt-2 h-auto text-xs">
                Revisar →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_20px_rgba(220,38,38,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-gray-300">Pedidos Pendentes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-white">{stats?.orders.pending || 0}</div>
            <p className="text-xs text-gray-500 mt-0.5">
              {stats?.orders.total || 0} pedidos total
            </p>
            <Link href="/admin/vendas">
              <Button variant="link" size="sm" className="text-red-400 hover:text-red-300 px-0 mt-2 h-auto text-xs">
                Ver pedidos →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/admin/usuarios">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-red-700/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all cursor-pointer">
              <CardContent className="flex items-center space-x-3 p-4">
                <div className="bg-red-600/20 p-2.5 rounded-lg shrink-0">
                  <UserCheck className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Aprovar Usuários</h3>
                  <p className="text-xs text-gray-400">Lista de espera</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/sessoes">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-red-700/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all cursor-pointer">
              <CardContent className="flex items-center space-x-3 p-4">
                <div className="bg-red-600/20 p-2.5 rounded-lg shrink-0">
                  <Gamepad2 className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Ver Sessões</h3>
                  <p className="text-xs text-gray-400">Histórico e engajamento</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/cartas">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-red-700/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all cursor-pointer">
              <CardContent className="flex items-center space-x-3 p-4">
                <div className="bg-blue-600/20 p-2.5 rounded-lg shrink-0">
                  <CheckCircle className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Revisar Cartas</h3>
                  <p className="text-xs text-gray-400">Aprovar ou rejeitar</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/vendas">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-red-700/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all cursor-pointer">
              <CardContent className="flex items-center space-x-3 p-4">
                <div className="bg-purple-600/20 p-2.5 rounded-lg shrink-0">
                  <ShoppingCart className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Gerenciar Vendas</h3>
                  <p className="text-xs text-gray-400">Produtos e pedidos</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
