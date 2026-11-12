import type { ComponentType } from 'react';
import { CryptDoc } from './CryptDoc';
import { HauntedInkDoc } from './HauntedInkDoc';
import { MediumDoc } from './MediumDoc';
import { NecromancerDoc } from './NecromancerDoc';
import type { RiteDocId } from './paths';
import { PoltergeistDoc } from './PoltergeistDoc';
import { SeanceDoc } from './SeanceDoc';
import { SoulReaderDoc } from './SoulReaderDoc';
import { VigilDoc } from './VigilDoc';

/** Each rite's docs page, by id. */
export const RITE_DOCS: Record<RiteDocId, ComponentType> = {
  medium: MediumDoc,
  'soul-reader': SoulReaderDoc,
  'haunted-ink': HauntedInkDoc,
  vigil: VigilDoc,
  necromancer: NecromancerDoc,
  seance: SeanceDoc,
  poltergeist: PoltergeistDoc,
  crypt: CryptDoc,
};
