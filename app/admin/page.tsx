'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, ShoppingCart, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  // Fetch statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [waitlistRes, usersRes, cardsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/waitlist'),
        fetch('/api/admin/users-stats'),
        fetch('/api/admin/cards-stats'),
        fetch('/api/admin/orders-stats'),
      ]);

      const waitlist = waitlistRes.ok ? await waitlistRes.json() : { data: [] };
      const users = usersRes.ok ? await usersRes.json() : { data: { total: 0, approved: 0 } };
      const cards = cardsRes.ok ? await cardsRes.json() : { data: { pending: 0, total: 0 } };
      const orders = ordersRes.ok ? await ordersRes.json() : { data: { pending: 0, total: 0 } };

      return {
        waitlist: {
          total: waitlist.data?.length || 0,
          pending: waitlist.data?.filter((w: any) => w.status === 'pending').length || 0,
          approved: waitlist.data?.filter((w: any) => w.status === 'approved').length || 0,
          rejected: waitlist.data?.filter((w: any) => w.status === 'rejected').length || 0,
        },
        users: users.data || { total: 0, approved: 0 },
        cards: cards.data || { pending: 0, total: 0 },
        orders: orders.data || { pending: 0, total: 0 },
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-lg">Carregando estatísticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-400">
          Visão geral do sistema Apimentadas
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Waitlist Card */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Lista de Espera
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.waitlist.pending || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.waitlist.total || 0} total • {stats?.waitlist.approved || 0} aprovados
            </p>
            <Link href="/admin/usuarios#waitlist">
              <Button variant="link" size="sm" className="text-red-400 hover:text-red-300 px-0 mt-2">
                Ver todos →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Usuários Ativos
            </CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.users.approved || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.users.total || 0} cadastrados no sistema
            </p>
            <Link href="/admin/usuarios#active">
              <Button variant="link" size="sm" className="text-red-400 hover:text-red-300 px-0 mt-2">
                Gerenciar →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Cards Pending Card */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Cartas Pendentes
            </CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.cards.pending || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.cards.total || 0} cartas no sistema
            </p>
            <Link href="/admin/cartas">
              <Button variant="link" size="sm" className="text-red-400 hover:text-red-300 px-0 mt-2">
                Revisar →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-red-700/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Pedidos Pendentes
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.orders.pending || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.orders.total || 0} pedidos total
            </p>
            <Link href="/admin/vendas#orders">
              <Button variant="link" size="sm" className="text-red-400 hover:text-red-300 px-0 mt-2">
                Ver pedidos →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/usuarios">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-red-700/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all cursor-pointer">
              <CardContent className="flex items-center space-x-4 p-6">
                <div className="bg-red-600/20 p-3 rounded-lg">
                  <UserCheck className="h-8 w-8 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Aprovar Usuários</h3>
                  <p className="text-sm text-gray-400">Lista de espera</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/cartas">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-red-700/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all cursor-pointer">
              <CardContent className="flex items-center space-x-4 p-6">
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Revisar Cartas</h3>
                  <p className="text-sm text-gray-400">Aprovar ou rejeitar</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/vendas">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-red-700/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all cursor-pointer">
              <CardContent className="flex items-center space-x-4 p-6">
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <ShoppingCart className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Gerenciar Vendas</h3>
                  <p className="text-sm text-gray-400">Produtos e pedidos</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
