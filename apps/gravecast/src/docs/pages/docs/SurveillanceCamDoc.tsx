import { useEffect, useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { Field, Section } from '../../components/docs/DocControls';
import { chip, inputClass, selectClass } from '../../components/docs/docStyles';
import { useDemoFeed } from '../../hooks/useDemoFeed';
import {
  AsciiVideo,
  Button,
  CAM_GRADES,
  SurveillanceCam,
  useMediaStream,
  type CamGrade,
  type HorrorIntensity,
  type MotionSensitivity,
} from 'groove-ui';

type VideoSource = 'demo' | 'camera';

const INTENSITIES: HorrorIntensity[] = ['ghastly', 'cursed', 'abyssal'];
const SENSITIVITIES: MotionSensitivity[] = ['low', 'medium', 'high'];

export function SurveillanceCamDoc() {
  const [source, setSource] = useState<VideoSource>('demo');
  const [grade, setGrade] = useState<CamGrade>('vhs');
  const [intensity, setIntensity] = useState<HorrorIntensity>('cursed');
  const [label, setLabel] = useState('HALLWAY');
  const [timestamp, setTimestamp] = useState(true);
  const [rec, setRec] = useState(true);
  const [motion, setMotion] = useState(true);
  const [sensitivity, setSensitivity] = useState<MotionSensitivity>('medium');
  const [animated, setAnimated] = useState(true);
  const [asciiMode, setAsciiMode] = useState(false);
  const [events, setEvents] = useState(0);

  const demo = useDemoFeed(source === 'demo');
  const camera = useMediaStream({ video: { width: 640, height: 480, facingMode: 'user' } });

  // Turn the camera off when switching away from it.
  useEffect(() => {
    if (source !== 'camera') camera.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const stream = source === 'demo' ? demo : camera.stream;
  const mirror = source === 'camera';

  const codeSnippet = `import { SurveillanceCam, AsciiVideo, useMediaStream } from 'groove-ui';

const { stream, start } = useMediaStream({ video: true });

// Nothing touches the camera until you call start().
<button onClick={start}>Open the camera</button>

<SurveillanceCam
  stream={stream}
  label="${label}"
  grade="${grade}"
  intensity="${intensity}"${timestamp ? '' : '\n  timestamp={false}'}${rec ? '' : '\n  rec={false}'}${animated ? '' : '\n  animated={false}'}${mirror ? '\n  mirror' : ''}${motion ? `\n  motion\n  motionSensitivity="${sensitivity}"\n  onMotion={() => console.log('Something moved')}` : ''}${asciiMode ? `
>
  {/* Any picture works inside: a canvas, an image, or text. */}
  <AsciiVideo stream={stream} theme="matrix" cols={64} />
</SurveillanceCam>` : '\n/>'}

// Also available on their own, with no component:
// gradeMatrix('night'), createMotionDetector(), formatCamTimestamp(new Date())`;

  return (
    <ComponentDocPage
      title="SurveillanceCam"
      category="The Effects"
      description="Found footage for any picture. A live stream, a video file, or your own canvas gets lens fringing, scanlines, film grain, dark corners, an occasional glitch, a blinking REC dot, and a running clock. It can also watch for movement. VHS, night vision, infrared, and black and white grades."
      packageName="effects"
      gothicPhilosophy={{
        influence: 'Found Footage, CCTV & Worn Magnetic Tape',
        movement: 'Grain, Tracking Glitches & Blinking Red Dots',
      }}
      preview={
        <div className="w-full max-w-3xl space-y-8">
          <Section title="Picture">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Source">
                <select className={selectClass} value={source} onChange={(e) => setSource(e.target.value as VideoSource)}>
                  <option value="demo">Demo feed</option>
                  <option value="camera">My camera</option>
                </select>
              </Field>
              <Field label="Grade">
                <select className={selectClass} value={grade} onChange={(e) => setGrade(e.target.value as CamGrade)}>
                  {CAM_GRADES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Intensity">
                <select className={selectClass} value={intensity} onChange={(e) => setIntensity(e.target.value as HorrorIntensity)}>
                  {INTENSITIES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Label">
                <input className={inputClass} value={label} maxLength={16} onChange={(e) => setLabel(e.target.value)} />
              </Field>
            </div>

            {source === 'camera' && (
              <div className="flex flex-wrap items-center gap-3">
                {camera.status === 'active' ? (
                  <Button size="sm" variant="secondary" onClick={camera.stop}>Turn camera off</Button>
                ) : (
                  <Button size="sm" variant="gothic" disabled={camera.status === 'requesting'} onClick={() => void camera.start()}>
                    {camera.status === 'requesting' ? 'Waiting for permission...' : 'Turn camera on'}
                  </Button>
                )}
                <p role="status" className={`text-xs ${camera.error ? 'text-red-400' : 'text-stone-400'}`}>
                  {camera.error ?? (camera.status === 'active' ? 'Camera is on. Nothing is recorded or sent.' : 'Camera is off.')}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={timestamp} onClick={() => setTimestamp(!timestamp)} className={chip(timestamp)}>Clock: {timestamp ? 'ON' : 'OFF'}</button>
              <button type="button" aria-pressed={rec} onClick={() => setRec(!rec)} className={chip(rec)}>REC: {rec ? 'ON' : 'OFF'}</button>
              <button type="button" aria-pressed={animated} onClick={() => setAnimated(!animated)} className={chip(animated)}>Grain and glitch: {animated ? 'ON' : 'OFF'}</button>
              <button type="button" aria-pressed={asciiMode} onClick={() => setAsciiMode(!asciiMode)} className={chip(asciiMode)}>As text: {asciiMode ? 'ON' : 'OFF'}</button>
            </div>

            <div className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-[#183425]">
              <SurveillanceCam
                stream={stream}
                label={label || undefined}
                grade={grade}
                intensity={intensity}
                timestamp={timestamp}
                rec={rec}
                animated={animated}
                mirror={mirror}
                motion={motion}
                motionSensitivity={sensitivity}
                onMotion={() => setEvents((n) => n + 1)}
              >
                {asciiMode && <AsciiVideo stream={stream} cols={64} mirror={mirror} theme="matrix" size="sm" decorative />}
              </SurveillanceCam>
            </div>
          </Section>

          <Section title="Motion">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" aria-pressed={motion} onClick={() => setMotion(!motion)} className={chip(motion)}>Watch for movement: {motion ? 'ON' : 'OFF'}</button>
              <div className="w-40">
                <Field label="Sensitivity">
                  <select className={selectClass} value={sensitivity} onChange={(e) => setSensitivity(e.target.value as MotionSensitivity)}>
                    {SENSITIVITIES.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <p className="text-sm text-stone-300">
                Movement started <strong>{events}</strong> time{events === 1 ? '' : 's'}.
              </p>
              <button type="button" onClick={() => setEvents(0)} className={chip(false)}>Reset count</button>
            </div>
            <p className="text-xs text-stone-400">
              {source === 'demo'
                ? 'In the demo feed a figure crosses the hallway every eleven seconds or so.'
                : 'Wave at the camera. Frames are compared on this device and never stored.'}
            </p>
          </Section>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'stream', type: 'MediaStream | null', default: 'null', description: 'A live stream. Pair with useMediaStream. The camera is never opened by the component itself' },
        { name: 'src', type: 'string', default: '—', description: 'A video file address. Ignored when a stream is set' },
        { name: 'children', type: 'ReactNode', default: '—', description: 'Your own picture (canvas, image, AsciiVideo). Motion detection reads the first video, canvas, or image inside' },
        { name: 'grade', type: "'none' | 'vhs' | 'night' | 'infrared' | 'mono'", default: "'vhs'", description: 'The color look, applied by an SVG filter' },
        { name: 'intensity', type: "'ghastly' | 'cursed' | 'abyssal'", default: "'cursed'", description: 'Lens fringing, scanlines, grain, vignette, and glitch strength' },
        { name: 'label', type: 'string', default: "'CAM 01'", description: 'Camera name, also used to describe the picture to screen readers' },
        { name: 'timestamp', type: 'boolean | Date', default: 'true', description: 'The on-screen clock: now, a fixed Date, or hidden' },
        { name: 'rec', type: 'boolean', default: 'true', description: 'Blinking REC dot and a running counter' },
        { name: 'motion', type: 'boolean', default: 'false', description: 'Compare frames and show a MOTION badge (a polite live status)' },
        { name: 'motionSensitivity', type: "'low' | 'medium' | 'high'", default: "'medium'", description: 'How easily movement is noticed' },
        { name: 'onMotion', type: '() => void', default: '—', description: 'Called once each time movement begins' },
        { name: 'mirror', type: 'boolean', default: 'false', description: 'Flip the video left to right. Good for webcams' },
        { name: 'aspectRatio', type: 'string | number', default: "'4 / 3'", description: 'Shape of the picture' },
        { name: 'animated', type: 'boolean', default: 'true', description: 'Allow grain, glitches, and the blinking dot. Reduced-motion users never get them' },
      ]}
      prevPage={{ title: 'ASCII', path: '/docs/components/ascii' }}
      nextPage={{ title: 'Voice', path: '/docs/components/voice' }}
    />
  );
}
