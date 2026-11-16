/**
 * Kit card B1.3, the recovery position, from docs/KIT_SCRIPTS.md (review: verified).
 * Captions are the script's, word for word, from the cited IFRC guideline.
 * The script's angle, arc and airway arrows aren't drawn yet; a highlight marks the same spot.
 */
import type { DoodleStripSpec } from 'groove-ui/doodle'

/** The prototype notice every kit card carries (docs/KIT_SCRIPTS.md, Review status). */
export const KIT_PROTOTYPE_NOTICE = 'Prototype. Always follow official guidance and your local emergency services.'

const VICTIM_X = 88
const HELPER_X = 158

export const recoveryPosition: DoodleStripSpec = {
  id: 'kit-b1-3-recovery-position',
  title: 'Recovery position',
  review: 'verified',
  source: {
    name: 'IFRC International First Aid, Resuscitation and Education Guidelines 2025',
    url: 'https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025',
  },
  panels: [
    {
      id: 'recovery-1',
      caption:
        'Use only if the person is unresponsive, breathing normally, and has no suspected spinal injury. Kneel beside them and place the arm nearest you at a right angle with palm facing up.',
      description: 'A person lies on their back with one arm out to the side. A helper kneels beside them. The outstretched hand is circled.',
      doodle: {
        id: 'recovery-1',
        figures: [
          { role: 'victim', pose: 'lying_supine_arm_out', x: VICTIM_X },
          { role: 'helper', pose: 'kneeling_beside', x: HELPER_X, facing: 'left' },
        ],
        highlight: { figure: 0, joint: 'handNear' },
      },
    },
    {
      id: 'recovery-2',
      caption:
        'Bring the far arm across their chest and hold the back of that hand against their near cheek. Pull their far knee up until the foot is flat on the ground.',
      description: 'The person lies on their back with the far knee bent up. The helper kneels beside them, guiding. The bent knee is circled.',
      doodle: {
        id: 'recovery-2',
        figures: [
          { role: 'victim', pose: 'lying_knee_bent', x: VICTIM_X },
          { role: 'helper', pose: 'kneeling_guiding', x: HELPER_X, facing: 'left' },
        ],
        highlight: { figure: 0, joint: 'kneeFar' },
      },
    },
    {
      id: 'recovery-3',
      caption:
        'Pull on the bent knee to roll the person onto their side toward you. Tilt their head back slightly to keep the airway open and monitor breathing continuously.',
      description: 'The person lies on their side in the recovery position. The helper kneels beside them, watching. The head is circled.',
      doodle: {
        id: 'recovery-3',
        figures: [
          { role: 'victim', pose: 'lying_recovery', x: VICTIM_X },
          { role: 'helper', pose: 'kneeling_monitoring', x: HELPER_X, facing: 'left' },
        ],
        highlight: { figure: 0, joint: 'head' },
      },
    },
  ],
}