export function Concept() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
          Não é sobre sexo.
          <br />
          <span className="text-gray-400">
            É sobre o que ninguém tem coragem de perguntar.
          </span>
        </h2>

        <div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
          <p>
            <strong className="text-white">Apimentadas</strong> é um jogo de perguntas que provoca conversas reais.
          </p>

          <p>
            Sem vulgaridade. Sem obrigação.
            <br />
            Apenas <span className="text-red-400">curiosidade</span>, <span className="text-red-400">tensão</span> e <span className="text-red-400">verdade</span>.
          </p>

          <div className="pt-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {['Desejos', 'Limites', 'Curiosidades', 'Fantasias', 'Silêncios'].map((item, index) => (
              <div
                key={item}
                className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-red-900/50 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-red-400 font-semibold">{item}</p>
              </div>
            ))}
          </div>

          <p className="pt-8 text-gray-400 italic">
            Aqui, o silêncio também responde.
            <br />
            E cada resposta revela mais do que você imagina.
          </p>
        </div>
      </div>
    </section>
  );
}
