export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">
          Jogo Adulto Gamificado
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Aplicação web PWA para casais, trios e grupos
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
          >
            Entrar
          </a>
          <a
            href="/register"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition"
          >
            Criar Conta
          </a>
        </div>
      </div>
    </main>
  );
}
