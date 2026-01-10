export function Mood() {
  const moods = [
    'Perguntas que aceleram o coração',
    'Respostas que mudam a percepção',
    'Limites respeitados, curiosidade estimulada',
    'Nada é forçado. Tudo é escolha.',
    'O desconforto faz parte da experiência',
  ];

  return (
    <section className="relative py-32 px-6 bg-black overflow-hidden">
      {/* Background Image with Strong Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: 'url(/cards-wine.png)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
          O clima do jogo
        </h2>

        <div className="space-y-6">
          {moods.map((mood, index) => (
            <div
              key={index}
              className="group p-6 bg-gradient-to-r from-zinc-900/60 to-zinc-950/60 border-l-4 border-red-700/50 hover:border-red-600 transition-all duration-300 hover:bg-zinc-900/80"
            >
              <p className="text-lg md:text-xl text-gray-300 group-hover:text-white transition-colors duration-300">
                {mood}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
