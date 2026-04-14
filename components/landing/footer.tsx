import { Flame } from 'lucide-react';

export function FooterMinimal() {
  return (
    <footer className="relative py-12 px-6 bg-black border-t border-zinc-900">
      <div className="max-w-6xl mx-auto text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-xl">
          <Flame className="w-8 h-8 text-red-500" aria-hidden="true" />
          <span className="text-white font-bold">APIMENTADAS</span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Apimentadas</p>
          <span className="hidden md:inline">·</span>
          <p>Jogo para maiores de 18 anos</p>
          <span className="hidden md:inline">·</span>
          <p className="text-red-500">Conexões começam com respeito</p>
        </div>
      </div>
    </footer>
  );
}
