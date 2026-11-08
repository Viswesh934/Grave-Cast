import { colors, shadows, typography, animations } from 'groove-ui';

export function TokensShowcase() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="text-4xl font-bold text-grave-bone-100 mb-2 font-serif">
          Design Tokens
        </h1>
        <p className="text-grave-mist-400">
          Grave-UI's folklore and gothic horror token system
        </p>
      </div>

      {/* Archetype Palettes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-grave-bone-100 border-b border-grave-dark-700 pb-3">
          Color Archetypes
        </h2>

        {/* Crypt */}
        <div className="space-y-3">
          <h3 className="text-sm font-mono uppercase tracking-wider text-grave-mist-400">
            The Crypt (Weathered stone, moss, granite)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(colors.crypt).map(([name, hex]) => (
              <div key={name} className="bg-grave-dark-850 p-4 rounded-xl border border-grave-dark-700">
                <div
                  className="h-16 rounded-lg mb-3 shadow-inner border border-white/5"
                  style={{ backgroundColor: hex }}
                />
                <div className="text-sm font-semibold text-grave-bone-100 capitalize">{name}</div>
                <div className="text-xs font-mono text-grave-mist-400">{hex}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sanguine */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-grave-mist-400">
            The Sanguine (Vampiric blood, crimson, coagulated)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(colors.sanguine).map(([name, hex]) => (
              <div key={name} className="bg-grave-dark-850 p-4 rounded-xl border border-grave-dark-700">
                <div
                  className="h-16 rounded-lg mb-3 shadow-inner border border-white/5"
                  style={{ backgroundColor: hex }}
                />
                <div className="text-sm font-semibold text-grave-bone-100 capitalize">{name}</div>
                <div className="text-xs font-mono text-grave-mist-400">{hex}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Witchcraft */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-grave-mist-400">
            The Witchcraft (Cauldron void, witchfire, spectral emerald)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(colors.witchcraft).map(([name, hex]) => (
              <div key={name} className="bg-grave-dark-850 p-4 rounded-xl border border-grave-dark-700">
                <div
                  className="h-16 rounded-lg mb-3 shadow-inner border border-white/5"
                  style={{ backgroundColor: hex }}
                />
                <div className="text-sm font-semibold text-grave-bone-100 capitalize">{name}</div>
                <div className="text-xs font-mono text-grave-mist-400">{hex}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bone */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-grave-mist-400">
            The Ossuary (Ivory, decayed, ash)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(colors.bone).map(([name, hex]) => (
              <div key={name} className="bg-grave-dark-850 p-4 rounded-xl border border-grave-dark-700">
                <div
                  className="h-16 rounded-lg mb-3 shadow-inner border border-white/5"
                  style={{ backgroundColor: hex }}
                />
                <div className="text-sm font-semibold text-grave-bone-100 capitalize">{name}</div>
                <div className="text-xs font-mono text-grave-mist-400">{hex}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shadows */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-grave-bone-100 border-b border-grave-dark-700 pb-3">
          Gothic Shadows & Glows
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="p-6 rounded-xl bg-grave-dark-850 border border-grave-dark-700 text-center"
            style={{ boxShadow: shadows.glows.blood }}
          >
            <div className="font-semibold text-red-400">Blood Glow</div>
            <div className="text-xs text-grave-mist-400 font-mono mt-1">shadows.glows.blood</div>
          </div>
          <div
            className="p-6 rounded-xl bg-grave-dark-850 border border-grave-dark-700 text-center"
            style={{ boxShadow: shadows.glows.eldritch }}
          >
            <div className="font-semibold text-purple-400">Eldritch Glow</div>
            <div className="text-xs text-grave-mist-400 font-mono mt-1">shadows.glows.eldritch</div>
          </div>
          <div
            className="p-6 rounded-xl bg-grave-dark-850 border border-grave-dark-700 text-center"
            style={{ boxShadow: shadows.depths.abyssal }}
          >
            <div className="font-semibold text-grave-bone-200">Abyssal Depth</div>
            <div className="text-xs text-grave-mist-400 font-mono mt-1">shadows.depths.abyssal</div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-grave-bone-100 border-b border-grave-dark-700 pb-3">
          Typography Scale & Inscriptions
        </h2>
        <div className="space-y-4 bg-grave-dark-850 p-6 rounded-xl border border-grave-dark-700">
          <div style={{ fontSize: typography.scale.declaration, fontWeight: typography.weight.bold }}>
            Declaration ({typography.scale.declaration})
          </div>
          <div style={{ fontSize: typography.scale.proclamation, fontWeight: typography.weight.semibold }}>
            Proclamation ({typography.scale.proclamation})
          </div>
          <div style={{ fontSize: typography.scale.chant }}>
            Chant ({typography.scale.chant})
          </div>
          <div style={{ fontSize: typography.scale.speech }}>
            Speech ({typography.scale.speech})
          </div>
          <div style={{ fontSize: typography.scale.whisper }} className="text-grave-mist-400">
            Whisper ({typography.scale.whisper})
          </div>
        </div>
      </section>

      {/* Animations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-grave-bone-100 border-b border-grave-dark-700 pb-3">
          Animation Durations & Timing
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(animations.durations).map(([name, duration]) => (
            <div key={name} className="p-4 rounded-xl bg-grave-dark-850 border border-grave-dark-700">
              <div className="text-sm font-semibold text-grave-bone-100 capitalize">{name}</div>
              <div className="text-xs font-mono text-grave-mist-400">{duration}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
