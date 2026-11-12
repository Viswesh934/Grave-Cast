import type { ComponentType } from 'react';
import { HauntedInkDoc } from './HauntedInkDoc';
import { MediumDoc } from './MediumDoc';
import type { RiteDocId } from './paths';
import { SoulReaderDoc } from './SoulReaderDoc';
import { VigilDoc } from './VigilDoc';

/** Each rite's docs page, by id. */
export const RITE_DOCS: Record<RiteDocId, ComponentType> = {
  medium: MediumDoc,
  'soul-reader': SoulReaderDoc,
  'haunted-ink': HauntedInkDoc,
  vigil: VigilDoc,
};
