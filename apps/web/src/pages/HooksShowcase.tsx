export function HooksShowcase() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">🪝 Hooks</h1>
      <p className="text-stone-400 mb-8">Reusable React hooks</p>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold">useHorrorHover</h2>
          <p className="text-stone-400">Hover state with optional Web Audio sound effects</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">useAnimationState</h2>
          <p className="text-stone-400">Animation state management with duration tracking</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">useMediaQuery</h2>
          <p className="text-stone-400">Responsive breakpoint detection</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">useThemeToken</h2>
          <p className="text-stone-400">Access design tokens from JS/TS</p>
        </section>
      </div>
    </div>
  );
}
