export function Suspense() {
  return (
    <section className="relative py-32 px-6 bg-black overflow-hidden">
      {/* Background Image with Strong Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{
          backgroundImage: 'url(/couple-smiling.jpg)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
          Algumas perguntas mudam tudo.
          <br />
          <span className="text-gray-400">
            Você está pronto para ouvir as respostas?
          </span>
        </h2>
      </div>
    </section>
  );
}
