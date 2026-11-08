import { useState } from 'react';
import { Card, Button, Badge, playSound, type SoundEffectType } from 'groove-ui';

export function HooksShowcase() {
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);

  const handlePlay = (sound: SoundEffectType) => {
    playSound(sound);
    setLastPlayed(sound);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="text-4xl font-bold text-grave-bone-100 mb-2 font-serif">
          Hooks & Procedural Audio
        </h1>
        <p className="text-grave-mist-400">
          Synthesized procedural sound effects and custom horror UI hooks
        </p>
      </div>

      {/* Web Audio API Synthesizer */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-grave-dark-700 pb-3">
          <h2 className="text-2xl font-bold text-grave-bone-100">
            Procedural Sound Engine
          </h2>
          {lastPlayed && (
            <Badge variant="info" size="sm">
              Played: {lastPlayed}
            </Badge>
          )}
        </div>
        <p className="text-grave-mist-400 text-sm">
          Zero external audio files or MP3 downloads. All sound waves are synthesized directly in the browser with the Web Audio API.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="elevated" className="text-center p-6 space-y-4">
            <div className="w-10 h-10 mx-auto rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-stone-300 font-mono text-xs font-bold">
              HZ-1
            </div>
            <div>
              <h3 className="font-bold text-grave-bone-100">Stone Grind</h3>
              <p className="text-xs text-grave-mist-400 mt-1">Filtered brown noise bandpass sweep</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => handlePlay('stoneGrind')}
            >
              Play Sound
            </Button>
          </Card>

          <Card variant="elevated" className="text-center p-6 space-y-4">
            <div className="w-10 h-10 mx-auto rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-red-400 font-mono text-xs font-bold">
              HZ-2
            </div>
            <div>
              <h3 className="font-bold text-grave-bone-100">Coffin Creak</h3>
              <p className="text-xs text-grave-mist-400 mt-1">Modulated square wave with pitch drop</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => handlePlay('coffinCreak')}
            >
              Play Sound
            </Button>
          </Card>

          <Card variant="elevated" className="text-center p-6 space-y-4">
            <div className="w-10 h-10 mx-auto rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-amber-300 font-mono text-xs font-bold">
              HZ-3
            </div>
            <div>
              <h3 className="font-bold text-grave-bone-100">Bone Click</h3>
              <p className="text-xs text-grave-mist-400 mt-1">Sharp transient high-frequency snap</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => handlePlay('boneClick')}
            >
              Play Sound
            </Button>
          </Card>

          <Card variant="elevated" className="text-center p-6 space-y-4">
            <div className="w-10 h-10 mx-auto rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
              HZ-4
            </div>
            <div>
              <h3 className="font-bold text-grave-bone-100">Cauldron Bubble</h3>
              <p className="text-xs text-grave-mist-400 mt-1">Frequency swept resonant pop</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => handlePlay('cauldronBubble')}
            >
              Play Sound
            </Button>
          </Card>
        </div>
      </section>

      {/* Available React Hooks */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-grave-bone-100 border-b border-grave-dark-700 pb-3">
          Custom Horror Hooks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="outlined" className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-base font-bold text-purple-400">useHorrorHover</h3>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <p className="text-sm text-grave-mist-300">
              Tracks hover duration and automatically triggers procedural horror audio cues (stone grinds, whispers) on hover-intent.
            </p>
          </Card>

          <Card variant="outlined" className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-base font-bold text-purple-400">useAnimationState</h3>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <p className="text-sm text-grave-mist-300">
              Coordinates multi-stage supernatural animations (manifest, linger, fade) with ease curves from the design tokens.
            </p>
          </Card>

          <Card variant="outlined" className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-base font-bold text-purple-400">useAudio</h3>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <p className="text-sm text-grave-mist-300">
              Access the global audio context to mute/unmute, adjust master volume, or dispatch procedural sound events.
            </p>
          </Card>

          <Card variant="outlined" className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-base font-bold text-purple-400">useThemeToken</h3>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <p className="text-sm text-grave-mist-300">
              Programmatic JS access to theme tokens for dynamic canvas, WebGL/Three.js, or SVG filter effects.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
