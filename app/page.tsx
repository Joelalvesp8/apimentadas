import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-6xl">🌶️</span>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              APIMENTADAS
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            🔥 Esquente sua relação! Jogo adulto picante para casais, trios e grupos 🔥
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Criar Conta Grátis
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                Entrar
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>80+ Cartas</CardTitle>
              <CardDescription>
                Perguntas e tarefas para todos os níveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                De fácil a extremo, com categorias para casais, trios e grupos.
                Crie suas próprias cartas personalizadas!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sistema de Rating</CardTitle>
              <CardDescription>
                Avalie cada experiência de 0 a 5 estrelas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acompanhe suas estatísticas e veja suas sessões favoritas.
                Descubra o que funciona melhor para você!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rede Social</CardTitle>
              <CardDescription>
                Conecte-se com outros usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Adicione amigos, crie sessões privadas e compartilhe momentos
                especiais com quem você confia.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-pink-100 to-purple-100 border-none">
            <CardHeader>
              <CardTitle className="text-2xl">
                Pronto para começar?
              </CardTitle>
              <CardDescription className="text-base">
                Crie sua conta gratuitamente e comece a jogar em minutos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/register">
                <Button size="lg" className="px-12">
                  Começar Agora
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
