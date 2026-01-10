export function Audience() {
  const audiences = [
    'Está se conhecendo com alguém novo',
    'Prefere conversas profundas ao óbvio',
    'Gosta de tensão no ar',
    'Tem curiosidade pelo que não é dito',
    'Acredita que conexão começa com coragem',
  ];

  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          Para quem é
        </h2>
        <p className="text-center text-gray-400 text-lg mb-16">
          Apimentadas é para quem:
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="group relative p-8 bg-zinc-900/40 border-2 border-zinc-800 rounded-lg hover:border-red-900/60 transition-all duration-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)]"
            >
              {/* Icon */}
              <div className="w-12 h-12 mb-4 bg-red-900/20 border border-red-900/40 rounded-full flex items-center justify-center group-hover:bg-red-900/30 transition-all duration-300">
                <span className="text-2xl">🔥</span>
              </div>

              {/* Text */}
              <p className="text-gray-300 group-hover:text-white transition-colors duration-300 leading-relaxed">
                {audience}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
