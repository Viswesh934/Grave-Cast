import type { Mode } from './graves'

/** One step of what happens to what you paste. `pose` is where the camera looks. */
export interface RitualStep {
  id: string
  label: string
  /** Where this step runs. */
  where: string
  detail: string
  pose: number
}

export const RITUAL: Record<Mode, readonly RitualStep[]> = {
  link: [
    { id: 'paste', label: 'Paste', where: 'You', pose: 0, detail: 'You paste a link someone sent you.' },
    {
      id: 'read',
      label: 'Read',
      where: 'This device',
      pose: 1,
      detail: 'This device reads the address for disguises: text hidden before an \u201c@\u201d, letters from other alphabets, bare numbers, plain http.',
    },
    {
      id: 'visit',
      label: 'Visit',
      where: 'Our server',
      pose: 2,
      detail:
        'Gravecast\u2019s server opens the link once, the way a browser would, without running anything on the page. It follows each forward and reads how the site protects its visitors.',
    },
    {
      id: 'rise',
      label: 'Rise',
      where: 'The yard',
      pose: 4,
      detail: 'Each problem rises as a grave: wrong turns, failed certificates and every protection the site leaves out.',
    },
  ],
  dev: [
    { id: 'paste', label: 'Paste', where: 'You', pose: 0, detail: 'You paste a public GitHub repo, as owner/name or its link.' },
    {
      id: 'dig',
      label: 'Dig',
      where: 'Our server',
      pose: 3,
      detail:
        'Gravecast\u2019s server downloads the repo as it is now and reads its source files. Nothing in the repo is run, and the copy is deleted afterwards.',
    },
    {
      id: 'rise',
      label: 'Rise',
      where: 'The yard',
      pose: 4,
      detail: 'Every TODO, FIXME, HACK and XXX rises as a grave, most serious first, each with a link to its line. Open issues deepen the drone.',
    },
  ],
}