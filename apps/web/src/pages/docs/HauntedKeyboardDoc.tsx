import { useEffect, useRef, useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import {
  HauntedKeyboard,
  useSpookyMusic,
  SCALE_NAMES,
  INSTRUMENT_NAMES,
  type ScaleName,
  type InstrumentName,
  type Tuning,
  type NoteSystem,
  type VoiceHandle,
} from 'groove-ui';

const TONICS = ['A2', 'C3', 'D3', 'E3', 'G3'];
const TUNINGS: Tuning[] = ['equal', 'just'];
const LABEL_SYSTEMS: NoteSystem[] = ['sargam', 'solfege', 'letters'];

/** Seconds between notes when auditioning the scale. */
const SCALE_PREVIEW_INTERVAL = 0.28;

const selectClass =
  'w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-[#102219] text-stone-200 border border-[#1b3a2a] focus:outline-none focus:border-emerald-600/80 cursor-pointer';

const buttonClass =
  'px-3 py-1.5 text-xs rounded-xl font-mono transition-all cursor-pointer border';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">{label}</span>
      {children}
    </label>
  );
}

export function HauntedKeyboardDoc() {
  const [scale, setScale] = useState<ScaleName>('todi');
  const [instrument, setInstrument] = useState<InstrumentName>('glass');
  const [tuning, setTuning] = useState<Tuning>('equal');
  const [tonic, setTonic] = useState('D3');
  const [labelSystem, setLabelSystem] = useState<NoteSystem>('sargam');
  const [sustain, setSustain] = useState(false);
  const [droneOn, setDroneOn] = useState(false);

  // A second synth with the same settings powers the audition buttons.
  const music = useSpookyMusic({ scale, tonic, tuning, instrument });
  const droneRef = useRef<VoiceHandle | null>(null);

  // The drone is re-created whenever the settings change, so it stays in tune.
  useEffect(() => {
    if (!droneOn) return undefined;
    droneRef.current = music.drone();
    return () => {
      droneRef.current?.stop();
      droneRef.current = null;
    };
  }, [droneOn, music]);

  const playScale = () => {
    const notes = Array.from({ length: music.scale.size + 1 }, (_, index) => music.scale.degree(index));
    music.arpeggio(notes, { interval: SCALE_PREVIEW_INTERVAL });
  };

  const codeSnippet = `import { HauntedKeyboard, useSpookyMusic } from 'groove-ui';

// 1. Drop in a keyboard. Every key is locked to the scale,
//    so anything you mash sounds in key.
<HauntedKeyboard
  scale="${scale}"
  tonic="${tonic}"
  tuning="${tuning}"
  instrument="${instrument}"
  labelSystem="${labelSystem}"${sustain ? '\n  sustain' : ''}
/>

// 2. Or use the music system directly in any component.
const music = useSpookyMusic({ scale: '${scale}', tonic: '${tonic}', instrument: '${instrument}' });

music.note('Sa');                  // sargam
music.note('Pa-');                 // a fifth, one octave down
music.note('Do');                  // solfege works too
music.note('C4');                  // so do absolute letters
music.degree(4);                   // fifth note of the scale
music.chordOnDegree(0);            // tonic triad
music.phrase([{ note: 'Sa' }, { note: 'Pa' }, { note: 'Sa+', beats: 2 }]);
const drone = music.drone();       // Sa + Pa tanpura, hold until...
drone?.stop();`;

  return (
    <ComponentDocPage
      title="HauntedKeyboard"
      category="The Effects"
      description="A keyboard where every key plays a note from a scale. Built on Grave-UI's music system: sargam, solfege and letter notation, scales and ragas, just or equal tuning, and instruments defined as data. Pick a dark scale and anything you press sounds in key."
      packageName="haunted-keyboard"
      gothicPhilosophy={{
        influence: 'Ragas, Church Organs & Restless Spirits',
        movement: 'Scale-Locked Notes & Glowing Keys',
      }}
      preview={
        <div className="w-full max-w-3xl space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Scale">
              <select className={selectClass} value={scale} onChange={(e) => setScale(e.target.value as ScaleName)}>
                {SCALE_NAMES.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </Field>
            <Field label="Instrument">
              <select className={selectClass} value={instrument} onChange={(e) => setInstrument(e.target.value as InstrumentName)}>
                {INSTRUMENT_NAMES.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </Field>
            <Field label="Tonic (Sa)">
              <select className={selectClass} value={tonic} onChange={(e) => setTonic(e.target.value)}>
                {TONICS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </Field>
            <Field label="Tuning">
              <select className={selectClass} value={tuning} onChange={(e) => setTuning(e.target.value as Tuning)}>
                {TUNINGS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </Field>
            <Field label="Key labels">
              <select className={selectClass} value={labelSystem} onChange={(e) => setLabelSystem(e.target.value as NoteSystem)}>
                {LABEL_SYSTEMS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </Field>
            <Field label="Hold">
              <button
                type="button"
                aria-pressed={sustain}
                onClick={() => setSustain(!sustain)}
                className={`${buttonClass} w-full ${
                  sustain
                    ? 'bg-emerald-950/80 text-emerald-200 border-emerald-600/80 font-bold'
                    : 'bg-[#102219] text-stone-300 border-[#1b3a2a] hover:text-white'
                }`}
              >
                Sustain: {sustain ? 'ON' : 'OFF'}
              </button>
            </Field>
          </div>

          <div className="flex justify-center overflow-x-auto py-2">
            <HauntedKeyboard
              scale={scale}
              tonic={tonic}
              tuning={tuning}
              instrument={instrument}
              labelSystem={labelSystem}
              sustain={sustain}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={playScale}
              className={`${buttonClass} bg-[#102219] text-emerald-300 border-[#1b3a2a] hover:text-white`}
            >
              Play the scale
            </button>
            <button
              type="button"
              aria-pressed={droneOn}
              onClick={() => setDroneOn(!droneOn)}
              className={`${buttonClass} ${
                droneOn
                  ? 'bg-emerald-950/80 text-emerald-200 border-emerald-600/80 font-bold'
                  : 'bg-[#102219] text-stone-300 border-[#1b3a2a] hover:text-white'
              }`}
            >
              Drone (Sa + Pa): {droneOn ? 'ON' : 'OFF'}
            </button>
          </div>

          <p className="text-center text-xs text-stone-400 font-mono">
            Click the keys or type on your keyboard. Bottom row is the lowest octave. Try todi, marwa or phrygian with the ghost or bell.
          </p>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'scale', type: 'ScaleName | number[]', default: "'minor'", description: 'Built-in scale or raga, or custom semitone offsets' },
        { name: 'tonic', type: 'string | number', default: "'C3'", description: 'Sa / Do as a letter note or MIDI number' },
        { name: 'tuning', type: "'equal' | 'just'", default: "'equal'", description: 'Equal temperament, or just intonation measured from the tonic' },
        { name: 'instrument', type: 'InstrumentName | InstrumentDefinition', default: "'bell'", description: 'Built-in instrument or a custom recipe' },
        { name: 'volume', type: 'number', default: '0.5', description: 'Loudness from 0 to 1' },
        { name: 'labelSystem', type: "'sargam' | 'solfege' | 'letters'", default: "'sargam'", description: 'How keys are named' },
        { name: 'sustain', type: 'boolean', default: 'false', description: 'Hold each note while its key is down' },
        { name: 'duration', type: 'number', default: '0.6', description: 'Seconds each note sounds when sustain is off' },
        { name: 'rows', type: 'string[]', default: "['zxcvbnm', 'asdfghjkl', ...]", description: 'Key rows, bottom first. Each row climbs one octave' },
        { name: 'octaveShift', type: 'number', default: '0', description: 'Shift the whole keyboard by octaves' },
        { name: 'enabled', type: 'boolean', default: 'true', description: 'Listen for physical key presses' },
        { name: 'ignoreEditable', type: 'boolean', default: 'true', description: 'Skip presses made inside inputs and textareas' },
        { name: 'showLabels', type: 'boolean', default: 'true', description: 'Show the note name on each key' },
        { name: 'onKeystroke', type: '(stroke: HauntedKeystroke) => void', default: '—', description: 'Called when a key sounds. Use it to drive sparks or shakes' },
      ]}
      prevPage={{ title: 'HorrorCursor', path: '/docs/components/horror-cursor' }}
      nextPage={{ title: 'Button', path: '/docs/components/button' }}
    />
  );
}
